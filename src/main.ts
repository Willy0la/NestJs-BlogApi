import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const PORT = config.get<number>('PORT', 3000);

  await app.listen(PORT);

  console.log(`Server is listening on http://localhost:${PORT}`);
}
void bootstrap();
