import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Duel records for reserved duels: rooms the game server builds from a
 * reservation (Redis `duel:reservation:<id>`) instead of a client join string.
 *
 * The game server is the only writer. `reserved_duels` holds one row per
 * claimed reservation, written at the first join and closed exactly once
 * (`ended_at` set) with `outcome` decided, draw or abandoned. Readers apply
 * a row once `ended_at` is set. `reserved_duel_participants` holds one row per
 * seat; `joined_at` marks when a user took it.
 */
export class CreateReservedDuels1789300000000 implements MigrationInterface {
	name = "CreateReservedDuels1789300000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "reserved_duels" (
				"reservation_id" character varying(16) NOT NULL,
				"format" character varying(32) NOT NULL,
				"mode" character varying(8) NOT NULL,
				"room_id" integer NOT NULL,
				"match_id" uuid,
				"server_instance_id" character varying(64) NOT NULL,
				"joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
				"started_at" TIMESTAMP WITH TIME ZONE,
				"ended_at" TIMESTAMP WITH TIME ZONE,
				"outcome" character varying(16),
				"winner_seat" smallint,
				"abandoned_by_seat" smallint,
				"reason" character varying(32),
				"duels" jsonb NOT NULL DEFAULT '[]'::jsonb,
				CONSTRAINT "PK_reserved_duels" PRIMARY KEY ("reservation_id"),
				CONSTRAINT "CHK_reserved_duels_mode" CHECK ("mode" IN ('single', 'match')),
				CONSTRAINT "CHK_reserved_duels_outcome"
					CHECK ("outcome" IS NULL OR "outcome" IN ('decided', 'draw', 'abandoned')),
				CONSTRAINT "CHK_reserved_duels_terminal"
					CHECK (("ended_at" IS NULL) = ("outcome" IS NULL))
			)
		`);
		await queryRunner.query(
			`CREATE INDEX "IDX_reserved_duels_open_by_instance" ON "reserved_duels" ("server_instance_id") WHERE "ended_at" IS NULL`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_reserved_duels_ended_at" ON "reserved_duels" ("ended_at")`,
		);
		await queryRunner.query(`
			CREATE TABLE "reserved_duel_participants" (
				"reservation_id" character varying(16) NOT NULL,
				"seat" smallint NOT NULL,
				"kind" character varying(16) NOT NULL,
				"user_id" character varying,
				"bot_name" character varying(64),
				"joined_at" TIMESTAMP WITH TIME ZONE,
				CONSTRAINT "PK_reserved_duel_participants" PRIMARY KEY ("reservation_id", "seat"),
				CONSTRAINT "FK_reserved_duel_participants_reservation" FOREIGN KEY ("reservation_id")
					REFERENCES "reserved_duels" ("reservation_id") ON DELETE CASCADE,
				CONSTRAINT "CHK_reserved_duel_participants_kind" CHECK (
					("kind" = 'user' AND "user_id" IS NOT NULL AND "bot_name" IS NULL)
					OR ("kind" = 'windbot' AND "bot_name" IS NOT NULL AND "user_id" IS NULL)
				)
			)
		`);
		await queryRunner.query(
			`CREATE INDEX "IDX_reserved_duel_participants_user" ON "reserved_duel_participants" ("user_id")`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "reserved_duel_participants"`);
		await queryRunner.query(`DROP TABLE "reserved_duels"`);
	}
}
