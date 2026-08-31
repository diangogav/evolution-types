import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("player_stats")
@Index(["userId", "rankId", "season"], { unique: true })
export class PlayerStatsEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "rank_id" })
	rankId: string;

	@Column()
	wins: number;

	@Column()
	losses: number;

	@Column()
	points: number;

	@Column({ name: "user_id" })
	userId: string;

	@Column()
	season: number;
}
