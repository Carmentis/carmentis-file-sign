import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigVariablesService implements OnModuleInit {
    private readonly logger = new Logger(ConfigVariablesService.name);

    constructor(private readonly configService: ConfigService) {}

    private _defaultApplicationId: string;
    private _defaultApplicationVersion: number;
    private _operatorHost: string;
    private _operatorPort: number;
    private _smtpHost: string;
    private _smtpPort: number;
    private _smtpUser: string;
    private _smtpPassword: string;

    async onModuleInit() {
        this._defaultApplicationId = this.configService.getOrThrow<string>(
            'DEFAULT_APPLICATION_ID',
        );
        this._defaultApplicationVersion = this.configService.getOrThrow<number>(
            'DEFAULT_APPLICATION_VERSION',
        );
        this._operatorHost =
            this.configService.getOrThrow<string>('OPERATOR_HOST');
        this._operatorPort =
            this.configService.getOrThrow<number>('OPERATOR_PORT');
        this._smtpHost = this.configService.getOrThrow<string>('SMTP_HOST');
        this._smtpPort = this.configService.getOrThrow<number>('SMTP_PORT');
        this._smtpUser = this.configService.getOrThrow<string>('SMTP_USER');
        this._smtpPassword = this.configService.getOrThrow<string>('SMTP_PASS');
    }

    get operatorHost(): string {
        return this._operatorHost;
    }

    get operatorPort(): number {
        return this._operatorPort;
    }

    get smtpHost(): string {
        return this._smtpHost;
    }

    get smtpPort(): number {
        return this._smtpPort;
    }

    get smtpUser(): string {
        return this._smtpUser;
    }

    get smtpPassword(): string {
        return this._smtpPassword;
    }

    get defaultApplicationId(): string {
        return this._defaultApplicationId;
    }

    get defaultApplicationVersion(): number {
        return this._defaultApplicationVersion;
    }
}
