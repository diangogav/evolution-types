import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Lets unranked matches be attributed to registered users, the same way
 * `matches.player_ids` / `matches.opponent_ids` already do for ranked ones.
 *
 * Both columns are TypeORM simple-array text (comma-separated ids). Guests have
 * no id and are left out, so a team made only of guests stores an empty value.
 * Rows written before this migration stay NULL and remain unattributed.
 */
export class AddUnrankedMatchPlayerIds1789000000000 implements MigrationInterface {
	name = "AddUnrankedMatchPlayerIds1789000000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "unranked_matches" ADD "player_ids" text`);
		await queryRunner.query(`ALTER TABLE "unranked_matches" ADD "opponent_ids" text`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "unranked_matches" DROP COLUMN "opponent_ids"`);
		await queryRunner.query(`ALTER TABLE "unranked_matches" DROP COLUMN "player_ids"`);
	}
}
