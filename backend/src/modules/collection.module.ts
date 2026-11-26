import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionRepository } from '../database/repositories/collection.repository';
import { Collection } from '../entities/collection.entity';
import { KnownCard } from '../entities/known-card.entity';
import { COLLECTION_REPOSITORY } from '../interfaces/collection-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, KnownCard])],
  providers: [
    { provide: COLLECTION_REPOSITORY, useClass: CollectionRepository },
  ],
  exports: [COLLECTION_REPOSITORY],
})
export class CollectionModule {}
