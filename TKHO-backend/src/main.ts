import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { static as expressStatic } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  await fs.mkdir(join(uploadsRoot, 'venues'), { recursive: true });
  await fs.mkdir(join(uploadsRoot, 'display'), { recursive: true });

  app.enableCors({ origin: true, credentials: true });
  app.use('/api/uploads', expressStatic(uploadsRoot));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('TKHO Booking API')
    .setDescription('Nest migration backend for TKHO booking system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || 3210);
  await app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}

bootstrap();
