import { MigrationInterface, QueryRunner } from "typeorm";

export class WidenRatingHistoryUniqueIndex1788310542118 implements MigrationInterface {
    name = 'WidenRatingHistoryUniqueIndex1788310542118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // A ranked match feeds one ladder per rank (the ban list rank plus every
        // format group it belongs to), so it writes one rating_history row per
        // rank and (match_id, user_id, kind) is not unique. Adding rank_id
        // widens the key: every tuple the narrower index accepted stays unique
        // under the wider one, so this can never fail on existing data and needs
        // no pre-flight duplicate check.
        await queryRunner.query(`DROP INDEX "public"."IDX_73c316098808beb674d15020dd"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_rating_history_match_user_kind_rank" ON "rating_history" ("match_id", "user_id", "kind", "rank_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_rating_history_match_user_kind_rank"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_73c316098808beb674d15020dd" ON "rating_history" ("match_id", "user_id", "kind") `);
    }

}
