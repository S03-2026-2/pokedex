import type { PokemonProvider } from "../providers/pokemon-provider";
import type { PokemonSummary } from "../types/pokemon";

export const DEFAULT_POKEMON_COUNT = 1025;

export type PokemonListResult =
  | { status: "success"; pokemon: PokemonSummary[] }
  | { status: "error" };

export async function loadPokemonBatch(
  pokemonProvider: PokemonProvider,
  names: string[],
  signal: AbortSignal,
): Promise<PokemonListResult> {
  const results = await Promise.allSettled(
    names.map((name) => pokemonProvider.getPokemon(name, signal)),
  );
  const pokemon: PokemonSummary[] = [];
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
