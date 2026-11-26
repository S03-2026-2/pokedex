import { z } from "zod";
import type { FavoritesStorage } from "../../providers/favorites-storage";

const FAVORITES_KEY = "cyberdex_favs";
const favoritesSchema = z.array(z.number().int().positive());

export class LocalStorageFavoritesAdapter implements FavoritesStorage {
  load(): number[] | null {
    const saved = window.localStorage.getItem(FAVORITES_KEY);
    if (saved === null) return null;

    try {
      const data: unknown = JSON.parse(saved);
      const parsed = favoritesSchema.safeParse(data);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  save(favorites: readonly number[]): void {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}
