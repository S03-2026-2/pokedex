import type {
  AbilityResponse,
  EvolutionChainLink,
  EvolutionChainResponse,
  PokemonIndexResponse,
  PokemonPageResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
  PokemonTypeResponse,
} from "./pokemon.schemas";
import type {
  PokemonAbility,
  PokemonDetails,
  PokemonEvolution,
  PokemonIndexEntry,
  PokemonPage,
  PokemonStats,
  PokemonSummary,
} from "../../types/pokemon";

const STAT_KEYS = new Map<string, keyof PokemonStats>([
  ["hp", "hp"],
  ["attack", "attack"],
  ["defense", "defense"],
  ["special-attack", "spAtk"],
  ["special-defense", "spDef"],
  ["speed", "speed"],
]);
const EVOLUTION_ARTWORK_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function findLocalizedEntry<T extends { language: { name: string } }>(
  entries: T[],
): T | undefined {
  return (
    entries.find(({ language }) => language.name === "pt-br") ||
    entries.find(({ language }) => language.name === "en")
  );
}

function normalizeDescription(text: string): string {
  return text.replace(/[\n\f]/g, " ");
}

export function mapPokemonIndex(data: PokemonIndexResponse): PokemonIndexEntry[] {
  return data.results.map(({ name }, index) => ({ name, id: index + 1 }));
}

export function mapPokemonPage(data: PokemonPageResponse): PokemonPage {
  return { count: data.count, names: data.results.map(({ name }) => name) };
}

export function mapPokemonTypeNames(data: PokemonTypeResponse): string[] {
  return data.pokemon.map(({ pokemon }) => pokemon.name);
}

export function mapPokemonSummary(data: PokemonResponse): PokemonSummary {
  const stats: PokemonStats = {};
  for (const { stat, base_stat } of data.stats) {
    const key = STAT_KEYS.get(stat.name);
    if (key) stats[key] = base_stat;
  }

  const { front_default: defaultSprite, other } = data.sprites;

  return {
    id: data.id,
    name: capitalize(data.name),
    types: data.types.map(({ type }) => capitalize(type.name)),
    height: data.height / 10,
    weight: data.weight / 10,
    sprite: other?.["official-artwork"]?.front_default || defaultSprite,
    animatedSprite: other?.showdown?.front_default || defaultSprite,
    cries: data.cries?.latest || data.cries?.legacy || null,
    stats,
    abilityReferences: data.abilities.map(({ ability }) => ({
      name: ability.name,
      url: ability.url,
    })),
    speciesUrl: data.species.url,
  };
}

export function mapPokemonSpecies(
  data: PokemonSpeciesResponse,
  pokemonName: string,
): Omit<PokemonDetails, "abilities" | "evolutions"> {
  const flavorEntry = findLocalizedEntry(data.flavor_text_entries);
  const japaneseName = data.names.find(({ language }) => language.name === "ja-Hrkt");
  const genus = findLocalizedEntry(data.genera);

  return {
    japaneseName: japaneseName ? japaneseName.name : pokemonName,
    category: genus ? genus.genus.replace(" Pokémon", "") : "Desconhecido",
    habitat: data.habitat ? data.habitat.name : "Desconhecido",
    generation: data.generation?.name.split("-")[1]?.toUpperCase() || "1",
    description: flavorEntry
      ? normalizeDescription(flavorEntry.flavor_text)
      : "Sem descrição disponível.",
  };
}

export function mapPokemonAbility(
  name: string,
  data: AbilityResponse | null,
): PokemonAbility {
  const flavorEntry = findLocalizedEntry(data?.flavor_text_entries ?? []);

  return {
    name: data ? name.split("-").map(capitalize).join(" ") : name,
    description: flavorEntry
      ? normalizeDescription(flavorEntry.flavor_text)
      : "Habilidade especial.",
  };
}

export function mapEvolutionChain(data: EvolutionChainResponse): PokemonEvolution[] {
  const evolutions: PokemonEvolution[] = [];
  let link: EvolutionChainLink | undefined = data.chain;

  while (link) {
    const id = link.species.url.split("/").filter(Boolean).pop();
    const detail = link.evolution_details[0];

    evolutions.push({
      id: Number(id),
      name: capitalize(link.species.name),
      level: detail?.min_level || detail?.trigger?.name || 1,
      sprite: `${EVOLUTION_ARTWORK_URL}/${id}.png`,
    });
    link = link.evolves_to[0];
  }

  return evolutions;
}
