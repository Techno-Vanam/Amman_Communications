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
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!jwtSecret || jwtSecret.length < 32 || !refreshSecret || refreshSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must each contain at least 32 random characters');
  }

  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

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

  // Write swagger.json file for Postman / Swagger tooling
  const swaggerJsonPath = path.resolve(process.cwd(), '../../swagger.json');
  try {
    fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
  } catch {
    fs.writeFileSync(path.resolve(process.cwd(), 'swagger.json'), JSON.stringify(document, null, 2));
  }

  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
