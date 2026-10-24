import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Essence paid by the rewards worker when a player unlocks an achievement. It is a
 * separate column from `earned_points` on purpose: those feed the ranked ladder and the
 * automatic catalog seeds them at 0. Unknown or future achievements fall back to the
 * column default.
 */
export class AddAchievementEssenceReward1789100000000 implements MigrationInterface {
	name = "AddAchievementEssenceReward1789100000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "achievements" ADD COLUMN IF NOT EXISTS "essence_reward" integer NOT NULL DEFAULT 50`,
		);
		const rewards: Array<[string, number]> = [
			["first_win", 50],
			["wins_10", 50],
			["wins_50", 150],
			["wins_100", 300],
			["streak_3", 50],
			["streak_5", 100],
			["streak_10", 300],
			["matches_100", 150],
		];
		for (const [code, essence] of rewards) {
			await queryRunner.query(
				`UPDATE "achievements" SET "essence_reward" = $1, "updated_at" = now() WHERE "code" = $2`,
				[essence, code],
			);
		}
		await queryRunner.query(
			`UPDATE "achievements" SET "essence_reward" = 30, "updated_at" = now() WHERE "code" LIKE 'format_first_win:%'`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "achievements" DROP COLUMN IF EXISTS "essence_reward"`);
	}
}
