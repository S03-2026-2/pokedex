import { z } from "zod";

export const collectionResponseSchema = z.object({
  playerId: z.number().int(),
  knownPokemonIds: z.array(z.number().int().positive()),
  totalKnown: z.number().int().nonnegative(),
});
