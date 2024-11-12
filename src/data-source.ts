import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { config } from "./config";
import { DuelResumeEntity } from "./entities/DuelResumeEntity";
import { MatchResumeEntity } from "./entities/MatchResumeEntity";
import { PlayerStatsEntity } from "./entities/PlayerStatsEntity";
import { TournamentEntity } from "./entities/TournamentEntity";
import { UserProfileEntity } from "./entities/UserProfileEntity";
import { AchievementEntity } from "./entities/AchievementEntity";
import { UserAchievementEntity } from "./entities/UserAchievementEntity";

const options: DataSourceOptions = {
	type: "postgres",
	host: config.postgres.host,
	port: config.postgres.port,
	username: config.postgres.username,
	password: config.postgres.password,
	database: config.postgres.database,
	synchronize: false,
	logging: true,
	entities: [
		UserProfileEntity,
		MatchResumeEntity,
		DuelResumeEntity,
		PlayerStatsEntity,
		TournamentEntity,
		AchievementEntity,
		UserAchievementEntity
	],
	subscribers: [],
	migrations: [join(__dirname, "/migrations/*.ts")],
};
export const dataSource = new DataSource(options);
