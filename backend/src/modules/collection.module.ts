import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from '../entities/collection.entity';
import { KnownCard } from '../entities/known-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, KnownCard])],
})
export class CollectionModule {}
