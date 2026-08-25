import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDuelIdToDuels1787660707004 implements MigrationInterface {
    name = "AddDuelIdToDuels1787660707004";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // duels rows are one per player per game, so a single domain duel spans
        // several rows and its id cannot live in the primary key. Nullable on
        // purpose, with no backfill: historical rows have no reliable way to be
        // paired across players (there is no per-game ordinal, and matching by
        // (game_id, turns) collides whenever two games of a match lasted the
        // same number of turns). duel_id is populated from deploy time onward.
        await queryRunner.query(`ALTER TABLE "duels" ADD "duel_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_duels_duel_id" ON "duels" ("duel_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_duels_duel_id"`);
        await queryRunner.query(`ALTER TABLE "duels" DROP COLUMN "duel_id"`);
    }
}
