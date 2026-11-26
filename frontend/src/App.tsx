import { useMemo, useState } from "react";
import "./App.css";
import PokemonHeader from "./components/PokemonHeader";
import PokemonSearch from "./components/PokemonSearch";
import PokemonFilters, { type PokemonTypeFilter } from "./components/PokemonFilters";
import PokemonResults from "./components/PokemonResults";
import PokemonModal from "./components/PokemonModal";
import PokemonPagination from "./components/PokemonPagination";
import { useCollection } from "./hooks/useCollection";
import { useFavorites } from "./hooks/useFavorites";
import { usePokemonDetails } from "./hooks/usePokemonDetails";
import { usePokemonIndex } from "./hooks/usePokemonIndex";
import { usePokemonList, type PokemonListFilters } from "./hooks/usePokemonList";
import { usePokemonSearch } from "./hooks/usePokemonSearch";
import type { CollectionProvider } from "./providers/collection-provider";
import type { FavoritesStorage } from "./providers/favorites-storage";
import type { PokemonProvider } from "./providers/pokemon-provider";
import { sortPokemon, type PokemonSortOrder } from "./utils/pokemon-sort";

const CURRENT_PLAYER_ID = 1;

interface AppProps {
  collectionProvider: CollectionProvider;
  pokemonProvider: PokemonProvider;
  favoritesStorage: FavoritesStorage;
}

export default function App({ collectionProvider, pokemonProvider, favoritesStorage }: AppProps) {
  const [selectedType, setSelectedType] = useState<PokemonTypeFilter>("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<PokemonSortOrder>("id-asc");

  const collection = useCollection(collectionProvider, CURRENT_PLAYER_ID);
  const details = usePokemonDetails(pokemonProvider);
  const favorites = useFavorites(favoritesStorage);
  const pokemonType = selectedType === "ALL" ? null : selectedType.toLowerCase();
  const favoriteFilter = favoritesOnly ? favorites.isFavorite : null;
  const filtersActive = pokemonType !== null || favoriteFilter !== null;

  const index = usePokemonIndex(pokemonProvider);
  const search = usePokemonSearch(pokemonProvider, index.result, !!collection.collection && !filtersActive, collection.isKnown);
  const { searchTerm, isActive: isSearchActive } = search;
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
  const list = usePokemonList(pokemonProvider, !!collection.collection && !isGlobalSearch, collection.isKnown, filters);

  const activeResult = isGlobalSearch ? search.result : list.result;
  const displayList = useMemo(
    () => activeResult?.status === "success" ? sortPokemon(activeResult.pokemon, sortBy) : [],
    [activeResult, sortBy],
  );
  const selectedPokemon = details.pokemon;

  const updateSearchTerm = (term: string) => {
    search.setSearchTerm(term);
    if (filtersActive) list.resetPage();
  };

  const changeType = (type: PokemonTypeFilter) => {
    if (type === selectedType) return;
    setSelectedType(type);
    list.resetPage();
  };

  const toggleFavoritesOnly = () => {
    setFavoritesOnly((previous) => !previous);
    list.resetPage();
  };

  const clearFilters = () => {
    updateSearchTerm("");
    setSelectedType("ALL");
    setFavoritesOnly(false);
  };

  const retry = () => {
    if (filtersActive || isGlobalSearch) index.retry();
    if (isGlobalSearch) search.retry();
    else list.retry();
  };

  return (
    <div className="app-container">
      <PokemonHeader totalCount={list.catalogTotalCount} favoriteCount={collection.collection ? [...collection.knownPokemonIds].filter(favorites.isFavorite).length : null} />

      <main className="pokedex-main">
        <section className="controls-panel glass-panel">
          {favorites.storageFailed && (
            <p role="status">Os favoritos serão mantidos apenas enquanto a Pokédex estiver aberta.</p>
          )}
          <PokemonSearch
            value={searchTerm}
            isLoading={isSearchActive && activeResult === null}
            onChange={updateSearchTerm}
          />
          <PokemonFilters
            onRefreshCollection={collection.refetch}
            collectionLoading={collection.isLoading}
            selectedType={selectedType}
            favoritesOnly={favoritesOnly}
            sortBy={sortBy}
            onTypeChange={changeType}
            onToggleFavoritesOnly={toggleFavoritesOnly}
            onSortChange={setSortBy}
          />
        </section>

        <PokemonResults
          status={collection.isLoading ? "collection-loading" : collection.error ? "collection-error" : activeResult?.status ?? "loading"}
          pokemon={displayList}
          searchTerm={isSearchActive ? searchTerm : null}
          currentPage={list.currentPage}
          isFavorite={favorites.isFavorite}
          onToggleFavorite={favorites.toggleFavorite}
          onSelectPokemon={details.open}
          onRetry={collection.error ? collection.refetch : retry}
          onClearFilters={clearFilters}
        >
          {(!isSearchActive || filtersActive) && (
            <PokemonPagination
              currentPage={list.currentPage}
              totalPages={list.totalPages}
              firstItem={list.firstItem}
              lastItem={list.lastItem}
              totalCount={list.totalCount}
              onPrevious={list.previousPage}
              onNext={list.nextPage}
            />
          )}
        </PokemonResults>
      </main>

      {selectedPokemon && collection.isKnown(selectedPokemon.id) && (
        <PokemonModal
          key={selectedPokemon.id}
          pokemon={selectedPokemon}
          isLoading={details.isLoading}
          hasDetailsError={details.hasError}
          onRetryDetails={details.retry}
          onClose={details.close}
          isFavorite={favorites.isFavorite(selectedPokemon.id)}
          onToggleFavorite={favorites.toggleFavorite}
        />
      )}
    </div>
  );
}
