import { MigrationInterface, QueryRunner } from "typeorm";

export class RelaxBanListName1788223148227 implements MigrationInterface {
    name = 'RelaxBanListName1788223148227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_stats" ALTER COLUMN "ban_list_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ALTER COLUMN "ban_list_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating_history" ALTER COLUMN "ban_list_name" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_player_stats_user_rank_season" ON "player_stats" ("user_id", "rank_id", "season")`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_player_ratings_user_rank_season" ON "player_ratings" ("user_id", "rank_id", "season")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_rating_history_user_rank_season" ON "rating_history" ("user_id", "rank_id", "season")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_rating_history_user_rank_season"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_player_ratings_user_rank_season"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_player_stats_user_rank_season"`);
        await queryRunner.query(`UPDATE "rating_history" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "ban_list_name" IS NULL AND "rank_id" = r."id"`);
        await queryRunner.query(`UPDATE "player_ratings" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "ban_list_name" IS NULL AND "rank_id" = r."id"`);
        await queryRunner.query(`UPDATE "player_stats" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "ban_list_name" IS NULL AND "rank_id" = r."id"`);
        await queryRunner.query(`ALTER TABLE "rating_history" ALTER COLUMN "ban_list_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ALTER COLUMN "ban_list_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_stats" ALTER COLUMN "ban_list_name" SET NOT NULL`);
    }

}
