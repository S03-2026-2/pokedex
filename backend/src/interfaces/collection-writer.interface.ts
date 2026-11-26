import type { DiscoveryOrigin } from '../entities/enums/discovery-origin';

export const COLLECTION_WRITER = Symbol('ICollectionWriter');

export interface ICollectionWriter {
  addCard(
    playerId: number,
    pokemonId: number,
    origin: DiscoveryOrigin,
    discoveredAt: Date,
  ): Promise<boolean>;
}
