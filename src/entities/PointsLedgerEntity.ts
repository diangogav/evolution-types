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
import { UserProfileEntity } from "./UserProfileEntity";

@Entity("points_ledger")
@Index(["gameId", "userId", "rankId", "kind", "cycle"], { unique: true })
@Index(["userId", "rankId", "season"])
@Index(["gameId", "kind"])
export class PointsLedgerEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "uuid", name: "game_id" })
	gameId: string;

	@Column({ name: "user_id" })
	userId: string;

	@ManyToOne(() => UserProfileEntity, { onDelete: "NO ACTION" })
	@JoinColumn({ name: "user_id" })
	user: UserProfileEntity;

	@Column({ type: "uuid", name: "rank_id" })
	rankId: string;

	@ManyToOne(() => RankEntity, { onDelete: "NO ACTION" })
	@JoinColumn({ name: "rank_id" })
	rank: RankEntity;

	@Column()
	season: number;

	@Column({ type: "varchar" })
	kind: "applied" | "reversal" | "reinstatement";

	@Column({ type: "smallint", default: 0 })
	cycle: number;

	@Column({ name: "points_delta" })
	pointsDelta: number;

	@Column({ type: "smallint", name: "wins_delta" })
	winsDelta: number;

	@Column({ type: "smallint", name: "losses_delta" })
	lossesDelta: number;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
