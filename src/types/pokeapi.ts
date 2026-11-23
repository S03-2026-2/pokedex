export interface NamedResource {
  name: string;
  url: string;
}

type ResourceName = Pick<NamedResource, "name">;
type ResourceUrl = Pick<NamedResource, "url">;

export interface PokemonListResponse {
  count: number;
  results: ResourceName[];
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
  types: { type: ResourceName }[];
  stats: { stat: ResourceName; base_stat: number }[];
  sprites: PokemonSprite & {
    other?: {
      "official-artwork"?: PokemonSprite | null;
      showdown?: PokemonSprite | null;
    } | null;
  };
  cries?: { latest?: string | null; legacy?: string | null } | null;
  abilities: PokemonAbilityResponse[];
  species: ResourceUrl;
}

interface FlavorTextEntry {
  flavor_text: string;
  language: ResourceName;
}

export interface PokemonSpeciesResponse {
  flavor_text_entries: FlavorTextEntry[];
  names: { name: string; language: ResourceName }[];
  genera: { genus: string; language: ResourceName }[];
  habitat?: ResourceName | null;
  generation?: ResourceName | null;
  evolution_chain?: ResourceUrl | null;
}

export interface AbilityResponse {
  flavor_text_entries?: FlavorTextEntry[] | null;
}

export interface EvolutionChainLink {
  species: NamedResource;
  evolution_details: {
    min_level?: number | null;
    trigger?: ResourceName | null;
  }[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  chain: EvolutionChainLink;
}
