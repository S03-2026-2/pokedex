import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import { loadPokemonBatch } from "./pokemon-batch";
import type { PokemonListResult } from "./pokemon-batch";
import { matchesPokemonSearch, SEARCH_DELAY_MS, type PokemonIndexResult } from "./usePokemonIndex";

const SEARCH_RESULT_LIMIT = 30;

type SearchResult = PokemonListResult | { status: "not-found" };

export function usePokemonSearch(
  pokemonProvider: PokemonProvider,
  indexResult: PokemonIndexResult | null,
  enabled: boolean,
) {
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<{ term: string; result: SearchResult } | null>(null);
  const term = searchTerm.trim().toLowerCase();

  useEffect(() => {
    setSearchResult(null);
    if (!enabled || !term) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const entries = indexResult?.status === "success" ? indexResult.entries : [];
      const matches = entries
        .filter((entry) => matchesPokemonSearch(entry, term))
        .slice(0, SEARCH_RESULT_LIMIT);

      try {
        let result: SearchResult;
        if (matches.length > 0) {
          result = await loadPokemonBatch(
            pokemonProvider,
            matches.map(({ name }) => name),
            signal,
          );
        } else {
          // Direct lookup also supports forms outside the search index.
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
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, term, searchTerm, indexResult, requestAttempt, pokemonProvider]);

  return {
    searchTerm,
    term,
    setSearchTerm,
    isActive: term.length > 0,
    result: searchResult?.term === searchTerm ? searchResult.result : null,
    retry: () => setRequestAttempt((attempt) => attempt + 1),
  };
}
