import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";

import { RankEntity } from "./RankEntity";

@Entity("rank_members")
@Index(["rankId", "pattern"], { unique: true })
export class RankMemberEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "rank_id" })
	rankId: string;

	@Column()
	pattern: string;

	@ManyToOne(() => RankEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "rank_id" })
	rank: RankEntity;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
