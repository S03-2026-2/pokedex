import { useState, useEffect, useMemo } from "react";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import { TYPE_COLORS } from "./data/pokemon";
import { PokeApiAdapter } from "./infrastructure/pokeapi/poke-api.adapter";
import type {
  PokemonDetails,
  PokemonIndexEntry,
  PokemonSummary,
} from "./types/pokemon";
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

const PAGE_SIZE = 30;
const TOTAL_POKEMON_COUNT = 1025;
const SEARCH_REQUEST_ERROR = "Falha ao consultar a PokéAPI. Tente novamente.";
const pokeApi = new PokeApiAdapter();
const TYPE_FILTERS = [
  "ALL",
  ...(Object.keys(TYPE_COLORS) as (keyof typeof TYPE_COLORS)[]),
] as const;
const SORT_OPTIONS = [
  { value: "id-asc", label: "Menor ID (#001)" },
  { value: "id-desc", label: "Maior ID" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "hp-desc", label: "Maior HP" },
  { value: "attack-desc", label: "Maior Ataque" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number];
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

async function loadPokemonBatch(names: string[]) {
  const results = await Promise.allSettled(names.map((name) => pokeApi.getPokemon(name)));
  const pokemon: PokemonSummary[] = [];
  let hasRequestError = false;

  for (const result of results) {
    if (result.status === "rejected") {
      hasRequestError = true;
      console.error("Error fetching pokemon detail:", result.reason);
    } else if (result.value !== null) {
      pokemon.push(result.value);
    }
  }

  return { pokemon, hasRequestError };
}

export default function App() {
  const [allPokemonIndex, setAllPokemonIndex] = useState<PokemonIndexEntry[]>([]);
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(TOTAL_POKEMON_COUNT);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchedPokemon, setSearchedPokemon] = useState<PokemonSummary[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("cyberdex_favs");
    if (saved) {
      try {
        const ids: unknown = JSON.parse(saved);
        if (Array.isArray(ids) && ids.every((id) => typeof id === "number")) {
          return ids;
        }
      } catch {
        // Fall back to the default favorites if the saved JSON is invalid.
      }
    }
    return [25, 6, 150];
  });

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSummary | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalDetails, setModalDetails] = useState<
    (PokemonSummary & Partial<PokemonDetails>) | null
  >(null);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");

  // Save favorites to LocalStorage
  useEffect(() => {
    localStorage.setItem("cyberdex_favs", JSON.stringify(favorites));
  }, [favorites]);

  // Load master list index on mount for instantaneous search matching
  useEffect(() => {
    const fetchMasterIndex = async () => {
      try {
        const index = await pokeApi.getPokemonIndex(TOTAL_POKEMON_COUNT);
        setAllPokemonIndex(index);
      } catch (error) {
        console.error("Error fetching master index:", error);
      }
    };
    fetchMasterIndex();
  }, []);

  // Fetch page of 30 Pokemon when page changes (and not searching)
  useEffect(() => {
    if (searchTerm.trim()) return;

    const fetchPage = async () => {
      setLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        const page = await pokeApi.getPokemonPage(offset, PAGE_SIZE);
        setTotalCount(page.count || TOTAL_POKEMON_COUNT);

        const { pokemon } = await loadPokemonBatch(page.names);
        setPokemonList(pokemon);
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [currentPage, searchTerm]);

  // Robust Search Implementation (Substring & Prefix Matching across all 1025 Pokemon)
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchedPokemon(null);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      // Find matching items from master index
      const matches = allPokemonIndex
        .filter(
          (p) => p.name.toLowerCase().includes(term) || String(p.id) === term,
        )
        .slice(0, 30); // Cap results to 30 for performance

      try {
        if (matches.length > 0) {
          const { pokemon, hasRequestError } = await loadPokemonBatch(matches.map(({ name }) => name));
          setSearchedPokemon(pokemon);
          if (pokemon.length === 0 && hasRequestError) {
            setSearchError(SEARCH_REQUEST_ERROR);
          }
        } else {
          // Fallback direct API try in case of special forms
          const directResult = await pokeApi.getPokemon(term);
          if (directResult) {
            setSearchedPokemon([directResult]);
          } else {
            setSearchedPokemon([]);
            setSearchError(`Nenhum Pokémon encontrado com "${searchTerm}".`);
          }
        }
      } catch (error) {
        console.error("Error fetching pokemon detail:", error);
        setSearchedPokemon([]);
        setSearchError(SEARCH_REQUEST_ERROR);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, allPokemonIndex]);

  // Open Modal Details
  const handleOpenModal = async (pokemon: PokemonSummary) => {
    setSelectedPokemon(pokemon);
    setLoadingModal(true);

    try {
      const details = await pokeApi.getPokemonDetails(pokemon);
      setModalDetails({ ...pokemon, ...details });
    } catch (error) {
      console.error("Error loading extra modal details", error);
      setModalDetails(pokemon);
    } finally {
      setLoadingModal(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Display List Determination (Paginated vs Searched)
  const displayList = useMemo(() => {
    const source = searchTerm.trim() ? searchedPokemon || [] : pokemonList;

    return source
      .filter((pokemon) => {
        const matchesType =
          selectedType === "ALL" ||
          pokemon.types
            .map((t) => t.toUpperCase())
            .includes(selectedType.toUpperCase());
        const matchesFav = !favoritesOnly || favorites.includes(pokemon.id);
        return matchesType && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === "id-asc") return a.id - b.id;
        if (sortBy === "id-desc") return b.id - a.id;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "hp-desc") return (b.stats.hp || 0) - (a.stats.hp || 0);
        if (sortBy === "attack-desc")
          return (b.stats.attack || 0) - (a.stats.attack || 0);
        return 0;
      });
  }, [
    searchTerm,
    searchedPokemon,
    pokemonList,
    selectedType,
    favoritesOnly,
    favorites,
    sortBy,
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
            <span className="stat-pill-num">{totalCount}</span>
            <span className="stat-pill-label">Total PokéAPI</span>
          </div>
          <div className="stat-pill accent">
            <Heart size={14} fill="#ff3b5c" color="#ff3b5c" />
            <span className="stat-pill-num">{favorites.length}</span>
            <span className="stat-pill-label">Favoritos</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pokedex-main">
        {/* Search & Filters */}
        <section className="controls-panel glass-panel">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por trecho do nome ou ID (ex: char, pika, 150)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {isSearching ? (
              <Loader2
                className="clear-search-btn spin-icon"
                size={18}
                style={{ right: "16px" }}
              />
            ) : searchTerm ? (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
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
                onClick={() => setSelectedType(type)}
              >
                {type === "ALL" ? "Todos os Tipos" : type}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="secondary-controls">
            <button
              className={`toggle-fav-btn ${favoritesOnly ? "active" : ""}`}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
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
        {loading || isSearching ? (
          <div className="empty-state glass-panel">
            <Loader2 size={48} color="#ff3b5c" className="spin-icon" />
            <h3>
              {isSearching
                ? `Buscando "${searchTerm}" na PokéAPI...`
                : `Carregando Página ${currentPage}...`}
            </h3>
            <p>Aguarde um instante...</p>
          </div>
        ) : displayList.length > 0 ? (
          <>
            <div className="pokemon-grid">
              {displayList.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isFavorite={favorites.includes(pokemon.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={handleOpenModal}
                />
              ))}
            </div>

            {/* Pagination Component (Only visible when not searching) */}
            {!searchTerm && (
              <div className="pagination-bar glass-panel">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                    Exibindo {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                    {Math.min(currentPage * PAGE_SIZE, totalCount)} de{" "}
                    {totalCount}
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
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
              {searchError ||
                "Tente buscar por outro nome, ID ou ajuste os filtros de tipo."}
            </p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("ALL");
                setFavoritesOnly(false);
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
          pokemon={modalDetails || selectedPokemon}
          isLoading={loadingModal}
          onClose={() => {
            setSelectedPokemon(null);
            setModalDetails(null);
          }}
          isFavorite={favorites.includes(selectedPokemon.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
