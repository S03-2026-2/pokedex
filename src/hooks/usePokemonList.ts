import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import { DEFAULT_POKEMON_COUNT, loadPokemonBatch } from "./pokemon-batch";
import type { PokemonListResult } from "./pokemon-batch";

const PAGE_SIZE = 30;

export function usePokemonList(pokemonProvider: PokemonProvider, enabled: boolean) {
  const [result, setResult] = useState<PokemonListResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(DEFAULT_POKEMON_COUNT);
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    const { signal } = controller;
    setResult(null);
    const fetchPage = async () => {
      const offset = (currentPage - 1) * PAGE_SIZE;
      try {
        const page = await pokemonProvider.getPokemonPage(offset, PAGE_SIZE, signal);
        if (signal.aborted) return;
        setTotalCount(page.count);

        const pageResult = await loadPokemonBatch(pokemonProvider, page.names, signal);
        if (!signal.aborted) setResult(pageResult);
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao carregar a página da Pokédex.", error);
        setResult({ status: "error" });
      }
    };

    void fetchPage();
    return () => controller.abort();
  }, [currentPage, enabled, requestAttempt, pokemonProvider]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  return {
    result,
    currentPage,
    totalCount,
    totalPages,
    firstItem: (currentPage - 1) * PAGE_SIZE + 1,
    lastItem: Math.min(currentPage * PAGE_SIZE, totalCount),
    previousPage: () => setCurrentPage((page) => Math.max(page - 1, 1)),
    nextPage: () => setCurrentPage((page) => Math.min(page + 1, totalPages)),
    retry: () => setRequestAttempt((attempt) => attempt + 1),
  };
}
