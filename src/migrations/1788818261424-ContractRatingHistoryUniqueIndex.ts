import { MigrationInterface, QueryRunner } from "typeorm";

export class ContractRatingHistoryUniqueIndex1788818261424 implements MigrationInterface {
	name = "ContractRatingHistoryUniqueIndex1788818261424";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "public"."IDX_rating_history_match_user_kind_rank"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_rating_history_match_user_kind_rank" ON "rating_history" ("match_id", "user_id", "kind", "rank_id") `,
		);
	}
}
