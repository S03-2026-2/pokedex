import type { Collection } from "../types/collection";

export interface CollectionProvider {
  getCollection(playerId: number, signal?: AbortSignal): Promise<Collection>;
}
