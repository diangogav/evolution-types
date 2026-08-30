import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("player_ratings")
@Index(["userId", "banListName", "season"], { unique: true })
export class PlayerRatingEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ name: "user_id" })
	userId: string;

	@Column({ name: "ban_list_name" })
	banListName: string;

	@Column()
	season: number;

	@Column({ default: 1000 })
	rating: number;

	@Column({ name: "games_played", default: 0 })
	gamesPlayed: number;

	@Column({ default: 1000 })
	peak: number;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
