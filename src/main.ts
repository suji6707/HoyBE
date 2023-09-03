import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV == 'development') {
    const config = new DocumentBuilder()
      .setTitle('test')
      .setDescription('test API')
      .setVersion('1.0')
      .addServer('http://localhost:8000/api')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'JWT',
          in: 'header',
        },
        'Authorization',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  if (process.env.CORS == 'true') {
    app.enableCors({
      allowedHeaders: ['content-type', 'authorization'],
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });
  } else {
    app.enableCors();
  }

  app.setGlobalPrefix('api');
  await app.listen(8000);
}
bootstrap();
