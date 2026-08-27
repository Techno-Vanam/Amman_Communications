import path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'replace-with-a-long-random-secret') {
    throw new Error('JWT_ACCESS_SECRET must be configured with at least 32 random characters');
  }

  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({ origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
