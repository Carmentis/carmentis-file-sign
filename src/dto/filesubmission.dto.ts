import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FileSubmissionDto {
    @IsString()
    readonly appId: string;

    @IsInt()
    @Type(() => Number)
    readonly appVersion: number;

    @IsString()
    readonly comment: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly senderEmail: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly recipientEmail: string;
}
