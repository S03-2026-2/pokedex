import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import { TYPE_COLORS } from "./data/pokemon";
import type { PokemonProvider } from "./providers/pokemon-provider";
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
const FAVORITES_KEY = "cyberdex_favs";
const favoritesSchema = z.array(z.number().int().positive());
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
type PokemonListResult =
  | { status: "success"; pokemon: PokemonSummary[] }
  | { status: "error" };
type SearchResult = PokemonListResult | { status: "not-found" };
type PokemonIndexResult =
  | { status: "success"; entries: PokemonIndexEntry[] }
  | { status: "error" };
type ModalResult =
  | { status: "success"; details: PokemonDetails }
  | { status: "error" };

function readFavorites(): number[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved !== null) {
      const data: unknown = JSON.parse(saved);
      const parsed = favoritesSchema.safeParse(data);
      if (parsed.success) return parsed.data;
    }
  } catch {
    // Keep the default favorites when storage is unavailable or the JSON is corrupt.
  }
  return [25, 6, 150];
}

async function loadPokemonBatch(
  pokemonProvider: PokemonProvider,
  names: string[],
  signal: AbortSignal,
): Promise<PokemonListResult> {
  const results = await Promise.allSettled(
    names.map((name) => pokemonProvider.getPokemon(name, signal)),
  );
  const pokemon: PokemonSummary[] = [];
  let hasRequestError = false;

  for (const result of results) {
    if (result.status === "rejected") {
      hasRequestError = true;
      if (!signal.aborted) console.warn("Falha ao carregar um Pokémon.", result.reason);
    } else if (result.value !== null) {
      pokemon.push(result.value);
    }
  }

  return pokemon.length === 0 && hasRequestError
    ? { status: "error" }
    : { status: "success", pokemon };
}

interface AppProps {
  pokemonProvider: PokemonProvider;
}

export default function App({ pokemonProvider }: AppProps) {
  const [indexResult, setIndexResult] = useState<PokemonIndexResult | null>(null);
  const [indexAttempt, setIndexAttempt] = useState(0);
  const [pageResult, setPageResult] = useState<PokemonListResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(TOTAL_POKEMON_COUNT);
  const [requestAttempt, setRequestAttempt] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<{ term: string; result: SearchResult } | null>(null);

  const [selectedType, setSelectedType] = useState<TypeFilter>("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(readFavorites);
  const [favoritesStorageFailed, setFavoritesStorageFailed] = useState(false);

  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSummary | null>(null);
  const [modalResult, setModalResult] = useState<ModalResult | null>(null);
  const [modalAttempt, setModalAttempt] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("id-asc");

  const term = searchTerm.trim().toLowerCase();
  const isSearchActive = term.length > 0;
  const activeSearch = searchResult?.term === searchTerm ? searchResult.result : null;
  const activeResult = isSearchActive ? activeSearch : pageResult;
  const requestFailed = activeResult?.status === "error";
  const pagePokemon = pageResult?.status === "success" ? pageResult.pokemon : null;
  const searchedPokemon = activeSearch?.status === "success" ? activeSearch.pokemon : null;

  // Save favorites to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      setFavoritesStorageFailed(false);
    } catch (error) {
      console.warn("Falha ao salvar os favoritos.", error);
      setFavoritesStorageFailed(true);
    }
  }, [favorites]);

  // Load master list index on mount for instantaneous search matching
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setIndexResult(null);
    const fetchMasterIndex = async () => {
      try {
        const entries = await pokemonProvider.getPokemonIndex(TOTAL_POKEMON_COUNT, signal);
        if (!signal.aborted) setIndexResult({ status: "success", entries });
      } catch (error) {
        if (signal.aborted) return;
        console.warn("Falha ao carregar o índice de busca.", error);
        setIndexResult({ status: "error" });
      }
    };
    void fetchMasterIndex();
    return () => controller.abort();
  }, [indexAttempt, pokemonProvider]);

  // Fetch page of 30 Pokemon when page changes (and not searching)
  useEffect(() => {
    if (isSearchActive) return;

    const controller = new AbortController();
    const { signal } = controller;
    setPageResult(null);
    const fetchPage = async () => {
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        const page = await pokemonProvider.getPokemonPage(offset, PAGE_SIZE, signal);
        if (signal.aborted) return;
        setTotalCount(page.count);

        const result = await loadPokemonBatch(pokemonProvider, page.names, signal);
        if (!signal.aborted) setPageResult(result);
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao carregar a página da Pokédex.", error);
        setPageResult({ status: "error" });
      }
    };

    void fetchPage();
    return () => controller.abort();
  }, [currentPage, isSearchActive, requestAttempt, pokemonProvider]);

  // Robust Search Implementation (Substring & Prefix Matching across all 1025 Pokemon)
  useEffect(() => {
    setSearchResult(null);
    if (!term) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const entries = indexResult?.status === "success" ? indexResult.entries : [];
      const matches = entries
        .filter(
          (p) => p.name.toLowerCase().includes(term) || String(p.id) === term,
        )
        .slice(0, 30); // Cap results to 30 for performance

      try {
        let result: SearchResult;
        if (matches.length > 0) {
          result = await loadPokemonBatch(
            pokemonProvider,
            matches.map(({ name }) => name),
            signal,
          );
        } else {
          // Fallback direct API try in case of special forms
          const directResult = await pokemonProvider.getPokemon(term, signal);
          if (directResult) {
            result = { status: "success", pokemon: [directResult] };
          } else {
            if (indexResult === null) return; // The index can still find a partial match.
            result = { status: indexResult.status === "error" ? "error" : "not-found" };
          }
        }
        if (!signal.aborted) setSearchResult({ term: searchTerm, result });
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao pesquisar na PokéAPI.", error);
        setSearchResult({ term: searchTerm, result: { status: "error" } });
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, searchTerm, indexResult, requestAttempt, pokemonProvider]);

  useEffect(() => {
    if (!selectedPokemon) return;

    const controller = new AbortController();
    const { signal } = controller;
    const fetchModalDetails = async () => {
      try {
        const details = await pokemonProvider.getPokemonDetails(selectedPokemon, signal);
        if (!signal.aborted) setModalResult({ status: "success", details });
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao carregar os detalhes do Pokémon.", error);
        setModalResult({ status: "error" });
      }
    };
    void fetchModalDetails();
    return () => controller.abort();
  }, [selectedPokemon, modalAttempt, pokemonProvider]);

  const handleOpenModal = (pokemon: PokemonSummary) => {
    setModalResult(null);
    setSelectedPokemon(pokemon);
  };

  const retryCurrentRequest = () => {
    if (isSearchActive && indexResult?.status === "error") {
      setIndexAttempt((attempt) => attempt + 1);
    }
    setRequestAttempt((attempt) => attempt + 1);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Display List Determination (Paginated vs Searched)
  const displayList = useMemo(() => {
    const source = (isSearchActive ? searchedPokemon : pagePokemon) ?? [];

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
    isSearchActive,
    searchedPokemon,
    pagePokemon,
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
          {favoritesStorageFailed && (
            <p role="status">Os favoritos serão mantidos apenas enquanto a Pokédex estiver aberta.</p>
          )}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por trecho do nome ou ID (ex: char, pika, 150)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {isSearchActive && activeSearch === null ? (
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
            <button type="button" className="reset-filters-btn" onClick={retryCurrentRequest}>
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
              {isSearchActive && activeSearch?.status === "not-found"
                ? `Nenhum Pokémon encontrado com "${searchTerm}".`
                : "Tente buscar por outro nome, ID ou ajuste os filtros de tipo."}
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
          key={selectedPokemon.id}
          pokemon={modalResult?.status === "success"
            ? { ...selectedPokemon, ...modalResult.details }
            : selectedPokemon}
          isLoading={modalResult === null}
          hasDetailsError={modalResult?.status === "error"}
          onRetryDetails={() => {
            setModalResult(null);
            setModalAttempt((attempt) => attempt + 1);
          }}
          onClose={() => {
            setSelectedPokemon(null);
            setModalResult(null);
          }}
          isFavorite={favorites.includes(selectedPokemon.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
