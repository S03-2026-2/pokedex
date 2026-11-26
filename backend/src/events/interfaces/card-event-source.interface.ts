import type { CardReceivedEvent } from '../card-received.event';

export const CARD_EVENT_SOURCE = Symbol('ICardEventSource');

export interface ICardEventSource {
  subscribe(handler: (event: CardReceivedEvent) => Promise<void>): () => void;
}
