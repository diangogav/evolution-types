import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("achievements")
export class AchievementEntity {
	@PrimaryColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column()
	icon: string;

	@Column({ type: "varchar", length: 64, nullable: true, unique: true })
	code: string | null;

	@Column({ name: "earned_points" })
	earnedPoints: number;

	@Column({ name: "essence_reward", default: 50 })
	essenceReward: number;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	@DeleteDateColumn({ name: "deleted_at", nullable: true })
	deletedAt: Date | null;
}
