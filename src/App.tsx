import { useState, useEffect, useMemo } from "react";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import { TYPE_COLORS } from "./data/pokemon";
import type {
  AbilityResponse,
  EvolutionChainLink,
  EvolutionChainResponse,
  NamedResource,
  PokemonListResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from "./types/pokeapi";
import type {
  PokemonDetails,
  PokemonEvolution,
  PokemonStats,
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
type PokemonIndexEntry = NamedResource & { id: number };

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
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
        const data: PokemonListResponse = await res.json();
        const formatted = data.results.map((p, idx) => ({
          name: p.name,
          id: idx + 1,
          url: p.url,
        }));
        setAllPokemonIndex(formatted);
      } catch (err) {
        console.error("Error fetching master index:", err);
      }
    };
    fetchMasterIndex();
  }, []);

  // Fetch single Pokemon details helper
  const fetchPokemonDetail = async (
    idOrName: string | number,
  ): Promise<PokemonSummary | null> => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
      if (!res.ok) return null;
      const data: PokemonResponse = await res.json();

      const types = data.types.map(
        (t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1),
      );

      const statsObj: PokemonStats = {};
      data.stats.forEach((s) => {
        if (s.stat.name === "hp") statsObj.hp = s.base_stat;
        if (s.stat.name === "attack") statsObj.attack = s.base_stat;
        if (s.stat.name === "defense") statsObj.defense = s.base_stat;
        if (s.stat.name === "special-attack") statsObj.spAtk = s.base_stat;
        if (s.stat.name === "special-defense") statsObj.spDef = s.base_stat;
        if (s.stat.name === "speed") statsObj.speed = s.base_stat;
      });

      const officialArtwork =
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.front_default;
      const animatedSprite =
        data.sprites.other?.showdown?.front_default ||
        data.sprites.front_default;

      return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        types: types,
        height: data.height / 10,
        weight: data.weight / 10,
        sprite: officialArtwork,
        animatedSprite: animatedSprite,
        cries: data.cries?.latest || data.cries?.legacy || null,
        stats: statsObj,
        abilitiesRaw: data.abilities,
        speciesUrl: data.species.url,
      };
    } catch (err) {
      console.error("Error fetching pokemon detail:", err);
      return null;
    }
  };

  // Fetch page of 30 Pokemon when page changes (and not searching)
  useEffect(() => {
    if (searchTerm.trim()) return;

    const fetchPage = async () => {
      setLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${PAGE_SIZE}`,
        );
        const data: PokemonListResponse = await res.json();
        setTotalCount(data.count || TOTAL_POKEMON_COUNT);

        const detailPromises = data.results.map((p) =>
          fetchPokemonDetail(p.name),
        );
        const details = await Promise.all(detailPromises);
        setPokemonList(details.filter((pokemon) => pokemon !== null));
      } catch (err) {
        console.error("Error fetching page:", err);
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

      if (matches.length > 0) {
        const detailPromises = matches.map((m) => fetchPokemonDetail(m.name));
        const results = await Promise.all(detailPromises);
        setSearchedPokemon(results.filter((pokemon) => pokemon !== null));
      } else {
        // Fallback direct API try in case of special forms
        const directResult = await fetchPokemonDetail(term);
        if (directResult) {
          setSearchedPokemon([directResult]);
        } else {
          setSearchedPokemon([]);
          setSearchError(`Nenhum Pokémon encontrado com "${searchTerm}".`);
        }
      }

      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, allPokemonIndex]);

  // Open Modal Details
  const handleOpenModal = async (pokemon: PokemonSummary) => {
    setSelectedPokemon(pokemon);
    setLoadingModal(true);

    try {
      const speciesRes = await fetch(pokemon.speciesUrl);
      const speciesData: PokemonSpeciesResponse = await speciesRes.json();

      const flavorEntry =
        speciesData.flavor_text_entries.find(
          (e) => e.language.name === "pt-br",
        ) ||
        speciesData.flavor_text_entries.find((e) => e.language.name === "en");
      const description = flavorEntry
        ? flavorEntry.flavor_text.replace(/[\n\f]/g, " ")
        : "Sem descrição disponível.";

      const jaNameObj = speciesData.names.find(
        (n) => n.language.name === "ja-Hrkt",
      );
      const japaneseName = jaNameObj ? jaNameObj.name : pokemon.name;

      const generaObj =
        speciesData.genera.find((g) => g.language.name === "pt-br") ||
        speciesData.genera.find((g) => g.language.name === "en");
      const category = generaObj
        ? generaObj.genus.replace(" Pokémon", "")
        : "Desconhecido";

      const habitat = speciesData.habitat
        ? speciesData.habitat.name
        : "Desconhecido";
      const generation =
        speciesData.generation?.name.split("-")[1]?.toUpperCase() || "1";

      const abilities = await Promise.all(
        pokemon.abilitiesRaw.map(async (ab) => {
          try {
            const abRes = await fetch(ab.ability.url);
            const abData: AbilityResponse = await abRes.json();
            const effectEntry =
              abData.flavor_text_entries?.find(
                (e) => e.language.name === "pt-br",
              ) ||
              abData.flavor_text_entries?.find((e) => e.language.name === "en");
            return {
              name: ab.ability.name
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
              description: effectEntry
                ? effectEntry.flavor_text.replace(/[\n\f]/g, " ")
                : "Habilidade especial.",
            };
          } catch {
            return {
              name: ab.ability.name,
              description: "Habilidade especial.",
            };
          }
        }),
      );

      const evolutions: PokemonEvolution[] = [];
      if (speciesData.evolution_chain?.url) {
        try {
          const evoRes = await fetch(speciesData.evolution_chain.url);
          const evoData: EvolutionChainResponse = await evoRes.json();

          let curr: EvolutionChainLink | undefined = evoData.chain;
          while (curr) {
            const evoName = curr.species.name;
            const evoId = curr.species.url.split("/").filter(Boolean).pop();
            const minLevel =
              curr.evolution_details[0]?.min_level ||
              curr.evolution_details[0]?.trigger?.name ||
              1;

            evolutions.push({
              id: Number(evoId),
              name: evoName.charAt(0).toUpperCase() + evoName.slice(1),
              level: minLevel,
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
            });
            curr = curr.evolves_to[0];
          }
        } catch (e) {
          console.error("Evolution fetch error", e);
        }
      }

      setModalDetails({
        ...pokemon,
        japaneseName,
        category,
        habitat,
        generation,
        description,
        abilities,
        evolutions,
      });
    } catch (err) {
      console.error("Error loading extra modal details", err);
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
