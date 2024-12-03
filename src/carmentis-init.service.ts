import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sdk from './carmentis-application-sdk';

@Injectable()
export class CarmentisInitService implements OnModuleInit {
    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        console.log('Initializing Carmentis SDK...');
        sdk.initialize({
            host: this.configService.get<string>('OPERATOR_HOST'),
            port: this.configService.get<number>('OPERATOR_PORT'),
        });
    }
}
