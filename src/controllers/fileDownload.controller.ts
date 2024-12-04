import { Controller, Get, Logger, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { TransactionService } from '../providers/transaction.service';
import * as process from 'node:process';
import { Transaction } from '../entities/transaction';

@Controller('download')
export class FileDownloadController {
    private readonly logger = new Logger(FileDownloadController.name);

    constructor(private readonly transactionService: TransactionService) {}

    /**
     * Returns the file associated to the record identifier.
     *
     * @param fileSignId The identifier of the file sign transaction.
     * @param res The response used to send a file.
     */
    @Get(':fileSignId')
    async download(
        @Param('fileSignId') fileSignId: string,
        @Res() res: Response,
    ) {
        // load the transaction
        const transaction: Transaction =
            await this.transactionService.getTransaction(fileSignId);
        this.logger.log(
            `Access to file ${transaction.path} for id ${fileSignId}`,
        );

        // respond with the file
        const path = join(process.cwd(), transaction.path);
        const originalFilename = transaction.originalName;
        res.set(
            'Content-Disposition',
            `attachment; filename="${originalFilename}"`,
        );
        res.sendFile(path);
    }
}
