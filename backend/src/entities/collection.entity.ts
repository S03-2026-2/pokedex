import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { KnownCard } from './known-card.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('integer', { name: 'player_id', unique: true })
  playerId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => KnownCard, (knownCard) => knownCard.collection)
  knownCards!: Relation<KnownCard[]>;
}
