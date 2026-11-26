import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DiscoveryOrigin } from './enums/discovery-origin';
import { Collection } from './collection.entity';

@Entity('known_cards')
@Unique(['collectionId', 'pokemonId'])
export class KnownCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'collection_id' })
  collectionId!: string;

  @Column('integer', { name: 'pokemon_id' })
  pokemonId!: number;

  @Column('enum', { enum: DiscoveryOrigin, enumName: 'discovery_origin' })
  origin!: DiscoveryOrigin;

  @CreateDateColumn({ name: 'discovered_at', type: 'timestamptz' })
  discoveredAt!: Date;

  @ManyToOne(() => Collection, (collection) => collection.knownCards, {
    nullable: false,
  })
  @JoinColumn({ name: 'collection_id' })
  collection!: Relation<Collection>;
}
