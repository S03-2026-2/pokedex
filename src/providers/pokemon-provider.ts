import type {
  PokemonDetails,
  PokemonIndexEntry,
  PokemonPage,
  PokemonSummary,
} from "../types/pokemon";

export interface PokemonProvider {
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
