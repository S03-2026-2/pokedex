import { Inject, Injectable } from '@nestjs/common';
import type { DiscoveryOrigin } from '../entities/enums/discovery-origin';
import type { KnownCard } from '../entities/known-card.entity';
import type { ICollectionReader } from '../interfaces/collection-reader.interface';
import { COLLECTION_REPOSITORY } from '../interfaces/collection-repository.interface';
import type { ICollectionRepository } from '../interfaces/collection-repository.interface';
import type { ICollectionWriter } from '../interfaces/collection-writer.interface';

@Injectable()
export class CollectionService implements ICollectionReader, ICollectionWriter {
  constructor(
    @Inject(COLLECTION_REPOSITORY)
    private readonly repository: ICollectionRepository,
  ) {}

  async viewCollection(playerId: number): Promise<KnownCard[]> {
    const collection = await this.repository.findByPlayerId(playerId);
    return collection?.knownCards ?? [];
  }

  async knowsPokemon(playerId: number, pokemonId: number): Promise<boolean> {
    const knownCards = await this.viewCollection(playerId);
    return knownCards.some((card) => card.pokemonId === pokemonId);
  }

  async addCard(
    playerId: number,
    pokemonId: number,
    origin: DiscoveryOrigin,
    discoveredAt: Date,
  ): Promise<boolean> {
    const collection = await this.repository.getOrCreate(playerId);
    if (collection.knownCards.some((card) => card.pokemonId === pokemonId)) {
      return false;
    }

    await this.repository.registerKnownCards(collection.id, [
      { pokemonId, origin, discoveredAt },
    ]);
    return true;
  }
}
