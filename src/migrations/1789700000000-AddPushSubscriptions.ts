import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Web Push subscriptions per browser install. The endpoint is unique so a
 * subscription can be upserted by it, and rows go with their user.
 */
export class AddPushSubscriptions1789700000000 implements MigrationInterface {
	name = "AddPushSubscriptions1789700000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "push_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "endpoint" text NOT NULL, "p256dh" character varying(128) NOT NULL, "auth" character varying(64) NOT NULL, "locale" character varying(8) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_used_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_push_subscriptions_endpoint" UNIQUE ("endpoint"), CONSTRAINT "PK_push_subscriptions" PRIMARY KEY ("id"), CONSTRAINT "FK_push_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE)`,
		);
		await queryRunner.query(`CREATE INDEX "IDX_push_subscriptions_user_id" ON "push_subscriptions" ("user_id")`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "push_subscriptions"`);
	}
}
