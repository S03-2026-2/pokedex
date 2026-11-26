import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const frontendOrigin = config.get<string>(
    'FRONTEND_ORIGIN',
    'http://localhost:5173',
  );
  app.enableCors({ origin: [frontendOrigin] });

  await app.listen(Number(config.getOrThrow('PORT')));
}

bootstrap();
