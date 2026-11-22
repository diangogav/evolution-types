import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * The formats a player chose to play, stored on their account so the choice
 * follows them across devices.
 *
 * NULL means the player never chose and must stay distinct from an empty
 * list, which is a deliberate choice of no formats. Existing users keep NULL:
 * nothing is inferred for them.
 */
export class AddUserFormats1789900000000 implements MigrationInterface {
	name = "AddUserFormats1789900000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" ADD "formats" text array`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "formats"`);
	}
}
