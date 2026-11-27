import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  type PipeTransform,
  Post,
  UsePipes,
} from '@nestjs/common';
import { DiscoveryOrigin } from '../../entities/enums/discovery-origin';
import { FakeCardEventSource } from '../sources/fake-card-event.source';
import {
  type SimulateCardsDto,
  simulateCardsSchema,
} from './dtos/simulate-cards.dto';

interface SimulationResponse {
  status: 'success';
  playerId: number;
  pokemonIds: number[];
  origin: DiscoveryOrigin;
}

class ZodValidationPipe implements PipeTransform<unknown, SimulateCardsDto> {
  transform(value: unknown): SimulateCardsDto {
    const result = simulateCardsSchema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    return result.data;
  }
}

@Controller('simulation')
@UsePipes(new ZodValidationPipe())
export class SimulationController {
  constructor(private readonly eventSource: FakeCardEventSource) {}

  @Post('distribution')
  @HttpCode(HttpStatus.OK)
  simulateDistribution(@Body() body: SimulateCardsDto): Promise<SimulationResponse> {
    return this.emitCards(body, DiscoveryOrigin.DISTRIBUTION);
  }

  @Post('trade')
  @HttpCode(HttpStatus.OK)
  simulateTrade(@Body() body: SimulateCardsDto): Promise<SimulationResponse> {
    return this.emitCards(body, DiscoveryOrigin.TRADE);
  }

  private async emitCards(
    { playerId, pokemonIds }: SimulateCardsDto,
    origin: DiscoveryOrigin,
  ): Promise<SimulationResponse> {
    await this.eventSource.emit({
      playerId,
      pokemonIds,
      origin,
      occurredAt: new Date(),
    });

    return { status: 'success', playerId, pokemonIds, origin };
  }
}
