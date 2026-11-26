import { z } from "zod";

const resourceName = z.object({ name: z.string().min(1) });
const resourceUrl = z.object({ url: z.url({ protocol: /^https?$/ }) });
const sprite = z.object({ front_default: z.string().nullable() });
const flavorTextEntry = z.object({
  flavor_text: z.string(),
  language: resourceName,
});

export const pokemonIndexResponseSchema = z.object({
  results: z.array(resourceName.extend({
    url: resourceUrl.shape.url.refine((url) => /\/\d+\/?$/.test(url)),
  })),
});

export const pokemonPageResponseSchema = pokemonIndexResponseSchema.extend({
  count: z.number().int().nonnegative(),
});

export const pokemonTypeResponseSchema = z.object({
  pokemon: z.array(z.object({ pokemon: resourceName })),
});

export const pokemonResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  height: z.number().nonnegative(),
  weight: z.number().nonnegative(),
  types: z.array(z.object({ type: resourceName })),
  stats: z.array(z.object({ stat: resourceName, base_stat: z.number().nonnegative() })),
  sprites: sprite.extend({
    other: z.object({
      "official-artwork": sprite.nullish(),
      showdown: sprite.nullish(),
    }).nullish(),
  }),
  cries: z.object({ latest: z.string().nullish(), legacy: z.string().nullish() }).nullish(),
  abilities: z.array(z.object({ ability: resourceName.extend(resourceUrl.shape) })),
  species: resourceUrl,
});

export const pokemonSpeciesResponseSchema = z.object({
  flavor_text_entries: z.array(flavorTextEntry),
  names: z.array(resourceName.extend({ language: resourceName })),
  genera: z.array(z.object({ genus: z.string(), language: resourceName })),
  habitat: resourceName.nullish(),
  generation: resourceName.nullish(),
  evolution_chain: resourceUrl.nullish(),
});

export const abilityResponseSchema = z.object({
  flavor_text_entries: z.array(flavorTextEntry).nullish(),
});

const evolutionCondition = z.object({
  min_level: z.number().int().nonnegative().nullish(),
  trigger: resourceName.nullish(),
});
const evolutionLink = z.object({
  species: resourceName.extend({
    url: resourceUrl.shape.url.refine((url) => /\/\d+\/?$/.test(url)),
  }),
  evolution_details: z.array(evolutionCondition),
  get evolves_to(): z.ZodArray<typeof evolutionLink> {
    return z.array(evolutionLink);
  },
});

export const evolutionChainResponseSchema = z.object({ chain: evolutionLink });

export type PokemonIndexResponse = z.infer<typeof pokemonIndexResponseSchema>;
export type PokemonPageResponse = z.infer<typeof pokemonPageResponseSchema>;
export type PokemonTypeResponse = z.infer<typeof pokemonTypeResponseSchema>;
export type PokemonResponse = z.infer<typeof pokemonResponseSchema>;
export type PokemonSpeciesResponse = z.infer<typeof pokemonSpeciesResponseSchema>;
export type AbilityResponse = z.infer<typeof abilityResponseSchema>;
export type EvolutionChainLink = z.infer<typeof evolutionLink>;
export type EvolutionChainResponse = z.infer<typeof evolutionChainResponseSchema>;
