import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionController } from '../controllers/collection.controller';
import { CollectionRepository } from '../database/repositories/collection.repository';
import { Collection } from '../entities/collection.entity';
import { KnownCard } from '../entities/known-card.entity';
import { COLLECTION_READER } from '../interfaces/collection-reader.interface';
import { COLLECTION_REPOSITORY } from '../interfaces/collection-repository.interface';
import { COLLECTION_WRITER } from '../interfaces/collection-writer.interface';
import { CollectionService } from '../services/collection.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, KnownCard])],
  controllers: [CollectionController],
  providers: [
    { provide: COLLECTION_REPOSITORY, useClass: CollectionRepository },
    CollectionService,
    { provide: COLLECTION_READER, useExisting: CollectionService },
    { provide: COLLECTION_WRITER, useExisting: CollectionService },
  ],
  exports: [COLLECTION_REPOSITORY, COLLECTION_READER, COLLECTION_WRITER],
})
export class CollectionModule {}
