import type { DiscoveryOrigin } from '../entities/enums/discovery-origin';

export interface CardReceivedEvent {
  playerId: number;
  pokemonIds: number[];
  origin: DiscoveryOrigin;
  occurredAt: Date;
}
