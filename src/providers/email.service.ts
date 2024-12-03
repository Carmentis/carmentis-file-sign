import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as pug from 'pug';
import * as process from 'node:process';

export interface EmailObject {
    senderEmail: string;
    receiverEmail: string;
    fileAccessLink: string;
}

@Injectable()
export class EmailService {
    private transporter;

    constructor(
        private configService: ConfigService,
        @Inject('VIEWS_DIR') private readonly viewsDir: string,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: true,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    // Method to send an email
    async sendEmail(email: EmailObject): Promise<void> {
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
