import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillRanksAndRankId1788203845616 implements MigrationInterface {
    name = 'BackfillRanksAndRankId1788203845616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "ranks" ("name", "type", "enabled") SELECT DISTINCT source.name, CASE WHEN source.name = 'Global' THEN 'global' ELSE 'banlist' END, source.name <> 'N/A' FROM (SELECT ban_list_name AS name FROM "player_stats" UNION SELECT ban_list_name FROM "player_ratings" UNION SELECT ban_list_name FROM "rating_history") source ON CONFLICT ("name") DO NOTHING`);
        await queryRunner.query(`ALTER TABLE "player_stats" ADD "rank_id" uuid`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ADD "rank_id" uuid`);
        await queryRunner.query(`ALTER TABLE "rating_history" ADD "rank_id" uuid`);
        await queryRunner.query(`UPDATE "player_stats" SET "rank_id" = r."id" FROM "ranks" r WHERE "ban_list_name" = r."name"`);
        await queryRunner.query(`UPDATE "player_ratings" SET "rank_id" = r."id" FROM "ranks" r WHERE "ban_list_name" = r."name"`);
        await queryRunner.query(`UPDATE "rating_history" SET "rank_id" = r."id" FROM "ranks" r WHERE "ban_list_name" = r."name"`);
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM player_stats WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in player_stats have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM player_ratings WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in player_ratings have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`DO $$ DECLARE n bigint; BEGIN SELECT count(*) INTO n FROM rating_history WHERE rank_id IS NULL; IF n > 0 THEN RAISE EXCEPTION 'backfill incomplete: % rows in rating_history have NULL rank_id', n; END IF; END $$;`);
        await queryRunner.query(`ALTER TABLE "player_stats" ADD CONSTRAINT "FK_player_stats_rank_id" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player_ratings" ADD CONSTRAINT "FK_player_ratings_rank_id" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rating_history" ADD CONSTRAINT "FK_rating_history_rank_id" FOREIGN KEY ("rank_id") REFERENCES "ranks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rating_history" DROP CONSTRAINT "FK_rating_history_rank_id"`);
        await queryRunner.query(`ALTER TABLE "player_ratings" DROP CONSTRAINT "FK_player_ratings_rank_id"`);
        await queryRunner.query(`ALTER TABLE "player_stats" DROP CONSTRAINT "FK_player_stats_rank_id"`);
        await queryRunner.query(`ALTER TABLE "rating_history" DROP COLUMN "rank_id"`);
        await queryRunner.query(`ALTER TABLE "player_ratings" DROP COLUMN "rank_id"`);
        await queryRunner.query(`ALTER TABLE "player_stats" DROP COLUMN "rank_id"`);
        await queryRunner.query(`DELETE FROM "rank_members"`);
        await queryRunner.query(`DELETE FROM "ranks"`);
    }

}
