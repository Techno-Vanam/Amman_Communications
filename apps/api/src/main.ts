import fs from 'node:fs';
import path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  
  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Amman Communications API')
    .setDescription('API documentation and interactive endpoint specification for Amman Communications Business Platform.')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter Admin JWT access token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  try {
    fs.writeFileSync(path.resolve(__dirname, '../../backend_endpoints.json'), JSON.stringify(document, null, 2));
  } catch {
    fs.writeFileSync(path.resolve(process.cwd(), 'swagger.json'), JSON.stringify(document, null, 2));
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`[NestJS API] Server listening at http://127.0.0.1:${port} and http://localhost:${port}`);
}
void bootstrap();
