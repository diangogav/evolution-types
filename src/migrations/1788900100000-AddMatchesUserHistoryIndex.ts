import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Serves the achievements history reader and the per-user match history
 * endpoint, both of which read a user's matches newest first.
 *
 * The index is partial because those readers only ever consider matches that
 * are neither annulled nor soft-deleted, so excluding the rest keeps the index
 * smaller and avoids filtering rows after the scan.
 *
 * CREATE/DROP INDEX CONCURRENTLY cannot run inside a transaction, so this
 * migration opts out of the surrounding transaction.
 */
export class AddMatchesUserHistoryIndex1788900100000 implements MigrationInterface {
	name = "AddMatchesUserHistoryIndex1788900100000";
	public transaction = false;

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_matches_user_history" ON "matches" ("user_id", "date" DESC) WHERE "anulled" = false AND "deleted_at" IS NULL`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_matches_user_history"`);
	}
}
