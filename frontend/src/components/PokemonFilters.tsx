import "./PokemonFilters.css";
import { Heart, SlidersHorizontal } from "lucide-react";
import { TYPE_COLORS } from "../data/pokemon";
import { POKEMON_SORT_OPTIONS, type PokemonSortOrder } from "../utils/pokemon-sort";

type PokemonType = keyof typeof TYPE_COLORS;
export type PokemonTypeFilter = "ALL" | PokemonType;

const TYPE_FILTERS: PokemonTypeFilter[] = [
  "ALL",
  ...Object.keys(TYPE_COLORS).filter(
    (type): type is PokemonType => Object.hasOwn(TYPE_COLORS, type),
  ),
];

interface PokemonFiltersProps {
  selectedType: PokemonTypeFilter;
  favoritesOnly: boolean;
  sortBy: PokemonSortOrder;
  onTypeChange: (type: PokemonTypeFilter) => void;
  onToggleFavoritesOnly: () => void;
  onSortChange: (order: PokemonSortOrder) => void;
}

export default function PokemonFilters({
  selectedType,
  favoritesOnly,
  sortBy,
  onTypeChange,
  onToggleFavoritesOnly,
  onSortChange,
}: PokemonFiltersProps) {
  return (
    <>
      <div className="type-filters-scroll">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            className={`type-filter-chip ${selectedType === type ? "active" : ""}`}
            onClick={() => onTypeChange(type)}
          >
            {type === "ALL" ? "Todos os Tipos" : type}
          </button>
        ))}
      </div>

      <div className="secondary-controls">
        <button
          className={`toggle-fav-btn ${favoritesOnly ? "active" : ""}`}
          onClick={onToggleFavoritesOnly}
        >
          <Heart size={16} fill={favoritesOnly ? "#ff3b5c" : "none"} />
          <span>Somente Favoritos</span>
        </button>

        <div className="sort-dropdown-wrapper">
          <SlidersHorizontal size={16} />
          <select
            value={sortBy}
            onChange={(event) => {
              const option = POKEMON_SORT_OPTIONS.find(
                ({ value }) => value === event.currentTarget.value,
              );
              if (option) onSortChange(option.value);
            }}
            className="sort-select"
          >
            {POKEMON_SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
