import type { PokemonProvider } from "../../providers/pokemon-provider";
import { normalizePokemonLookup } from "../../providers/pokemon-provider";
import type {
  PokemonDetails,
  PokemonIndexEntry,
  PokemonPage,
  PokemonSummary,
} from "../../types/pokemon";

const DEFAULT_TTL_MS = 10 * 60 * 1000;

type CachedEntry<T> = { status: "cached"; value: T; expiresAt: number; version: number };
type PendingEntry<T> = {
  status: "pending";
  promise: Promise<T>;
  controller: AbortController;
  consumers: number;
};
type CacheEntry<T> = CachedEntry<T> | PendingEntry<T>;

export class CachedPokemonProvider implements PokemonProvider {
  private readonly index = new Map<number, CacheEntry<PokemonIndexEntry[]>>();
  private readonly pages = new Map<string, CacheEntry<PokemonPage>>();
  private readonly pokemon = new Map<string, CacheEntry<PokemonSummary | null>>();
  private readonly types = new Map<string, CacheEntry<string[]>>();
  private readonly details = new Map<number, CacheEntry<PokemonDetails>>();
  private requestVersion = 0;

  constructor(
    private readonly provider: PokemonProvider,
    private readonly ttlMs = DEFAULT_TTL_MS,
  ) {
    if (!Number.isFinite(ttlMs) || ttlMs < 0) {
      throw new RangeError("O TTL do cache deve ser um número finito e não negativo.");
    }
  }

  getPokemonIndex(limit: number, signal?: AbortSignal): Promise<PokemonIndexEntry[]> {
    return this.getOrLoad(this.index, limit, (sharedSignal) =>
      this.provider.getPokemonIndex(limit, sharedSignal), signal);
  }

  getPokemonPage(offset: number, limit: number, signal?: AbortSignal): Promise<PokemonPage> {
    return this.getOrLoad(this.pages, `${offset}:${limit}`, (sharedSignal) =>
      this.provider.getPokemonPage(offset, limit, sharedSignal), signal);
  }

  getPokemonByType(type: string, signal?: AbortSignal): Promise<string[]> {
    const key = type.trim().toLowerCase();
    return this.getOrLoad(this.types, key, (sharedSignal) =>
      this.provider.getPokemonByType(key, sharedSignal), signal);
  }

  getPokemon(idOrName: string | number, signal?: AbortSignal): Promise<PokemonSummary | null> {
    const lookup = normalizePokemonLookup(idOrName);
    const key = String(lookup);
    return this.getOrLoad(
      this.pokemon,
      key,
      (sharedSignal) => this.provider.getPokemon(lookup, sharedSignal),
      signal,
      (entry) => this.cachePokemonAliases(key, entry),
    );
  }

  private cachePokemonAliases(key: string, entry: CachedEntry<PokemonSummary | null>): void {
    if (entry.value === null) return;

    const { id, name } = entry.value;
    const keys = new Set([key, String(id), String(normalizePokemonLookup(name))]);
    let newest = entry;

    // ID and name requests can start independently before their relationship is known.
    for (const alias of keys) {
      const existing = this.pokemon.get(alias);
      if (existing?.status === "cached" && existing.version > newest.version) {
        newest = existing;
      }
    }
    for (const alias of keys) {
      if (this.pokemon.get(alias)?.status !== "pending") this.pokemon.set(alias, newest);
    }
  }

  getPokemonDetails(pokemon: PokemonSummary, signal?: AbortSignal): Promise<PokemonDetails> {
    return this.getOrLoad(this.details, pokemon.id, (sharedSignal) =>
      this.provider.getPokemonDetails(pokemon, sharedSignal), signal);
  }

  private getOrLoad<K, T>(
    cache: Map<K, CacheEntry<T>>,
    key: K,
    load: (signal: AbortSignal) => Promise<T>,
    signal?: AbortSignal,
    onCached?: (entry: CachedEntry<T>) => void,
  ): Promise<T> {
    if (signal?.aborted) return Promise.reject(signal.reason);

    const existing = cache.get(key);
    if (existing?.status === "cached" && existing.expiresAt > Date.now()) {
      return Promise.resolve(existing.value);
    }

    const pending = existing?.status === "pending"
      ? existing
      : this.startRequest(cache, key, load, onCached);

    return this.joinRequest(pending, signal, () => {
      if (cache.get(key) !== pending) return;
      cache.delete(key);
      pending.controller.abort();
    });
  }

  private startRequest<K, T>(
    cache: Map<K, CacheEntry<T>>,
    key: K,
    load: (signal: AbortSignal) => Promise<T>,
    onCached?: (entry: CachedEntry<T>) => void,
  ): PendingEntry<T> {
    const controller = new AbortController();
    const version = ++this.requestVersion;
    const pending: PendingEntry<T> = {
      status: "pending",
      controller,
      consumers: 0,
      promise: Promise.resolve()
        .then(() => {
          controller.signal.throwIfAborted();
          return load(controller.signal);
        })
        .then(
          (value) => {
            if (cache.get(key) === pending) {
              if (value === null) {
                cache.delete(key);
              } else {
                const entry: CachedEntry<T> = {
                  status: "cached",
                  value,
                  expiresAt: Date.now() + this.ttlMs,
                  version,
                };
                cache.set(key, entry);
                onCached?.(entry);
              }
            }
            return value;
          },
          (error: unknown) => {
            if (cache.get(key) === pending) cache.delete(key);
            throw error;
          },
        ),
    };
    cache.set(key, pending);
    return pending;
  }

  private joinRequest<T>(
    pending: PendingEntry<T>,
    signal: AbortSignal | undefined,
    cancelRequest: () => void,
  ): Promise<T> {
    pending.consumers++;

    return new Promise<T>((resolve, reject) => {
      let released = false;
      const release = () => {
        if (released) return false;
        released = true;
        pending.consumers--;
        signal?.removeEventListener("abort", abort);
        return true;
      };

      const abort = () => {
        if (!release()) return;
        if (pending.consumers === 0) cancelRequest();
        reject(signal?.reason);
      };
      signal?.addEventListener("abort", abort, { once: true });

      void pending.promise.then(
        (value) => {
          if (release()) resolve(value);
        },
        (error: unknown) => {
          if (release()) reject(error);
        },
      );
    });
  }
}
