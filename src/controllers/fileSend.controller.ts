import { ConfigService } from '@nestjs/config';
import { PrepareUserApprovalData } from '../providers/fileSubmission.service';
import { EmailService } from '../providers/email.service';
import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Render,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileSubmissionDto } from '../dto/filesubmission.dto';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as sdk from '../carmentis-application-sdk';
import { TransactionService } from '../providers/transaction.service';
import { Fields, Transaction } from '../entities/transaction';

@Controller('send')
export class FileSendController {
    constructor(
        private readonly configService: ConfigService,
        private readonly transactionService: TransactionService,
        private readonly emailService: EmailService,
    ) {}

    @Get()
    @Render('index')
    index() {
        const appId = this.configService.get<string>('APPLICATION_ID');
        const appVersion = this.configService.get<string>(
            'APPLICATION_VERSION',
        );
        return {
            applicationId: appId,
            applicationVersion: appVersion,
        };
    }

    /**
     * Handles file upload submission.
     *
     * This endpoint receives a file along with additional form data (email addresses and comment)
     * from the client. The file is stored in the server's `uploads` directory with a unique filename
     * based on the current timestamp, and the additional data is captured in the form of a DTO.
     *
     * @param file - The uploaded file, processed by Multer's FileInterceptor.
     * @param fileSubmissionDto - A DTO that contains the additional form data (email addresses and comment).
     * @param res - The response to the request.
     */
    @Post('/submitFile')
    @UseInterceptors(
        FileInterceptor('fileToSign', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const ext = extname(file.originalname); // Extract the file's extension
                    const filename = `${Date.now()}${ext}`; // Generate a unique filename using the current timestamp
                    cb(null, filename); // Call the callback with the new filename
                },
            }),
        }),
    )
    async processFileSubmission(
        @UploadedFile() file: Express.Multer.File, // The uploaded file object
        @Body() fileSubmissionDto: FileSubmissionDto,
        @Res() res: Response,
    ): Promise<void> {
        // generate a random identifier for the current transaction.
        const fileSignId =
            'FS' + ((Math.random() * 1e15) | 0).toString().padStart(6, '0');

        // create the fields
        const fileContent = fs.readFileSync(file.path);
        const field: Fields = {
            transactionId: fileSignId,
            senderDocument: {
                file: {
                    name: file.originalname,
                    size: file.size,
                    crc32: sdk.crc32(fileContent),
                    sha256: await sdk.sha256(fileContent),
                },
                senderEmail: fileSubmissionDto.senderEmail,
                recipientEmail: fileSubmissionDto.recipientEmail,
            },
        };

        // set the application id and the version
        const appId: string = fileSubmissionDto.appId,
            appVersion: number = fileSubmissionDto.appVersion;

        // set the prepare user approval data
        const userApprovalData: PrepareUserApprovalData = {
            application: appId,
            version: appVersion,
            fields: field,
            actors: [
                {
                    name: 'sender',
                },
                {
                    name: 'recipient',
                },
            ],
            channels: ['mainChannel', 'senderChannel', 'recipientChannel'],
            subscriptions: {
                sender: ['mainChannel', 'senderChannel'],
                recipient: ['mainChannel', 'recipientChannel'],
            },
            permissions: {
                mainChannel: ['senderDocument.file'],
                senderChannel: ['senderDocument.senderEmail'],
                recipientChannel: ['senderDocument.recipientEmail'],
            },
            approval: {
                actor: 'sender',
                message: 'fileSent',
            },
        };
        try {
            const answer = await sdk.query(
                'prepareUserApproval',
                userApprovalData,
            );

            if (!answer.success) {
                throw new HttpException(
                    'Invalid request send to operator',
                    HttpStatus.FORBIDDEN,
                );
            }

            const recordId = answer.data.recordId;
            const transaction: Transaction = {
                id: fileSignId,
                application: {
                    id: appId,
                    version: appVersion,
                },
                field: field,
                filename: file.filename,
                path: file.path,
                originalName: file.originalname,
                recordId: recordId,
                mailSent: false,
                senderEmail: fileSubmissionDto.senderEmail,
                recipientEmail: fileSubmissionDto.recipientEmail,
            };
            console.log("add transaction: ", transaction)
            await this.transactionService.addTransaction(transaction);

            res.redirect(`/send/confirmFile/${fileSignId}`);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    @Get('/confirmFile/:fileSignId')
    @Render('confirmFile')
    async confirmFile(@Param('fileSignId') fileSignId: string) {
        const transaction: Transaction =
            await this.transactionService.getTransaction(fileSignId);

        const applicationId = transaction.application.id;
        const recordId = transaction.recordId;
        const id = `${applicationId}-${recordId}`;

        return {
            id: id,
            fileSignId: fileSignId,
            recordId: recordId,
            applicationId: transaction.application.id,
            applicationVersion: transaction.application.version,
        };
    }

    @Render('fileSent')
    @Get('/success/:fileSignId')
    async fileSent(
        @Param('fileSignId') fileSignId: string,
        @Req() request: Request,
        @Res() res: Response,
    ) {
        const transaction: Transaction =
            await this.transactionService.getTransaction(fileSignId);

        if (!transaction.mailSent) {
            // Send email if not already sent
            const fileAccessUrl = `${request.protocol}://${request.hostname}:${request.socket.localPort}/review/authenticate/${fileSignId}`;
            await this.emailService.sendEmail({
                fileAccessLink: fileAccessUrl,
                receiverEmail: transaction.recipientEmail,
                senderEmail: transaction.senderEmail,
            });
            transaction.mailSent = true;
        }

        const answer = await sdk.query('getRecordInformation', {
            recordId: transaction.recordId,
        });

        if (!answer.success) {
            res.send(JSON.stringify(answer));
            return;
        }

        transaction.flowId = answer.data.flowId;
        await this.transactionService.updateTransaction(transaction);
    }
}