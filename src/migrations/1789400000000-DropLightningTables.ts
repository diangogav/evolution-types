import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Removes the tables left by the retired tournaments proxy. They were never
 * written in any environment: `lightning_tournaments` pointed at the legacy
 * `tournaments` table and `lightning_rankings` had no writer once the proxy
 * went away. Lightning tournaments are being rebuilt inside evolution-api,
 * which owns its own tables under these names, so the shared schema must
 * release them first.
 */
export class DropLightningTables1789400000000 implements MigrationInterface {
	name = "DropLightningTables1789400000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "lightning_results"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "lightning_tournaments"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "lightning_rankings"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "lightning_rankings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "points" integer NOT NULL DEFAULT '0', "tournaments_won" integer NOT NULL DEFAULT '0', "tournaments_played" integer NOT NULL DEFAULT '0', "season" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c371455f9bade2aed0eb6abb1f7" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_25604dc13cf832ce5cfb93fdcc" ON "lightning_rankings" ("user_id", "season") `
		);
		await queryRunner.query(
			`ALTER TABLE "lightning_rankings" ADD CONSTRAINT "FK_83c9583ae8ff9e32fdc3dbe8241" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
		await queryRunner.query(
			`CREATE TABLE "lightning_tournaments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tournament_id" character varying NOT NULL, "season" character varying NOT NULL, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_df405d467433a9710deedfe0ecc" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(
			`ALTER TABLE "lightning_tournaments" ADD CONSTRAINT "FK_a0d63d6dbf1fa694d588e92cba1" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		);
	}
}
