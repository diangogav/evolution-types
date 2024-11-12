import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserAchievementsTable1731413415493 implements MigrationInterface {
    name = 'AddedUserAchievementsTable1731413415493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_achievements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "achievement_id" character varying NOT NULL, "labels" text NOT NULL, "unlocked_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_3d94aba7e9ed55365f68b5e77fa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_achievements"`);
    }

}
