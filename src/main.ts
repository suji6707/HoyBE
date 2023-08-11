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
  app.enableCors({
    allowedHeaders: 'content-type',
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  await app.listen(8000);
}
bootstrap();
