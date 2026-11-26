import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import type { DiscoveryOrigin } from '../../entities/enums/discovery-origin';
import {
  COLLECTION_WRITER,
  type ICollectionWriter,
} from '../../interfaces/collection-writer.interface';
import {
  CARD_EVENT_SOURCE,
  type ICardEventSource,
} from '../interfaces/card-event-source.interface';

@Injectable()
export class CardEventConsumer implements OnModuleInit, OnModuleDestroy {
  private unsubscribe?: () => void;

  constructor(
    @Inject(COLLECTION_WRITER)
    private readonly collectionWriter: ICollectionWriter,
    @Inject(CARD_EVENT_SOURCE)
    private readonly eventSource: ICardEventSource,
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventSource.subscribe(
      ({ playerId, pokemonIds, origin, occurredAt }) =>
        this.receiveCards(playerId, pokemonIds, origin, occurredAt),
    );
  }

  onModuleDestroy(): void {
    this.unsubscribe?.();
  }

  async receiveCards(
    playerId: number,
    pokemonIds: number[],
    origin: DiscoveryOrigin,
    occurredAt: Date,
  ): Promise<void> {
    for (const pokemonId of pokemonIds) {
      await this.collectionWriter.addCard(
        playerId,
        pokemonId,
        origin,
        occurredAt,
      );
    }
  }
}
