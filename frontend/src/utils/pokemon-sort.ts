import type { CatalogPokemon } from "../types/pokemon";

export const POKEMON_SORT_OPTIONS = [
  { value: "id-asc", label: "Menor ID (#001)" },
  { value: "id-desc", label: "Maior ID" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "hp-desc", label: "Maior HP (nesta página)" },
  { value: "attack-desc", label: "Maior Ataque (nesta página)" },
] as const;

export type PokemonSortOrder = (typeof POKEMON_SORT_OPTIONS)[number]["value"];

export function sortPokemon(
  pokemon: readonly CatalogPokemon[],
  order: PokemonSortOrder,
): CatalogPokemon[] {
  return [...pokemon].sort((a, b) => {
    if (order === "id-asc") return a.id - b.id;
    if (order === "id-desc") return b.id - a.id;
    if (a.summary === null) return b.summary === null ? a.id - b.id : 1;
    if (b.summary === null) return -1;
    if (order === "name-asc") return a.summary.name.localeCompare(b.summary.name);
    const stat = order === "hp-desc" ? "hp" : "attack";
    return (b.summary.stats[stat] ?? 0) - (a.summary.stats[stat] ?? 0);
  });
}
