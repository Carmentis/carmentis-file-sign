import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Render,
    Req,
    Res,
} from '@nestjs/common';
import { Request } from 'express';
import { Transaction } from '../providers/FileSubmissionService';
import { TransactionService } from '../providers/transaction.service';
import { Response } from 'express';
import { ReviewSubmissionDto } from '../dto/reviewSubmission.dto';
import * as sdk from '../carmentis-application-sdk';

@Controller('review')
export class ReviewController {
    constructor(
        private readonly transactionService: TransactionService,
        @Inject('DOWNLOADS_DIR') private readonly downloadDir: string,
    ) {}

    /**
     * This function is called when a user attempts to review a file and should
     * be authenticated before to perform the review.
     * @param recordId
     */
    @Render('reviewAuthentication')
    @Get('authenticate/:recordId')
    async review(@Param('recordId') recordId: string) {
        try {
            const transaction =
                await this.transactionService.getTransaction(recordId);

            return {
                appId: transaction.application.id,
                appVersion: transaction.application.version,
                recordId: recordId,
                id: recordId,
                sender: transaction.field.senderDocument.senderEmail,
            };
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('review/:recordId/:proof')
    @Render('review')
    async fileAccess(
        @Param('recordId') recordId: string,
        @Param('proof') serializedProof: string,
        @Req() request: Request,
        @Res() res: Response,
    ) {
        // check that the proof exists, otherwise redirect to authentication
        if (!serializedProof) {
            return res.redirect(`/review/authenticate/${recordId}`);
        }

        // get the transaction
        const transaction: Transaction =
            await this.transactionService.getTransaction(recordId);
        const proof = JSON.parse(
            Buffer.from(serializedProof, 'base64').toString('utf-8'),
        );
        console.log('checking email');
        // check the email of the user trying to access the file.
        const email = proof.email.trim().toLowerCase();
        const recipientEmail = transaction.field.senderDocument.recipientEmail
            .trim()
            .toLowerCase();
        if (email != recipientEmail) {
            throw new HttpException('Cannot access file', HttpStatus.FORBIDDEN);
        }

        // render the page with the link to access the file
        const downloadUrl = `${request.protocol}://${request.hostname}:${request.socket.localPort}/download/${recordId}`;
        const id = `${transaction.application.id}-${recordId}`;
        return {
            appId: transaction.application.id,
            appVersion: transaction.application.version,
            id: id,
            recordId: recordId,
            sender: transaction.field.senderDocument.senderEmail,
            url: downloadUrl,
        };
    }

    @Post('review/:recordId/')
    @Render('confirmReview')
    async reviewApproval(
        @Param('recordId') recordId: string,
        @Body() reviewSubmissionDto: ReviewSubmissionDto,
        @Res() response: Response,
    ) {
        console.log(reviewSubmissionDto);
        // TODO check authentication of the user
        const transaction: Transaction =
            await this.transactionService.getTransaction(recordId);

        const field = {
            recipientAnswer: {
                comment: reviewSubmissionDto.comment,
                status: reviewSubmissionDto.answer,
            },
        };

        // set the prepare user approval data
        const userApprovalData = {
            application: transaction.application.id,
            version: transaction.application.version,
            flowId: transaction.flowId,
            fields: field,
            permissions: {
                mainChannel: ['*'],
            },
            approval: {
                actor: 'recipient',
                message:
                    reviewSubmissionDto.answer === 'accepted'
                        ? 'accept'
                        : 'decline',
            },
        };
        const answer = await sdk.query('prepareUserApproval', userApprovalData);
        const reviewRecordId = answer.data.recordId;

        if (!answer.success) {
            throw new HttpException(
                'Invalid request send to operator',
                HttpStatus.FORBIDDEN,
            );
        }
        const applicationId = transaction.application.id;
        const id = `${applicationId}-${reviewRecordId}`;

        return {
            id: id,
            recordId: reviewRecordId,
            flowId: transaction.flowId,
            applicationId: transaction.application.id,
            applicationVersion: transaction.application.version,
        };
    }

    @Get('/success')
    @Render('success')
    async successReview() {
        return {
            title: 'Review Done',
            message: 'Your review has been successfully performed.',
        };
    }
}
