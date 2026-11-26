import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import type { PokemonIndexEntry } from "../types/pokemon";

export const SEARCH_DELAY_MS = 350;

export type PokemonIndexResult =
  | { status: "success"; entries: PokemonIndexEntry[] }
  | { status: "error" };

export function matchesPokemonSearch(entry: PokemonIndexEntry, term: string): boolean {
  return /^\d+$/.test(term) ? String(entry.id) === term : entry.name.toLowerCase().includes(term);
}

export function usePokemonIndex(pokemonProvider: PokemonProvider) {
  const [result, setResult] = useState<PokemonIndexResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setResult(null);
    const fetchIndex = async () => {
      try {
        const firstPage = await pokemonProvider.getPokemonPage(0, 1, signal);
        if (signal.aborted) return;

        const entries = firstPage.count > firstPage.entries.length
          ? await pokemonProvider.getPokemonIndex(firstPage.count, signal)
          : firstPage.entries;
        if (entries.length !== firstPage.count) {
          throw new Error("The Pokémon catalog index is incomplete.");
        }
        if (!signal.aborted) setResult({ status: "success", entries });
      } catch (error) {
        if (signal.aborted) return;
        console.warn("Falha ao carregar o índice da Pokédex.", error);
        setResult({ status: "error" });
      }
    };
    void fetchIndex();
    return () => controller.abort();
  }, [attempt, pokemonProvider]);

  return {
    result,
    retry: () => {
      if (result?.status === "error") setAttempt((previous) => previous + 1);
    },
  };
}
