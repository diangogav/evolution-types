import { MigrationInterface, QueryRunner } from "typeorm";

export class EnforceRankIdAndDropBanListName1788203846616 implements MigrationInterface {
    name = 'EnforceRankIdAndDropBanListName1788203846616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM player_stats WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in player_stats have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM player_ratings WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in player_ratings have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM rating_history WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in rating_history have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`ALTER TABLE "player_stats" ALTER COLUMN "rank_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ALTER COLUMN "rank_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating_history" ALTER COLUMN "rank_id" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_23e2bf8c6fb0b1ed0462bec18d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7572760014b333b1477ae0dcf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78654e82aa4c1de9dd7a7a3e53"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_player_stats_user_rank_season" ON "player_stats" ("user_id", "rank_id", "season")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_player_ratings_user_rank_season" ON "player_ratings" ("user_id", "rank_id", "season")`);
        await queryRunner.query(`CREATE INDEX "IDX_rating_history_user_rank_season" ON "rating_history" ("user_id", "rank_id", "season")`);
        await queryRunner.query(`ALTER TABLE "player_stats" DROP COLUMN "ban_list_name"`);
        await queryRunner.query(`ALTER TABLE "player_ratings" DROP COLUMN "ban_list_name"`);
        await queryRunner.query(`ALTER TABLE "rating_history" DROP COLUMN "ban_list_name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_stats" ADD "ban_list_name" character varying`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ADD "ban_list_name" character varying`);
        await queryRunner.query(`ALTER TABLE "rating_history" ADD "ban_list_name" character varying`);
        await queryRunner.query(`UPDATE "player_stats" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "rank_id" = r."id"`);
        await queryRunner.query(`UPDATE "player_ratings" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "rank_id" = r."id"`);
        await queryRunner.query(`UPDATE "rating_history" SET "ban_list_name" = r."name" FROM "ranks" r WHERE "rank_id" = r."id"`);
        await queryRunner.query(`ALTER TABLE "player_stats" ALTER COLUMN "ban_list_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ALTER COLUMN "ban_list_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating_history" ALTER COLUMN "ban_list_name" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_rating_history_user_rank_season"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_player_ratings_user_rank_season"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_player_stats_user_rank_season"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_23e2bf8c6fb0b1ed0462bec18d" ON "player_stats" ("user_id", "ban_list_name", "season")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b7572760014b333b1477ae0dcf" ON "player_ratings" ("user_id", "ban_list_name", "season")`);
        await queryRunner.query(`CREATE INDEX "IDX_78654e82aa4c1de9dd7a7a3e53" ON "rating_history" ("user_id", "ban_list_name", "season")`);
        await queryRunner.query(`ALTER TABLE "player_stats" ALTER COLUMN "rank_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ALTER COLUMN "rank_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "rating_history" ALTER COLUMN "rank_id" DROP NOT NULL`);
    }

}
