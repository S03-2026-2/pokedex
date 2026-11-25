import { useEffect, useMemo, useState } from "react";
import { normalizePokemonLookup, type PokemonProvider } from "../providers/pokemon-provider";
import { DEFAULT_POKEMON_COUNT, loadPokemonBatch } from "./pokemon-batch";
import type { PokemonListResult } from "./pokemon-batch";
import { matchesPokemonSearch, SEARCH_DELAY_MS, type PokemonIndexResult } from "./usePokemonIndex";

const PAGE_SIZE = 30;

export interface PokemonListFilters {
  indexResult: PokemonIndexResult | null;
  type: string | null;
  isFavorite: ((id: number) => boolean) | null;
  term: string;
}

export function usePokemonList(
  pokemonProvider: PokemonProvider,
  enabled: boolean,
  filters: PokemonListFilters | null,
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogTotalCount, setCatalogTotalCount] = useState(DEFAULT_POKEMON_COUNT);
  const [requestAttempt, setRequestAttempt] = useState(0);
  const request = useMemo(
    () => ({ pokemonProvider, enabled, filters, currentPage, requestAttempt }),
    [pokemonProvider, enabled, filters, currentPage, requestAttempt],
  );
  const [pageState, setPageState] = useState<{
    request: typeof request;
    result: PokemonListResult;
    totalCount: number;
  } | null>(null);

  useEffect(() => {
    const { pokemonProvider, enabled, filters, currentPage } = request;
    if (!enabled || filters?.indexResult === null) return;
    if (filters?.indexResult?.status === "error") {
      setPageState({ request, result: { status: "error" }, totalCount: 0 });
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const fetchPage = async () => {
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        let names: string[];
        let count: number;
        if (filters?.indexResult?.status === "success") {
          const typeNames = filters.type
            ? await pokemonProvider.getPokemonByType(filters.type, signal)
            : null;
          if (signal.aborted) return;

          const matchingTypeNames = typeNames && new Set(typeNames.map((name) => name.toLowerCase()));
          const term = String(normalizePokemonLookup(filters.term));
          const matches = filters.indexResult.entries.filter((entry) =>
            (!matchingTypeNames || matchingTypeNames.has(entry.name.toLowerCase())) &&
            (!filters.isFavorite || filters.isFavorite(entry.id)) &&
            (!term || matchesPokemonSearch(entry, term)),
          );
          count = matches.length;
          const lastPage = Math.max(1, Math.ceil(count / PAGE_SIZE));
          if (currentPage > lastPage) {
            setCurrentPage(lastPage);
            return;
          }
          names = matches.slice(offset, offset + PAGE_SIZE).map(({ name }) => name);
        } else {
          const page = await pokemonProvider.getPokemonPage(offset, PAGE_SIZE, signal);
          if (signal.aborted) return;
          ({ names, count } = page);
          setCatalogTotalCount(count);
        }

        const result = await loadPokemonBatch(pokemonProvider, names, signal);
        if (!signal.aborted) setPageState({ request, result, totalCount: count });
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao carregar a página da Pokédex.", error);
        setPageState({ request, result: { status: "error" }, totalCount: 0 });
      }
    };

    const timer = filters?.term ? setTimeout(fetchPage, SEARCH_DELAY_MS) : undefined;
    if (timer === undefined) void fetchPage();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [request]);

  const activePage = pageState?.request === request ? pageState : null;
  const totalCount = activePage?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  return {
    result: activePage?.result ?? null,
    currentPage,
    catalogTotalCount,
    totalCount,
    totalPages,
    firstItem: (currentPage - 1) * PAGE_SIZE + 1,
    lastItem: Math.min(currentPage * PAGE_SIZE, totalCount),
    previousPage: () => setCurrentPage((page) => Math.max(page - 1, 1)),
    nextPage: () => setCurrentPage((page) => Math.min(page + 1, totalPages)),
    resetPage: () => setCurrentPage(1),
    retry: () => setRequestAttempt((attempt) => attempt + 1),
  };
}
