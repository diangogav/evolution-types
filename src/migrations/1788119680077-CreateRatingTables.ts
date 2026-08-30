import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRatingTables1788119680077 implements MigrationInterface {
    name = 'CreateRatingTables1788119680077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player_ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "ban_list_name" character varying NOT NULL, "season" integer NOT NULL, "rating" integer NOT NULL DEFAULT '1000', "games_played" integer NOT NULL DEFAULT '0', "peak" integer NOT NULL DEFAULT '1000', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_936f3a9ae9e189d2832925736dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b7572760014b333b1477ae0dcf" ON "player_ratings" ("user_id", "ban_list_name", "season") `);
        await queryRunner.query(`CREATE TABLE "rating_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "match_id" character varying NOT NULL, "user_id" character varying NOT NULL, "ban_list_name" character varying NOT NULL, "season" integer NOT NULL, "kind" character varying NOT NULL, "previous_rating" integer NOT NULL, "delta" integer NOT NULL, "k_factor" integer NOT NULL, "opponent_rating" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b7d99367d585054e2eb845e65a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_78654e82aa4c1de9dd7a7a3e53" ON "rating_history" ("user_id", "ban_list_name", "season") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_73c316098808beb674d15020dd" ON "rating_history" ("match_id", "user_id", "kind") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_73c316098808beb674d15020dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78654e82aa4c1de9dd7a7a3e53"`);
        await queryRunner.query(`DROP TABLE "rating_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7572760014b333b1477ae0dcf"`);
        await queryRunner.query(`DROP TABLE "player_ratings"`);
    }

}
