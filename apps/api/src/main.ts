import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtSecret = process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'replace-with-a-long-random-secret') {
    throw new Error('JWT_ACCESS_SECRET must be configured with at least 32 random characters');
  }

  app.enableCors({ origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`[NestJS API] Server listening at http://127.0.0.1:${port} and http://localhost:${port}`);
}
void bootstrap();
