import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePointsLedger1788799656874 implements MigrationInterface {
    name = 'CreatePointsLedger1788799656874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "points_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "user_id" character varying NOT NULL, "rank_id" uuid NOT NULL, "season" integer NOT NULL, "kind" character varying NOT NULL, "cycle" smallint NOT NULL DEFAULT '0', "points_delta" integer NOT NULL, "wins_delta" smallint NOT NULL, "losses_delta" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1894c07f712716bfe637e82cc05" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_558947e728d7f2179058ebd773" ON "points_ledger" ("game_id", "kind") `);
        await queryRunner.query(`CREATE INDEX "IDX_44fd663c7aa1ff9e3a0278891f" ON "points_ledger" ("user_id", "rank_id", "season") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_85858e3efc409fcaae7f215c70" ON "points_ledger" ("game_id", "user_id", "rank_id", "kind", "cycle") `);
        await queryRunner.query(`ALTER TABLE "points_ledger" ADD CONSTRAINT "FK_da695f16d02317721eb76711fec" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "points_ledger" ADD CONSTRAINT "FK_d2d3d42d679211404c7c87c6164" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "points_ledger" DROP CONSTRAINT "FK_d2d3d42d679211404c7c87c6164"`);
        await queryRunner.query(`ALTER TABLE "points_ledger" DROP CONSTRAINT "FK_da695f16d02317721eb76711fec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85858e3efc409fcaae7f215c70"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44fd663c7aa1ff9e3a0278891f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_558947e728d7f2179058ebd773"`);
        await queryRunner.query(`DROP TABLE "points_ledger"`);
    }

}
