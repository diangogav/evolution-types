import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("rating_history")
@Index(["matchId", "userId", "kind", "rankId"], { unique: true })
@Index(["userId", "rankId", "season"])
export class RatingHistoryEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "match_id" })
	matchId: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "rank_id" })
	rankId: string;

	@Column()
	season: number;

	@Column({ type: "varchar" })
	kind: "applied" | "reversal";

	@Column({ name: "previous_rating" })
	previousRating: number;

	@Column()
	delta: number;

	@Column({ name: "k_factor" })
	kFactor: number;

	@Column({ name: "opponent_rating" })
	opponentRating: number;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
