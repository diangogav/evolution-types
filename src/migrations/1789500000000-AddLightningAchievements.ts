import { MigrationInterface, QueryRunner } from "typeorm";

type CatalogRow = {
	id: number;
	code: string;
	icon: string;
	name: string;
	description: string;
	essenceReward: number;
};

/**
 * Achievements for lightning tournaments. The API unlocks them when it completes a
 * tournament (the duel server never sees tournaments), so they carry no ranked points
 * and no ladder label: only the essence the rewards worker pays for every unlock.
 */
const CATALOG: CatalogRow[] = [
	{
		id: 1101,
		code: "LIGHTNING_FIRST",
		icon: "⚡",
		name: "First lightning",
		description: "Finish your first lightning tournament",
		essenceReward: 50,
	},
	{
		id: 1102,
		code: "LIGHTNING_PODIUM",
		icon: "🎖️",
		name: "Podium",
		description: "Finish a lightning tournament in the top 3",
		essenceReward: 100,
	},
	{
		id: 1103,
		code: "LIGHTNING_CHAMPION",
		icon: "🏆",
		name: "Champion of the trial",
		description: "Win a lightning tournament",
		essenceReward: 200,
	},
	{
		id: 1104,
		code: "LIGHTNING_UNBEATEN",
		icon: "🛡️",
		name: "Unbeaten",
		description: "Win a lightning tournament without losing a game",
		essenceReward: 300,
	},
	{
		id: 1105,
		code: "LIGHTNING_CHAMPION_5",
		icon: "👑",
		name: "Five-time champion",
		description: "Win 5 lightning tournaments",
		essenceReward: 500,
	},
];

export class AddLightningAchievements1789500000000 implements MigrationInterface {
	name = "AddLightningAchievements1789500000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Keyed on the code: a re-run skips what is already seeded, while an id taken by some
		// other achievement fails loudly instead of leaving the code missing.
		for (const row of CATALOG) {
			await queryRunner.query(
				`INSERT INTO "achievements" ("id", "code", "name", "description", "icon", "earned_points", "essence_reward") VALUES ($1, $2, $3, $4, $5, 0, $6) ON CONFLICT ("code") DO NOTHING`,
				[row.id, row.code, row.name, row.description, row.icon, row.essenceReward],
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const codes = CATALOG.map((row) => row.code);
		await queryRunner.query(
			`DELETE FROM "user_achievements" WHERE "achievement_id" IN (SELECT "id" FROM "achievements" WHERE "code" = ANY($1))`,
			[codes],
		);
		await queryRunner.query(`DELETE FROM "achievements" WHERE "code" = ANY($1)`, [codes]);
	}
}
