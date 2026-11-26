import type { CollectionProvider } from "../../providers/collection-provider";
import type { Collection } from "../../types/collection";
import { collectionResponseSchema } from "./collection.schemas";

class CollectionApiHttpError extends Error {
  constructor(readonly status: number, url: string) {
    super(`Collection API returned HTTP ${status} for ${url}`);
    this.name = "CollectionApiHttpError";
  }
}

export class CollectionApiAdapter implements CollectionProvider {
  constructor(private readonly fetcher: typeof fetch = (...args) => fetch(...args)) {}

  async getCollection(playerId: number, signal?: AbortSignal): Promise<Collection> {
    const apiUrl: string | undefined = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl?.trim().replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("VITE_API_URL is not configured.");
    }

    const url = `${baseUrl}/collections/${encodeURIComponent(playerId)}`;
    const response = await this.fetcher(url, { signal });
    if (!response.ok) {
      throw new CollectionApiHttpError(response.status, url);
    }

    const data: unknown = await response.json();
    const parsed = collectionResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new TypeError(`Invalid collection API response from ${url}`, { cause: parsed.error });
    }
    return parsed.data;
  }
}
