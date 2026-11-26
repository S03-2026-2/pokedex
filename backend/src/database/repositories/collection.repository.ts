import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Collection } from '../../entities/collection.entity';
import { KnownCard } from '../../entities/known-card.entity';
import type {
  ICollectionRepository,
  KnownCardDiscovery,
} from '../../interfaces/collection-repository.interface';

@Injectable()
export class CollectionRepository implements ICollectionRepository {
  constructor(
    @InjectRepository(Collection)
    private readonly collections: Repository<Collection>,
    @InjectRepository(KnownCard)
    private readonly knownCards: Repository<KnownCard>,
  ) {}

  findByPlayerId(playerId: number): Promise<Collection | null> {
    return this.collections.findOne({
      where: { playerId },
      relations: { knownCards: true },
    });
  }

  async getOrCreate(playerId: number): Promise<Collection> {
    const collection = await this.findByPlayerId(playerId);
    if (collection) {
      return collection;
    }

    return this.collections.save(
      this.collections.create({ playerId, knownCards: [] }),
    );
  }

  async registerKnownCards(
    collectionId: string,
    discoveries: readonly KnownCardDiscovery[],
  ): Promise<void> {
    if (discoveries.length === 0) {
      return;
    }

    const existingCards = await this.knownCards.find({
      where: {
        collectionId,
        pokemonId: In(discoveries.map(({ pokemonId }) => pokemonId)),
      },
      select: { pokemonId: true },
    });
    const knownPokemonIds = new Set(
      existingCards.map(({ pokemonId }) => pokemonId),
    );
    const newCards: KnownCard[] = [];

    for (const { pokemonId, origin, discoveredAt } of discoveries) {
      if (knownPokemonIds.has(pokemonId)) {
        continue;
      }

      knownPokemonIds.add(pokemonId);
      newCards.push(
        this.knownCards.create({
          collectionId,
          pokemonId,
          origin,
          discoveredAt,
        }),
      );
    }

    if (newCards.length > 0) {
      await this.knownCards.save(newCards);
    }
  }
}
