import type { PokemonProvider } from "../providers/pokemon-provider";
import type { CatalogPokemon, PokemonIndexEntry } from "../types/pokemon";

export type PokemonListResult =
  | { status: "success"; pokemon: CatalogPokemon[] }
  | { status: "error" };

export async function loadPokemonBatch(
  pokemonProvider: PokemonProvider,
  entries: PokemonIndexEntry[],
  isKnown: (id: number) => boolean,
  signal: AbortSignal,
): Promise<PokemonListResult> {
  const results = await Promise.allSettled(
    entries.map(async ({ id, name }): Promise<CatalogPokemon | null> => {
      if (!isKnown(id)) return { id, summary: null };
      const summary = await pokemonProvider.getPokemon(name, signal);
      return summary && { id, summary };
    }),
  );
  const pokemon: CatalogPokemon[] = [];
  let hasRequestError = false;

  for (const result of results) {
    if (result.status === "rejected") {
      hasRequestError = true;
      if (!signal.aborted) console.warn("Falha ao carregar um Pokémon.", result.reason);
    } else if (result.value !== null) {
      pokemon.push(result.value);
    }
  }

  return pokemon.length === 0 && hasRequestError
    ? { status: "error" }
    : { status: "success", pokemon };
}
