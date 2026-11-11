import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { UserProfileEntity } from "./UserProfileEntity";

/**
 * A browser install that accepted Web Push for a user. The endpoint is the push
 * service URL and identifies the install, so it is unique: when another account
 * signs in on the same browser, the row moves to that account. Read by every
 * service that sends pushes with the shared VAPID keys.
 */
@Entity({ name: "push_subscriptions" })
export class PushSubscriptionEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Index("IDX_push_subscriptions_user_id")
	@Column({ name: "user_id", type: "character varying" })
	userId: string;

	@ManyToOne(() => UserProfileEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "user_id" })
	user: UserProfileEntity;

	@Column({ type: "text", unique: true })
	endpoint: string;

	@Column({ type: "character varying", length: 128 })
	p256dh: string;

	@Column({ type: "character varying", length: 64 })
	auth: string;

	/** Language of the notification text: `en` or `es`. */
	@Column({ type: "character varying", length: 8 })
	locale: string;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" })
	createdAt: Date;

	@Column({ name: "last_used_at", type: "timestamptz", nullable: true })
	lastUsedAt: Date | null;
}
