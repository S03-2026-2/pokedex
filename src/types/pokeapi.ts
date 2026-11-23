export interface NamedResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  results: NamedResource[];
}

export interface PokemonAbilityResponse {
  ability: NamedResource;
}

interface PokemonSprite {
  front_default: string | null;
}

export interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: NamedResource }[];
  stats: { stat: NamedResource; base_stat: number }[];
  sprites: PokemonSprite & {
    other?: {
      'official-artwork'?: PokemonSprite;
      showdown?: PokemonSprite;
    } | null;
  };
  cries?: { latest: string | null; legacy: string | null } | null;
  abilities: PokemonAbilityResponse[];
  species: NamedResource;
}

interface FlavorTextEntry {
  flavor_text: string;
  language: NamedResource;
}

export interface PokemonSpeciesResponse {
  flavor_text_entries: FlavorTextEntry[];
  names: { name: string; language: NamedResource }[];
  genera: { genus: string; language: NamedResource }[];
  habitat: NamedResource | null;
  generation: NamedResource | null;
  evolution_chain: { url: string } | null;
}

export interface AbilityResponse {
  flavor_text_entries?: FlavorTextEntry[];
}

export interface EvolutionChainLink {
  species: NamedResource;
  evolution_details: { min_level: number | null; trigger: NamedResource | null }[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  chain: EvolutionChainLink;
}
