import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS so the Next.js frontend (localhost:3000) can call the API
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    credentials: true,
  });

  await app.listen(3001);
  console.log('Backend listening on http://localhost:3001');
}
bootstrap();
