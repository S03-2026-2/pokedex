import type { ZodType } from "zod";
import type { PokemonProvider } from "../../providers/pokemon-provider";
import { normalizePokemonLookup } from "../../providers/pokemon-provider";
import {
  abilityResponseSchema,
  evolutionChainResponseSchema,
  pokemonIndexResponseSchema,
  pokemonPageResponseSchema,
  pokemonResponseSchema,
  pokemonSpeciesResponseSchema,
  pokemonTypeResponseSchema,
} from "./pokemon.schemas";
import type {
  PokemonAbility,
  PokemonAbilityReference,
  PokemonDetails,
  PokemonEvolution,
  PokemonIndexEntry,
  PokemonPage,
  PokemonSummary,
} from "../../types/pokemon";
import {
  mapEvolutionChain,
  mapPokemonAbility,
  mapPokemonIndex,
  mapPokemonPage,
  mapPokemonSpecies,
  mapPokemonSummary,
  mapPokemonTypeNames,
} from "./pokemon.mapper";

const POKEAPI_URL = "https://pokeapi.co/api/v2";
const POKEMON_URL = `${POKEAPI_URL}/pokemon`;

class PokeApiHttpError extends Error {
  constructor(readonly status: number, url: string) {
    super(`PokéAPI retornou HTTP ${status} para ${url}`);
    this.name = "PokeApiHttpError";
  }
}

export class PokeApiAdapter implements PokemonProvider {
  constructor(private readonly fetcher: typeof fetch = (...args) => fetch(...args)) {}

  async getPokemonByType(type: string, signal?: AbortSignal): Promise<string[]> {
    const data = await this.fetchJson(
      `${POKEAPI_URL}/type/${encodeURIComponent(type.trim().toLowerCase())}`,
      pokemonTypeResponseSchema,
      signal,
    );
    return mapPokemonTypeNames(data);
  }

  async getPokemonIndex(limit: number, signal?: AbortSignal): Promise<PokemonIndexEntry[]> {
    const data = await this.fetchJson(
      `${POKEMON_URL}?limit=${limit}`,
      pokemonIndexResponseSchema,
      signal,
    );
    return mapPokemonIndex(data);
  }

  async getPokemonPage(offset: number, limit: number, signal?: AbortSignal): Promise<PokemonPage> {
    const data = await this.fetchJson(
      `${POKEMON_URL}?offset=${offset}&limit=${limit}`,
      pokemonPageResponseSchema,
      signal,
    );
    return mapPokemonPage(data);
  }

  async getPokemon(idOrName: string | number, signal?: AbortSignal): Promise<PokemonSummary | null> {
    try {
      const data = await this.fetchJson(
        `${POKEMON_URL}/${encodeURIComponent(normalizePokemonLookup(idOrName))}`,
        pokemonResponseSchema,
        signal,
      );
      return mapPokemonSummary(data);
    } catch (error) {
      if (error instanceof PokeApiHttpError && error.status === 404) return null;
      throw error;
    }
  }

  async getPokemonDetails(pokemon: PokemonSummary, signal?: AbortSignal): Promise<PokemonDetails> {
    const data = await this.fetchJson(pokemon.speciesUrl, pokemonSpeciesResponseSchema, signal);
    const species = mapPokemonSpecies(data, pokemon.name);

    const abilities = await Promise.all(
      pokemon.abilityReferences.map((ability) => this.fetchAbility(ability, signal)),
    );
    const evolutionUrl = data.evolution_chain?.url;
    const evolutions = evolutionUrl ? await this.fetchEvolutions(evolutionUrl, signal) : [];

    return { ...species, abilities, evolutions };
  }

  private async fetchJson<T>(
    url: string,
    schema: ZodType<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetcher(url, { signal });
    if (!response.ok) {
      throw new PokeApiHttpError(response.status, url);
    }

    const data: unknown = await response.json();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new TypeError(`Resposta inválida da PokéAPI para ${url}`, { cause: parsed.error });
    }
    return parsed.data;
  }

  private async fetchAbility(
    { name, url }: PokemonAbilityReference,
    signal?: AbortSignal,
  ): Promise<PokemonAbility> {
    try {
      const data = await this.fetchJson(url, abilityResponseSchema, signal);
      return mapPokemonAbility(name, data);
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn(`Falha ao carregar a habilidade ${name}.`, error);
      return mapPokemonAbility(name, null);
    }
  }

  private async fetchEvolutions(url: string, signal?: AbortSignal): Promise<PokemonEvolution[]> {
    try {
      const data = await this.fetchJson(url, evolutionChainResponseSchema, signal);
      return mapEvolutionChain(data);
    } catch (error) {
      if (signal?.aborted) throw error;
      console.warn("Falha ao carregar a cadeia evolutiva.", error);
      return [];
    }
  }
}
