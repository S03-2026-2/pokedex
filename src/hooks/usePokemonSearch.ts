import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import type { PokemonIndexEntry } from "../types/pokemon";
import { DEFAULT_POKEMON_COUNT, loadPokemonBatch } from "./pokemon-batch";
import type { PokemonListResult } from "./pokemon-batch";

const SEARCH_DELAY_MS = 350;
const SEARCH_RESULT_LIMIT = 30;

type SearchResult = PokemonListResult | { status: "not-found" };
type PokemonIndexResult =
  | { status: "success"; entries: PokemonIndexEntry[] }
  | { status: "error" };

export function usePokemonSearch(pokemonProvider: PokemonProvider) {
  const [indexResult, setIndexResult] = useState<PokemonIndexResult | null>(null);
  const [indexAttempt, setIndexAttempt] = useState(0);
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<{ term: string; result: SearchResult } | null>(null);
  const term = searchTerm.trim().toLowerCase();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setIndexResult(null);
    const fetchMasterIndex = async () => {
      try {
        const entries = await pokemonProvider.getPokemonIndex(DEFAULT_POKEMON_COUNT, signal);
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

  useEffect(() => {
    setSearchResult(null);
    if (!term) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timer = setTimeout(async () => {
      const entries = indexResult?.status === "success" ? indexResult.entries : [];
      const matches = entries
        .filter((entry) => entry.name.toLowerCase().includes(term) || String(entry.id) === term)
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
  }, [term, searchTerm, indexResult, requestAttempt, pokemonProvider]);

  const retry = () => {
    if (indexResult?.status === "error") setIndexAttempt((attempt) => attempt + 1);
    setRequestAttempt((attempt) => attempt + 1);
  };

  return {
    searchTerm,
    setSearchTerm,
    isActive: term.length > 0,
    result: searchResult?.term === searchTerm ? searchResult.result : null,
    retry,
  };
}
