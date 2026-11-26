import { ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { Collection } from '../entities/collection.entity';
import { KnownCard } from '../entities/known-card.entity';

export function getDatabaseOptions(config: ConfigService): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.getOrThrow<string>('DATABASE_HOST'),
    port: Number(config.getOrThrow<string>('DATABASE_PORT')),
    username: config.getOrThrow<string>('DATABASE_USER'),
    password: config.getOrThrow<string>('DATABASE_PASSWORD'),
    database: config.getOrThrow<string>('DATABASE_NAME'),
    synchronize: false,
  };
}

if (existsSync('.env')) {
  loadEnvFile();
}

export default new DataSource({
  ...getDatabaseOptions(new ConfigService()),
  entities: [Collection, KnownCard],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
