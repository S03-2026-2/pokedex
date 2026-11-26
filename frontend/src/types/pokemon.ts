type StatName = 'hp' | 'attack' | 'defense' | 'spAtk' | 'spDef' | 'speed';

export type PokemonStats = Partial<Record<StatName, number>>;

export interface PokemonIndexEntry {
  id: number;
  name: string;
}

export interface PokemonPage {
  count: number;
  entries: PokemonIndexEntry[];
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  sprite: string | null;
  animatedSprite: string | null;
  cries?: string | null;
  stats: PokemonStats;
}

export interface PokemonSummary extends Pokemon {
  abilityReferences: PokemonAbilityReference[];
  speciesUrl: string;
}

export interface CatalogPokemon {
  id: number;
  summary: PokemonSummary | null;
}

export interface PokemonAbilityReference {
  name: string;
  url: string;
}

export interface PokemonAbility {
  name: string;
  description: string;
}

export interface PokemonEvolution {
  id: number;
  name: string;
  level: number | string;
  sprite: string;
}

export interface PokemonDetails {
  japaneseName: string;
  category: string;
  habitat: string;
  generation: string | number;
  description: string;
  abilities: PokemonAbility[];
  evolutions: PokemonEvolution[];
}
