import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import type { CollectionResponseDto } from './dtos/collection-response.dto';
import {
  COLLECTION_READER,
  type ICollectionReader,
} from '../interfaces/collection-reader.interface';

@Controller('collections')
export class CollectionController {
  constructor(
    @Inject(COLLECTION_READER)
    private readonly collectionReader: ICollectionReader,
  ) {}

  @Get('/playerId')
  async getKnownPokemon(
    @Param('playerId', ParseIntPipe) playerId: number,
  ): Promise<CollectionResponseDto> {
    const knownCards = await this.collectionReader.viewCollection(playerId);
    const knownPokemonIds = knownCards.map((card) => card.pokemonId);

    return { playerId, knownPokemonIds, totalKnown: knownPokemonIds.length };
  }
}
