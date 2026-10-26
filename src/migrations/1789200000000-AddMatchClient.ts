import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Records which client each player used, as reported in the WS handshake
 * (`?client=`, e.g. "evoduel"), so players can be counted per client.
 *
 * `matches.client` holds the client of the row's user. The unranked columns are
 * TypeORM simple-array text aligned position by position with `player_names` /
 * `opponent_names`; a player who sent no client stores an empty entry. Rows
 * written before this migration stay NULL.
 */
export class AddMatchClient1789200000000 implements MigrationInterface {
	name = "AddMatchClient1789200000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "matches" ADD "client" character varying(32)`);
		await queryRunner.query(`ALTER TABLE "unranked_matches" ADD "player_clients" text`);
		await queryRunner.query(`ALTER TABLE "unranked_matches" ADD "opponent_clients" text`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "unranked_matches" DROP COLUMN "opponent_clients"`);
		await queryRunner.query(`ALTER TABLE "unranked_matches" DROP COLUMN "player_clients"`);
		await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "client"`);
	}
}
