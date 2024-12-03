import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { FileSubmissionService } from './providers/FileSubmissionService';
import { CarmentisInitService } from './carmentis-init.service';
import { join } from 'path';
import { EmailService } from './providers/email.service';
import { FileSendController } from './file-send/fileSend.controller';
import { ReviewController } from './review/review.controller';
import { FileDownloadController } from './fileDownload/fileDownload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './providers/transaction.service';
import { TransactionEntry } from './entities/transactionEntry';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'database.sqlite',
            entities: [TransactionEntry],
        }),
        TypeOrmModule.forFeature([TransactionEntry]),
    ],
    controllers: [
        AppController,
        FileSendController,
        ReviewController,
        FileDownloadController,
    ],
    providers: [
        TransactionService,
        FileSubmissionService,
        CarmentisInitService,
        EmailService,
        {
            provide: 'VIEWS_DIR',
            useValue: join(__dirname, 'views'),
        },
        {
            provide: 'DOWNLOADS_DIR',
            useValue: join(__dirname, 'downloads'),
        },
    ],
    exports: ['VIEWS_DIR'],
})
export class AppModule {}
