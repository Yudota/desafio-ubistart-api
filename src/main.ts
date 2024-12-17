import { NestFactory } from '@nestjs/core';
import { UserModule } from './user/user.module';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
