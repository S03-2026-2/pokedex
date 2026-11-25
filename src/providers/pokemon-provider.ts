import type {
  PokemonDetails,
  PokemonIndexEntry,
  PokemonPage,
  PokemonSummary,
} from "../types/pokemon";

export function normalizePokemonLookup(idOrName: string | number): string | number {
  if (typeof idOrName === "number") return idOrName;

  const lookup = idOrName.trim().toLowerCase();
  return /^\d+$/.test(lookup) ? lookup.replace(/^0+(?=\d)/, "") : lookup;
}

export interface PokemonProvider {
  getPokemonByType(type: string, signal?: AbortSignal): Promise<string[]>;

  getPokemonIndex(
    limit: number,
    signal?: AbortSignal,
  ): Promise<PokemonIndexEntry[]>;
  getPokemonPage(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<PokemonPage>;

  getPokemon(
    idOrName: string | number,
    signal?: AbortSignal,
  ): Promise<PokemonSummary | null>;

  getPokemonDetails(
    pokemon: PokemonSummary,
    signal?: AbortSignal,
  ): Promise<PokemonDetails>;
}
