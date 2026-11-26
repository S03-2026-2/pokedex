import { Inject, Injectable } from '@nestjs/common';
import type { DiscoveryOrigin } from '../../entities/enums/discovery-origin';
import {
  COLLECTION_WRITER,
  type ICollectionWriter,
} from '../../interfaces/collection-writer.interface';

@Injectable()
export class CardEventConsumer {
  constructor(
    @Inject(COLLECTION_WRITER)
    private readonly collectionWriter: ICollectionWriter,
  ) {}

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
