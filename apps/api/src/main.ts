import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'replace-with-a-long-random-secret') {
    throw new Error('JWT_ACCESS_SECRET must be configured with at least 32 random characters');
  }

  app.enableCors({ origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  const config = new DocumentBuilder()
    .setTitle('Amman Communications API')
    .setDescription('The Amman Communications backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
