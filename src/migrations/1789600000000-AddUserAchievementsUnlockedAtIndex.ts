import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Serves reads of recent unlocks in time order. The evolution-api rewards
 * worker credits achievement essence from a window of recent unlocks ordered
 * by (unlocked_at, id); without this index that read scans the whole table,
 * which grows with every match and tournament achievement.
 */
export class AddUserAchievementsUnlockedAtIndex1789600000000 implements MigrationInterface {
	name = "AddUserAchievementsUnlockedAtIndex1789600000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_user_achievements_unlocked_at_id" ON "user_achievements" ("unlocked_at", "id")`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_achievements_unlocked_at_id"`);
	}
}
