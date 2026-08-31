import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

export type RankType = "banlist" | "group" | "global";

@Entity("ranks")
export class RankEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ type: "varchar" })
	type: RankType;

	@Column({ default: true })
	enabled: boolean;

	@Column({ name: "only_current", default: false })
	onlyCurrent: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
