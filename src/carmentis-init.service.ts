import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from './carmentis-application-sdk';

@Injectable()
export class CarmentisInitService implements OnModuleInit {
    private readonly logger = new Logger(CarmentisInitService.name);
    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.logger.log('Initializing Carmentis SDK...');
        sdk.initialize({
            host: this.configService.get<string>('OPERATOR_HOST'),
            port: this.configService.get<number>('OPERATOR_PORT'),
        });
    }
}
