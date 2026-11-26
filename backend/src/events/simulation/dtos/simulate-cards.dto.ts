import { z } from 'zod';

export const simulateCardsSchema = z.object({
  playerId: z.int32().positive(),
  pokemonIds: z.array(z.int32().positive()).min(1),
});

export type SimulateCardsDto = z.infer<typeof simulateCardsSchema>;
