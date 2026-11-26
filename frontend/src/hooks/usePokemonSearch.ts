import { useEffect, useState } from "react";
import { normalizePokemonLookup, type PokemonProvider } from "../providers/pokemon-provider";
import { loadPokemonBatch } from "./pokemon-batch";
import type { PokemonListResult } from "./pokemon-batch";
import { matchesPokemonSearch, SEARCH_DELAY_MS, type PokemonIndexResult } from "./usePokemonIndex";

const SEARCH_RESULT_LIMIT = 30;

type SearchResult = PokemonListResult | { status: "not-found" };

export function usePokemonSearch(
  pokemonProvider: PokemonProvider,
  indexResult: PokemonIndexResult | null,
  enabled: boolean,
  isKnown: (id: number) => boolean,
) {
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<{ term: string; isKnown: typeof isKnown; result: SearchResult } | null>(null);
  const term = String(normalizePokemonLookup(searchTerm));

  useEffect(() => {
    setSearchResult(null);
    if (!enabled || !term || !indexResult) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const entries = indexResult?.status === "success" ? indexResult.entries : [];
      const numeric = /^\d+$/.test(term);
      const matches = entries
        .filter((entry) => (numeric || isKnown(entry.id)) && matchesPokemonSearch(entry, term))
        .slice(0, SEARCH_RESULT_LIMIT);

      try {
        let result: SearchResult;
        if (matches.length > 0) {
          result = await loadPokemonBatch(
            pokemonProvider,
            matches,
            isKnown,
            signal,
          );
        } else if (!numeric && entries.some((entry) => entry.name === term)) {
          result = { status: "not-found" };
        } else {
          // Direct lookup also supports forms outside the search index.
          const directResult = await pokemonProvider.getPokemon(term, signal);
          if (directResult && (numeric || isKnown(directResult.id))) {
            const summary = isKnown(directResult.id) ? directResult : null;
            result = { status: "success", pokemon: [{ id: directResult.id, summary }] };
          } else {
            result = { status: indexResult.status === "error" ? "error" : "not-found" };
          }
        }
        if (!signal.aborted) setSearchResult({ term: searchTerm, isKnown, result });
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao pesquisar na PokéAPI.", error);
        setSearchResult({ term: searchTerm, isKnown, result: { status: "error" } });
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, term, searchTerm, indexResult, requestAttempt, pokemonProvider, isKnown]);

  return {
    searchTerm,
    term,
    setSearchTerm,
    isActive: term.length > 0,
    result: searchResult?.term === searchTerm && searchResult.isKnown === isKnown ? searchResult.result : null,
    retry: () => setRequestAttempt((attempt) => attempt + 1),
  };
}
