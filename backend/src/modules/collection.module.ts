import { Module, type DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionController } from '../controllers/collection.controller';
import { CollectionRepository } from '../database/repositories/collection.repository';
import { Collection } from '../entities/collection.entity';
import { KnownCard } from '../entities/known-card.entity';
import { CardEventConsumer } from '../events/consumers/card-event.consumer';
import { CARD_EVENT_SOURCE } from '../events/interfaces/card-event-source.interface';
import { SimulationController } from '../events/simulation/simulation.controller';
import { FakeCardEventSource } from '../events/sources/fake-card-event.source';
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
    FakeCardEventSource,
    { provide: CARD_EVENT_SOURCE, useExisting: FakeCardEventSource },
    CardEventConsumer,
  ],
  exports: [COLLECTION_REPOSITORY, COLLECTION_READER, COLLECTION_WRITER],
})
export class CollectionModule {
  static async register(): Promise<DynamicModule> {
    await ConfigModule.envVariablesLoaded;

    return {
      module: CollectionModule,
      controllers:
        process.env.SIMULATION_ENABLED === 'true' ? [SimulationController] : [],
    };
  }
}
