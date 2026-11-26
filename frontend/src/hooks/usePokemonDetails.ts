import { useEffect, useState } from "react";
import type { PokemonProvider } from "../providers/pokemon-provider";
import type { PokemonDetails, PokemonSummary } from "../types/pokemon";

type ModalResult =
  | { status: "success"; details: PokemonDetails }
  | { status: "error" };

export function usePokemonDetails(pokemonProvider: PokemonProvider) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSummary | null>(null);
  const [result, setResult] = useState<ModalResult | null>(null);
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    if (!selectedPokemon) return;

    const controller = new AbortController();
    const { signal } = controller;
    const fetchDetails = async () => {
      try {
        const details = await pokemonProvider.getPokemonDetails(selectedPokemon, signal);
        if (!signal.aborted) setResult({ status: "success", details });
      } catch (error) {
        if (signal.aborted) return;
        console.error("Falha ao carregar os detalhes do Pokémon.", error);
        setResult({ status: "error" });
      }
    };
    void fetchDetails();
    return () => controller.abort();
  }, [selectedPokemon, requestAttempt, pokemonProvider]);

  const open = (pokemon: PokemonSummary) => {
    setResult(null);
    setSelectedPokemon(pokemon);
  };

  const close = () => {
    setSelectedPokemon(null);
    setResult(null);
  };

  const retry = () => {
    setResult(null);
    setRequestAttempt((attempt) => attempt + 1);
  };

  return {
    pokemon: selectedPokemon && result?.status === "success"
      ? { ...selectedPokemon, ...result.details }
      : selectedPokemon,
    isLoading: selectedPokemon !== null && result === null,
    hasError: result?.status === "error",
    open,
    close,
    retry,
  };
}
