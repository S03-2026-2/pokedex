import { useCallback, useEffect, useMemo, useState } from "react";
import type { CollectionProvider } from "../providers/collection-provider";
import type { Collection } from "../types/collection";

type CollectionResult =
  | { status: "success"; collection: Collection }
  | { status: "error"; error: Error };

export function useCollection(collectionProvider: CollectionProvider, playerId: number) {
  const [requestAttempt, setRequestAttempt] = useState(0);
  const request = useMemo(
    () => ({ collectionProvider, playerId, requestAttempt }),
    [collectionProvider, playerId, requestAttempt],
  );
  const [state, setState] = useState<{
    request: typeof request;
    result: CollectionResult;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchCollection = async () => {
      try {
        const collection = await request.collectionProvider.getCollection(request.playerId, signal);
        if (!signal.aborted) setState({ request, result: { status: "success", collection } });
      } catch (cause) {
        if (signal.aborted) return;
        const error = cause instanceof Error
          ? cause
          : new Error("Failed to load the player collection.", { cause });
        setState({ request, result: { status: "error", error } });
      }
    };

    void fetchCollection();
    return () => controller.abort();
  }, [request]);

  const result = state?.request === request ? state.result : null;
  const collection = result?.status === "success" ? result.collection : null;
  const knownPokemonIds = useMemo<ReadonlySet<number>>(
    () => new Set(collection?.knownPokemonIds),
    [collection],
  );
  const isKnown = useCallback((pokemonId: number) => knownPokemonIds.has(pokemonId), [knownPokemonIds]);
  const refetch = useCallback(() => setRequestAttempt((attempt) => attempt + 1), []);

  return {
    collection,
    isLoading: result === null,
    error: result?.status === "error" ? result.error : null,
    knownPokemonIds,
    isKnown,
    refetch,
  };
}
