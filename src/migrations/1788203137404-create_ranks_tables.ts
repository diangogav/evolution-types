import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRanksTables1788203137404 implements MigrationInterface {
    name = 'CreateRanksTables1788203137404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ranks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "only_current" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ranks_name" UNIQUE ("name"), CONSTRAINT "PK_ranks" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rank_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rank_id" uuid NOT NULL, "pattern" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_rank_members" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_rank_members_rank_id_pattern" ON "rank_members" ("rank_id", "pattern")`);
        await queryRunner.query(`ALTER TABLE "rank_members" ADD CONSTRAINT "FK_rank_members_rank_id" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rank_members" DROP CONSTRAINT "FK_rank_members_rank_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_rank_members_rank_id_pattern"`);
        await queryRunner.query(`DROP TABLE "rank_members"`);
        await queryRunner.query(`DROP TABLE "ranks"`);
    }

}
