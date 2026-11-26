export interface FavoritesStorage {
  /** Returns null when there are no valid stored favorites. */
  load(): number[] | null;
  save(favorites: readonly number[]): void;
}
