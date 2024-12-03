import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

const DEFAULT_LISTENING_PORT = 3000;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useStaticAssets('assets', {
        prefix: '/assets/',
    });
    app.useStaticAssets('downloads', {
        prefix: '/downloads/',
    });
    app.setBaseViewsDir('views');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    app.setViewEngine('pug');

    await app.listen(process.env.PORT ?? DEFAULT_LISTENING_PORT);
}

bootstrap();
