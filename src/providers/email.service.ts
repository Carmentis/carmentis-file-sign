import { Inject, Injectable } from '@nestjs/common';
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

    constructor(
        private envVariables: ConfigVariablesService,
        @Inject('VIEWS_DIR') private readonly viewsDir: string,
    ) {
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
