import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import type { PokemonIndexEntry } from "../types/pokemon";
import { DEFAULT_POKEMON_COUNT } from "./pokemon-batch";

export const SEARCH_DELAY_MS = 350;

export type PokemonIndexResult =
  | { status: "success"; entries: PokemonIndexEntry[] }
  | { status: "error" };

export function matchesPokemonSearch(entry: PokemonIndexEntry, term: string): boolean {
  return entry.name.toLowerCase().includes(term) || String(entry.id) === term;
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
        const entries = await pokemonProvider.getPokemonIndex(DEFAULT_POKEMON_COUNT, signal);
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
