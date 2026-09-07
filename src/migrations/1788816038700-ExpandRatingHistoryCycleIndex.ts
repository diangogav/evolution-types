import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandRatingHistoryCycleIndex1788816038700 implements MigrationInterface {
    name = 'ExpandRatingHistoryCycleIndex1788816038700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating_history" ADD "cycle" smallint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_80b062896d57b555dc9b8e27ff" ON "rating_history" ("match_id", "user_id", "rank_id", "kind", "cycle") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_80b062896d57b555dc9b8e27ff"`);
        await queryRunner.query(`ALTER TABLE "rating_history" DROP COLUMN "cycle"`);
    }

}
