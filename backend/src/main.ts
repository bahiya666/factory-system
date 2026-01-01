import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for the frontend dev server
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
