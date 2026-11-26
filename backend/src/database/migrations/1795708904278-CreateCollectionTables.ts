import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionTables1795708904278 implements MigrationInterface {
  name = 'CreateCollectionTables1795708904278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."discovery_origin" AS ENUM('DISTRIBUTION', 'TRADE')
        `);
    await queryRunner.query(`
            CREATE TABLE "known_cards" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "collection_id" uuid NOT NULL,
                "pokemon_id" integer NOT NULL,
                "origin" "public"."discovery_origin" NOT NULL,
                "discovered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_5a02588b58a239b315b34e62481" UNIQUE ("collection_id", "pokemon_id"),
                CONSTRAINT "PK_c736c3720f524bf3628e78423b3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "collections" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "player_id" integer NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_41c4c5168e7fcf6f5032bf147df" UNIQUE ("player_id"),
                CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "known_cards"
            ADD CONSTRAINT "FK_3903fbded90d45372652264235e" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "known_cards" DROP CONSTRAINT "FK_3903fbded90d45372652264235e"
        `);
    await queryRunner.query(`
            DROP TABLE "collections"
        `);
    await queryRunner.query(`
            DROP TABLE "known_cards"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."discovery_origin"
        `);
  }
}
