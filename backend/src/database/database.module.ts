import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Load the CLI data source after Nest has loaded the environment.
        const { getDatabaseOptions } =
          require('./data-source') as typeof import('./data-source');
        return { ...getDatabaseOptions(config), autoLoadEntities: true };
      },
    }),
  ],
})
export class DatabaseModule {}
