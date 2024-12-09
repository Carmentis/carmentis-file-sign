import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as pug from 'pug';
import * as process from 'node:process';
import { ConfigVariablesService } from '../configVariables.service';

export interface EmailObject {
    senderEmail: string;
    receiverEmail: string;
    fileAccessLink: string;
}

@Injectable()
export class EmailService {
    private transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private envVariables: ConfigVariablesService,
        @Inject('VIEWS_DIR') private readonly viewsDir: string,
    ) {
        // initiates the transporter if the environments variables allow it
        const host: string | null = this.envVariables.smtpHost;
        const port: number | null = this.envVariables.smtpPort;
        const username: string | null = this.envVariables.smtpUser;
        const password: string | null = this.envVariables.smtpPassword;

        if (!host || !port || !username || !password) {
            this.logger.log('Missing SMTP configuration: skipping SMTP init.');
        } else {
            this.logger.log(`SMTP Host: ${this.envVariables.smtpHost}`);
            this.logger.log(`SMTP Port: ${this.envVariables.smtpPort}`);
            this.logger.log(`SMTP User: ${this.envVariables.smtpUser}`);

            this.transporter = nodemailer.createTransport({
                host: this.envVariables.smtpHost,
                port: this.envVariables.smtpPort,
                secure: true,
                auth: {
                    user: this.envVariables.smtpUser,
                    pass: this.envVariables.smtpPassword,
                },
            });
        }
    }

    isConfigured(): boolean {
        return this.transporter !== undefined;
    }

    // Method to send an email
    async sendEmail(email: EmailObject): Promise<void> {
        // halt if transporter not configured
        if (!this.isConfigured()) {
            throw new Error(
                'Trying to send an email without having configured the SMTP transporter. Have you provided the SMTP variables?',
            );
        }

        const filePath = join(
            process.cwd(),
            'views',
            'templates',
            'FileReview.email.pug',
        ); // Use the injected path
        const render = pug.compileFile(filePath);
        const html = render({
            link: email.fileAccessLink,
        });

        const obj = {
            from: 'info@carmentis.io',
            to: email.receiverEmail,
            subject: 'You have a file to review',
            html: html,
        };

        const res = await this.transporter.sendMail(obj);

        return res;
    }
}
