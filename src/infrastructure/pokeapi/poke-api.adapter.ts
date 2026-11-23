import {
  isAbilityResponse,
  isEvolutionChainResponse,
  isPokemonListResponse,
  isPokemonResponse,
  isPokemonSpeciesResponse,
} from "../../types/pokeapi";
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
} from "./pokemon.mapper";

const POKE_API_URL = "https://pokeapi.co/api/v2";

class PokeApiHttpError extends Error {
  constructor(readonly status: number, url: string) {
    super(`PokéAPI retornou HTTP ${status} para ${url}`);
    this.name = "PokeApiHttpError";
  }
}

export class PokeApiAdapter {
  constructor(private readonly fetcher: typeof fetch = (...args) => fetch(...args)) {}

  async getPokemonIndex(limit: number): Promise<PokemonIndexEntry[]> {
    const data = await this.fetchPokemonList(`limit=${limit}`);
    return mapPokemonIndex(data);
  }

  async getPokemonPage(offset: number, limit: number): Promise<PokemonPage> {
    const data = await this.fetchPokemonList(`offset=${offset}&limit=${limit}`);
    return mapPokemonPage(data);
  }

  async getPokemon(idOrName: string | number): Promise<PokemonSummary | null> {
    try {
      const data = await this.fetchJson(`${POKE_API_URL}/pokemon/${idOrName}`, isPokemonResponse);
      return mapPokemonSummary(data);
    } catch (error) {
      if (error instanceof PokeApiHttpError && error.status === 404) return null;
      throw error;
    }
  }

  async getPokemonDetails(pokemon: PokemonSummary): Promise<PokemonDetails> {
    const data = await this.fetchJson(pokemon.speciesUrl, isPokemonSpeciesResponse);
    const species = mapPokemonSpecies(data, pokemon.name);

    const abilities = await Promise.all(
      pokemon.abilityReferences.map((ability) => this.fetchAbility(ability)),
    );
    const evolutionUrl = data.evolution_chain?.url;
    const evolutions = evolutionUrl ? await this.fetchEvolutions(evolutionUrl) : [];

    return { ...species, abilities, evolutions };
  }

  private fetchPokemonList(query: string) {
    return this.fetchJson(`${POKE_API_URL}/pokemon?${query}`, isPokemonListResponse);
  }

  private async fetchJson<T>(
    url: string,
    isValid: (data: unknown) => data is T,
  ): Promise<T> {
    const response = await this.fetcher(url);
    if (!response.ok) {
      throw new PokeApiHttpError(response.status, url);
    }

    const data: unknown = await response.json();
    if (!isValid(data)) {
      throw new TypeError(`Resposta inválida da PokéAPI para ${url}`);
    }
    return data;
  }

  private async fetchAbility({ name, url }: PokemonAbilityReference): Promise<PokemonAbility> {
    try {
      const data = await this.fetchJson(url, isAbilityResponse);
      return mapPokemonAbility(name, data);
    } catch {
      return mapPokemonAbility(name, null);
    }
  }

  private async fetchEvolutions(url: string): Promise<PokemonEvolution[]> {
    try {
      const data = await this.fetchJson(url, isEvolutionChainResponse);
      return mapEvolutionChain(data);
    } catch (error) {
      console.error("Evolution fetch error", error);
      return [];
    }
  }
}
