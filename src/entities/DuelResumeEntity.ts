import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity({
	name: "duels",
})
export class DuelResumeEntity {
	@PrimaryColumn()
	id: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "game_id" })
	gameId: string;

	@Column({ name: "player_names", type: "simple-array" })
	playerNames: string[];

	@Column({ name: "opponent_names", type: "simple-array" })
	opponentNames: string[];

	@Column()
	date: Date;

	@Column({ name: "ban_list_name" })
	banListName: string;

	@Column({ name: "ban_list_hash" })
	banListHash: string;

	@Column()
	result: string;

	@Column()
	turns: number;

	@Column({ name: "match_id" })
	matchId: string;

	/**
	 * Domain identity of the single game this row belongs to. duels rows are
	 * one per player per game, so the same duel_id appears on every player's
	 * row of that game — it is the cross-player correlation key, never unique.
	 * Null on rows persisted before the column existed (no reliable backfill).
	 */
	@Column({ name: "duel_id", type: "uuid", nullable: true })
	duelId: string | null;

	@Column()
	season: number;

	@Column({ name: "ip_address", type: "varchar", nullable: true, default: null })
	ipAddress: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at", nullable: true })
	deletedAt: Date | null;
}
