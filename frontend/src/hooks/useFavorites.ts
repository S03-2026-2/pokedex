import { useCallback, useEffect, useState } from "react";
import type { FavoritesStorage } from "../providers/favorites-storage";

function readFavorites(storage: FavoritesStorage): number[] {
  try {
    const saved = storage.load();
    if (saved !== null) return saved;
  } catch {
    // Favorites remain usable in memory when storage is unavailable.
  }
  return [25, 6, 150];
}

export function useFavorites(storage: FavoritesStorage) {
  const [state, setState] = useState(() => ({ storage, ids: readFavorites(storage) }));
  const [storageFailed, setStorageFailed] = useState(false);
  const { ids } = state;

  useEffect(() => {
    if (state.storage !== storage) {
      setState({ storage, ids: readFavorites(storage) });
      return;
    }

    try {
      storage.save(ids);
      setStorageFailed(false);
    } catch (error) {
      console.warn("Falha ao salvar os favoritos.", error);
      setStorageFailed(true);
    }
  }, [ids, state.storage, storage]);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);
  const toggleFavorite = (id: number) => {
    setState((previous) => ({
      storage: previous.storage,
      ids: previous.ids.includes(id)
        ? previous.ids.filter((item) => item !== id)
        : [...previous.ids, id],
    }));
  };

  return { count: ids.length, isFavorite, toggleFavorite, storageFailed };
}
