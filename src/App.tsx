import { useMemo, useState } from "react";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import { TYPE_COLORS } from "./data/pokemon";
import { useFavorites } from "./hooks/useFavorites";
import { usePokemonDetails } from "./hooks/usePokemonDetails";
import { usePokemonIndex } from "./hooks/usePokemonIndex";
import { usePokemonList, type PokemonListFilters } from "./hooks/usePokemonList";
import { usePokemonSearch } from "./hooks/usePokemonSearch";
import type { FavoritesStorage } from "./providers/favorites-storage";
import type { PokemonProvider } from "./providers/pokemon-provider";
import {
  Search,
  Heart,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const TYPE_FILTERS = [
  "ALL",
  ...(Object.keys(TYPE_COLORS) as (keyof typeof TYPE_COLORS)[]),
] as const;
const SORT_OPTIONS = [
  { value: "id-asc", label: "Menor ID (#001)" },
  { value: "id-desc", label: "Maior ID" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "hp-desc", label: "Maior HP (nesta página)" },
  { value: "attack-desc", label: "Maior Ataque (nesta página)" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number];
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface AppProps {
  pokemonProvider: PokemonProvider;
  favoritesStorage: FavoritesStorage;
}

export default function App({ pokemonProvider, favoritesStorage }: AppProps) {
  const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");

  const details = usePokemonDetails(pokemonProvider);
  const {
    count: favoriteCount,
    isFavorite,
    toggleFavorite,
    storageFailed: favoritesStorageFailed,
  } = useFavorites(favoritesStorage);

  const pokemonType = selectedType === "ALL" ? null : selectedType.toLowerCase();
  const favoriteFilter = favoritesOnly ? isFavorite : null;
  const filtersActive = pokemonType !== null || favoriteFilter !== null;
  const index = usePokemonIndex(pokemonProvider);
  const search = usePokemonSearch(pokemonProvider, index.result, !filtersActive);
  const { searchTerm, isActive: isSearchActive, result: activeSearch } = search;
  const isGlobalSearch = isSearchActive && !filtersActive;
  const filters = useMemo<PokemonListFilters | null>(
    () => filtersActive ? {
      indexResult: index.result,
      type: pokemonType,
      isFavorite: favoriteFilter,
      term: search.term,
    } : null,
    [filtersActive, index.result, pokemonType, favoriteFilter, search.term],
  );
  const list = usePokemonList(pokemonProvider, !isGlobalSearch, filters);
  const { currentPage, totalCount, totalPages, firstItem, lastItem } = list;
  const selectedPokemon = details.pokemon;

  const activeResult = isGlobalSearch ? activeSearch : list.result;
  const requestFailed = activeResult?.status === "error";

  const updateSearchTerm = (term: string) => {
    search.setSearchTerm(term);
    if (filtersActive) list.resetPage();
  };

  const retry = () => {
    if (filtersActive || isGlobalSearch) index.retry();
    if (isGlobalSearch) search.retry();
    else list.retry();
  };

  const displayList = useMemo(() => {
    const source = activeResult?.status === "success" ? activeResult.pokemon : [];

    return [...source].sort((a, b) => {
      if (sortBy === "id-asc") return a.id - b.id;
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "hp-desc") return (b.stats.hp || 0) - (a.stats.hp || 0);
      if (sortBy === "attack-desc")
        return (b.stats.attack || 0) - (a.stats.attack || 0);
      return 0;
    });
  }, [activeResult, sortBy]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="pokedex-header glass-panel">
        <div className="header-brand">
          <div className="pokeball-logo">
            <div className="pokeball-top" />
            <div className="pokeball-center" />
            <div className="pokeball-bottom" />
          </div>
          <div>
            <h1 className="header-title">
              CYBER<span className="text-highlight">DEX</span>
            </h1>
            <p className="header-subtitle">
              Pokédex Oficial PokéAPI em Tempo Real
            </p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-pill-num">{list.catalogTotalCount}</span>
            <span className="stat-pill-label">Total PokéAPI</span>
          </div>
          <div className="stat-pill accent">
            <Heart size={14} fill="#ff3b5c" color="#ff3b5c" />
            <span className="stat-pill-num">{favoriteCount}</span>
            <span className="stat-pill-label">Favoritos</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pokedex-main">
        {/* Search & Filters */}
        <section className="controls-panel glass-panel">
          {favoritesStorageFailed && (
            <p role="status">Os favoritos serão mantidos apenas enquanto a Pokédex estiver aberta.</p>
          )}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por trecho do nome ou ID (ex: char, pika, 150)..."
              value={searchTerm}
              onChange={(e) => updateSearchTerm(e.target.value)}
              className="search-input"
            />
            {isSearchActive && activeResult === null ? (
              <Loader2
                className="clear-search-btn spin-icon"
                size={18}
                style={{ right: "16px" }}
              />
            ) : searchTerm ? (
              <button
                className="clear-search-btn"
                onClick={() => updateSearchTerm("")}
              >
                ×
              </button>
            ) : null}
          </div>

          {/* Type Filter Buttons Scroll */}
          <div className="type-filters-scroll">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type}
                className={`type-filter-chip ${selectedType === type ? "active" : ""}`}
                onClick={() => {
                  if (type === selectedType) return;
                  setSelectedType(type);
                  list.resetPage();
                }}
              >
                {type === "ALL" ? "Todos os Tipos" : type}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="secondary-controls">
            <button
              className={`toggle-fav-btn ${favoritesOnly ? "active" : ""}`}
              onClick={() => {
                setFavoritesOnly((previous) => !previous);
                list.resetPage();
              }}
            >
              <Heart size={16} fill={favoritesOnly ? "#ff3b5c" : "none"} />
              <span>Somente Favoritos</span>
            </button>

            <div className="sort-dropdown-wrapper">
              <SlidersHorizontal size={16} />
              <select
                value={sortBy}
                onChange={(e) => {
                  const option = SORT_OPTIONS.find(
                    ({ value }) => value === e.currentTarget.value,
                  );
                  if (option) setSortBy(option.value);
                }}
                className="sort-select"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Loading Spinner */}
        {activeResult === null ? (
          <div className="empty-state glass-panel">
            <Loader2 size={48} color="#ff3b5c" className="spin-icon" />
            <h3>
              {isSearchActive
                ? `Buscando "${searchTerm}" na PokéAPI...`
                : `Carregando Página ${currentPage}...`}
            </h3>
            <p>Aguarde um instante...</p>
          </div>
        ) : requestFailed ? (
          <div className="empty-state glass-panel" role="alert">
            <h3>{isSearchActive ? "Falha na busca" : "Falha ao carregar a página"}</h3>
            <p>Tente novamente para consultar a PokéAPI.</p>
            <button type="button" className="reset-filters-btn" onClick={retry}>
              <RefreshCw size={16} />
              <span>Tentar novamente</span>
            </button>
          </div>
        ) : displayList.length > 0 ? (
          <>
            <div className="pokemon-grid">
              {displayList.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isFavorite={isFavorite(pokemon.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={details.open}
                />
              ))}
            </div>

            {(!isSearchActive || filtersActive) && (
              <div className="pagination-bar glass-panel">
                <button
                  className="pagination-btn"
                  onClick={list.previousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                  <span>Anterior</span>
                </button>

                <div className="pagination-info">
                  <span>
                    Página{" "}
                    <strong className="highlight-num">{currentPage}</strong> de{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <span className="pagination-subtext">
                    Exibindo {firstItem} - {lastItem} de {totalCount}
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={list.nextPage}
                  disabled={currentPage === totalPages}
                >
                  <span>Próxima</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state glass-panel">
            <Sparkles size={48} color="#ff3b5c" />
            <h3>Nenhum Pokémon Encontrado</h3>
            <p>
              {isGlobalSearch && activeSearch?.status === "not-found"
                ? `Nenhum Pokémon encontrado com "${searchTerm}".`
                : "Tente buscar por outro nome, ID ou ajuste os filtros de tipo."}
            </p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                search.setSearchTerm("");
                setSelectedType("ALL");
                setFavoritesOnly(false);
                if (filtersActive) list.resetPage();
              }}
            >
              <RefreshCw size={16} />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal Overlay */}
      {selectedPokemon && (
        <PokemonModal
          key={selectedPokemon.id}
          pokemon={selectedPokemon}
          isLoading={details.isLoading}
          hasDetailsError={details.hasError}
          onRetryDetails={details.retry}
          onClose={details.close}
          isFavorite={isFavorite(selectedPokemon.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
