import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Prepares `users` for signing in with a Discord account.
 *
 * `discord_id` already exists but was never unique. Signing in resolves a user
 * by it, so two users sharing one Discord account would make that lookup
 * ambiguous: the index makes the link one to one. Users without a Discord
 * account keep NULL, which a unique index accepts any number of times; an empty
 * string is not an id and would collide, so it becomes NULL first.
 *
 * `email_verified_at` records when an address was proven to belong to the
 * user. Registration never verified addresses, so existing rows stay NULL.
 *
 * The index cannot be built while duplicates exist. The migration stops with
 * the number of duplicated ids instead of choosing which user keeps the link.
 */
export class AddUserDiscordIdentity1789800000000 implements MigrationInterface {
	name = "AddUserDiscordIdentity1789800000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`UPDATE "users" SET "discord_id" = NULL WHERE "discord_id" = ''`);

		const duplicates: { count: string }[] = await queryRunner.query(
			`SELECT COUNT(*) AS "count" FROM (SELECT "discord_id" FROM "users" WHERE "discord_id" IS NOT NULL GROUP BY "discord_id" HAVING COUNT(*) > 1) AS "duplicated"`,
		);
		const duplicated = Number(duplicates[0]?.count ?? 0);
		if (duplicated > 0) {
			throw new Error(
				`users.discord_id has ${duplicated} value(s) shared by more than one user; clear the duplicates before running this migration`,
			);
		}

		await queryRunner.query(`ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP WITH TIME ZONE`);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "UQ_users_discord_id" ON "users" ("discord_id")`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "UQ_users_discord_id"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`);
	}
}
