import type { KnownCard } from '../entities/known-card.entity';

export const COLLECTION_READER = Symbol('ICollectionReader');

export interface ICollectionReader {
  viewCollection(playerId: number): Promise<KnownCard[]>;

  knowsPokemon(playerId: number, pokemonId: number): Promise<boolean>;
}
