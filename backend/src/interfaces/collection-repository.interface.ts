import type { Collection } from '../entities/collection.entity';
import type { DiscoveryOrigin } from '../entities/enums/discovery-origin';

export const COLLECTION_REPOSITORY = Symbol('ICollectionRepository');

export interface KnownCardDiscovery {
  pokemonId: number;
  origin: DiscoveryOrigin;
  discoveredAt: Date;
}

export interface ICollectionRepository {
  findByPlayerId(playerId: number): Promise<Collection | null>;

  getOrCreate(playerId: number): Promise<Collection>;
  
  registerKnownCards(
    collectionId: string,
    discoveries: readonly KnownCardDiscovery[],
  ): Promise<void>;
}
