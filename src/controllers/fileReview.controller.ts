import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    Render,
    Req,
    Res,
} from '@nestjs/common';
import { Request } from 'express';
import { Transaction } from '../providers/fileSubmission.service';
import { TransactionService } from '../providers/transaction.service';
import { Response } from 'express';
import { ReviewSubmissionDto } from '../dto/reviewSubmission.dto';
import * as sdk from '../carmentis-application-sdk';

@Controller('review')
export class FileReviewController {
    private readonly logger = new Logger(FileReviewController.name);

    constructor(private readonly transactionService: TransactionService) {}

    /**
     * This function is called when a user attempts to review a file and should
     * be authenticated before to perform the review.
     * @param fileSignId
     */
    @Render('reviewAuthentication')
    @Get('authenticate/:fileSignId')
    async review(@Param('fileSignId') fileSignId: string) {
        try {
            const transaction =
                await this.transactionService.getTransaction(fileSignId);

            return {
                appId: transaction.application.id,
                appVersion: transaction.application.version,
                fileSignId: fileSignId,
                recordId: transaction.recordId,
                id: transaction.recordId,
                sender: transaction.field.senderDocument.senderEmail,
            };
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('review/:fileSignId/:proof')
    @Render('review')
    async fileAccess(
        @Param('fileSignId') fileSignId: string,
        @Param('proof') serializedProof: string,
        @Req() request: Request,
        @Res() res: Response,
    ) {
        // check that the proof exists, otherwise redirect to authentication
        if (!serializedProof) {
            this.logger.log(
                `Access to review denied for id ${fileSignId}: No proof provided`,
            );
            return res.redirect(`/review/authenticate/${fileSignId}`);
        }

        // get the transaction
        const transaction: Transaction =
            await this.transactionService.getTransaction(fileSignId);
        const proof = JSON.parse(
            Buffer.from(serializedProof, 'base64').toString('utf-8'),
        );

        // check the email of the user trying to access the file.
        const email = proof.email.trim().toLowerCase();
        const recipientEmail = transaction.field.senderDocument.recipientEmail
            .trim()
            .toLowerCase();
        if (email != recipientEmail) {
            this.logger.log(
                `Access to review denied for id ${fileSignId}: No correspondence with expected email`,
            );
            throw new HttpException('Cannot access file', HttpStatus.FORBIDDEN);
        }

        // render the page with the link to access the file
        const downloadUrl = `${request.protocol}://${request.hostname}:${request.socket.localPort}/download/${fileSignId}`;
        const id = `${transaction.application.id}-${fileSignId}`;
        return {
            appId: transaction.application.id,
            appVersion: transaction.application.version,
            id: id,
            fileSignId: fileSignId,
            recordId: transaction.recordId,
            sender: transaction.field.senderDocument.senderEmail,
            url: downloadUrl,
        };
    }

    @Post('review/:fileSignId/')
    @Render('confirmReview')
    async reviewApproval(
        @Param('fileSignId') fileSignId: string,
        @Body() reviewSubmissionDto: ReviewSubmissionDto,
    ) {
        this.logger.log(`Receiving review for id ${fileSignId}`);

        // TODO check authentication of the user
        const transaction: Transaction =
            await this.transactionService.getTransaction(fileSignId);

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
            this.logger.error(
                `Invalid operator response received for id ${fileSignId}:`,
                answer,
            );
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
