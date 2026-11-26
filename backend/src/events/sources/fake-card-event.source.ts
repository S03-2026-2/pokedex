import { Injectable } from '@nestjs/common';
import type { CardReceivedEvent } from '../card-received.event';
import type { ICardEventSource } from '../interfaces/card-event-source.interface';

@Injectable()
export class FakeCardEventSource implements ICardEventSource {
  private readonly handlers = new Set<
    (event: CardReceivedEvent) => Promise<void>
  >();

  subscribe(handler: (event: CardReceivedEvent) => Promise<void>): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  async emit(event: CardReceivedEvent): Promise<void> {
    for (const handler of this.handlers) {
      await handler(event);
    }
  }
}
