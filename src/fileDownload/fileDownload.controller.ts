import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileSubmissionService } from '../providers/FileSubmissionService';
import { join } from 'path';
import { TransactionService } from '../providers/transaction.service';
import * as process from 'node:process';
import { Transaction } from '../entities/transaction';

@Controller('download')
export class FileDownloadController {
    constructor(private readonly transactionService: TransactionService) {}

    /**
     * Returns the file associated to the record identifier.
     *
     * @param recordId The identifier of the record.
     * @param res The response used to send a file.
     */
    @Get(':recordId')
    async download(@Param('recordId') recordId: string, @Res() res: Response) {
        const transaction: Transaction =
            await this.transactionService.getTransaction(recordId);
        const path = join(process.cwd(), transaction.path);
        const originalFilename = transaction.originalName;
        res.set(
            'Content-Disposition',
            `attachment; filename="${originalFilename}"`,
        );
        res.sendFile(path);
    }
}
