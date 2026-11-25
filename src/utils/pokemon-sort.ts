import type { PokemonSummary } from "../types/pokemon";

export const POKEMON_SORT_OPTIONS = [
  { value: "id-asc", label: "Menor ID (#001)" },
  { value: "id-desc", label: "Maior ID" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "hp-desc", label: "Maior HP (nesta página)" },
  { value: "attack-desc", label: "Maior Ataque (nesta página)" },
] as const;

export type PokemonSortOrder = (typeof POKEMON_SORT_OPTIONS)[number]["value"];

export function sortPokemon(
  pokemon: readonly PokemonSummary[],
  order: PokemonSortOrder,
): PokemonSummary[] {
  return [...pokemon].sort((a, b) => {
    switch (order) {
      case "id-asc": return a.id - b.id;
      case "id-desc": return b.id - a.id;
      case "name-asc": return a.name.localeCompare(b.name);
      case "hp-desc": return (b.stats.hp || 0) - (a.stats.hp || 0);
      case "attack-desc": return (b.stats.attack || 0) - (a.stats.attack || 0);
    }
  });
}
