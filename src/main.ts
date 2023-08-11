import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  if (process.env.CORS == 'true') {
    app.enableCors({
      allowedHeaders: 'content-type',
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  await app.listen(8000);
}
bootstrap();
