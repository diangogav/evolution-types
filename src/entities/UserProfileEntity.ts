import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

import { UserProfileRole } from "../types/UserProfileRole";

@Entity({
	name: "users",
})
export class UserProfileEntity {
	@PrimaryColumn()
	id: string;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@Column({ name: "secure_password", type: "varchar", nullable: true })
	securePassword: string | null;

	@Column({ unique: true })
	email: string;

	/** When the address was proven to belong to the user; null while unproven. */
	@Column({ name: "email_verified_at", type: "timestamptz", nullable: true })
	emailVerifiedAt: Date | null;

	@Column("simple-json", { nullable: true })
	avatar: string | null;

	@Column({
		type: "enum",
		enum: UserProfileRole,
		default: UserProfileRole.USER,
	})
	role: UserProfileRole;

	/** Discord account linked to this user; one Discord account maps to one user. */
	@Index("UQ_users_discord_id", { unique: true })
	@Column({ name: "discord_id", type: "varchar", nullable: true })
	discordId: string | null;

	@Column({ name: "participant_id", nullable: true })
	participantId: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at", nullable: true })
	deletedAt: Date | null;
}
