import { MigrationInterface, QueryRunner } from "typeorm";

type CatalogRow = {
	id: number;
	code: string;
	icon: string;
	name: string;
	description: string;
};

const LADDERS = ["TCG", "OCG", "Edison", "JTP", "Genesys"];

const CATALOG: CatalogRow[] = [
	{ id: 1001, code: "first_win", icon: "🥇", name: "First victory", description: "Win your first ranked match" },
	{ id: 1002, code: "wins_10", icon: "🏅", name: "Veteran I", description: "Win 10 ranked matches" },
	{ id: 1003, code: "wins_50", icon: "🏅", name: "Veteran II", description: "Win 50 ranked matches" },
	{ id: 1004, code: "wins_100", icon: "🏅", name: "Veteran III", description: "Win 100 ranked matches" },
	{ id: 1005, code: "streak_3", icon: "🔥", name: "On a roll", description: "Win 3 ranked matches in a row" },
	{ id: 1006, code: "streak_5", icon: "🔥", name: "Unstoppable", description: "Win 5 ranked matches in a row" },
	{ id: 1007, code: "streak_10", icon: "🔥", name: "Legendary streak", description: "Win 10 ranked matches in a row" },
	{ id: 1008, code: "matches_100", icon: "💯", name: "Centurion", description: "Play 100 ranked matches" },
	...LADDERS.map((ladder, index) => ({
		id: 1011 + index,
		code: `format_first_win:${ladder}`,
		icon: "⚔️",
		name: `First victory in ${ladder}`,
		description: `Win your first ranked match in ${ladder}`,
	})),
];

export class AddAchievementCodeAndCatalog1788900000000 implements MigrationInterface {
	name = "AddAchievementCodeAndCatalog1788900000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "achievements" ADD COLUMN IF NOT EXISTS "code" character varying(64)`);
		await queryRunner.query(
			`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_achievements_code" ON "achievements" ("code")`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS "IDX_user_achievements_user_id" ON "user_achievements" ("user_id")`,
		);
		for (const row of CATALOG) {
			await queryRunner.query(
				`INSERT INTO "achievements" ("id", "code", "name", "description", "icon", "earned_points") VALUES ($1, $2, $3, $4, $5, 0) ON CONFLICT ("id") DO NOTHING`,
				[row.id, row.code, row.name, row.description, row.icon],
			);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const ids = CATALOG.map((row) => row.id);
		await queryRunner.query(`DELETE FROM "user_achievements" WHERE "achievement_id" = ANY($1)`, [ids]);
		await queryRunner.query(`DELETE FROM "achievements" WHERE "id" = ANY($1)`, [ids]);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_achievements_user_id"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_achievements_code"`);
		await queryRunner.query(`ALTER TABLE "achievements" DROP COLUMN IF EXISTS "code"`);
	}
}
