import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CarmentisInitService } from './carmentis-init.service';
import { join } from 'path';
import { EmailService } from './providers/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './providers/transaction.service';
import { TransactionEntry } from './entities/transactionEntry';
import { FileSendController } from './controllers/fileSend.controller';
import { FileReviewController } from './controllers/fileReview.controller';
import { FileDownloadController } from './controllers/fileDownload.controller';
import { ConfigVariablesService } from './configVariables.service';
import { RewriteRootToSendMiddleware } from './middlewares/redirect.middleware';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'storage/database.sqlite',
            entities: [TransactionEntry],
            synchronize: true, // Automatically create database schema
        }),
        TypeOrmModule.forFeature([TransactionEntry]),
    ],
    controllers: [
        FileSendController,
        FileReviewController,
        FileDownloadController,
    ],
    providers: [
        ConfigVariablesService,
        TransactionService,
        CarmentisInitService,
        EmailService,
        {
            provide: 'VIEWS_DIR',
            useValue: join(__dirname, 'views'),
        },
    ],
    exports: ['VIEWS_DIR'],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RewriteRootToSendMiddleware)
            .forRoutes({ path: '/', method: RequestMethod.ALL });
    }
}
