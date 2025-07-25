import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { config } from "./config";
import { AchievementEntity } from "./entities/AchievementEntity";
import { DuelResumeEntity } from "./entities/DuelResumeEntity";
import { LightningTournamentEntity } from "./entities/LightningTournamentEntity";
import { MatchResumeEntity } from "./entities/MatchResumeEntity";
import { PlayerStatsEntity } from "./entities/PlayerStatsEntity";
import { TournamentEntity } from "./entities/TournamentEntity";
import { UserAchievementEntity } from "./entities/UserAchievementEntity";
import { UserBanEntity } from "./entities/UserBanEntity";
import { UserProfileEntity } from "./entities/UserProfileEntity";

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
		UserAchievementEntity,
		LightningTournamentEntity,
		UserBanEntity,
	],
	subscribers: [],
	migrations: [join(__dirname, "/migrations/*.ts")],
};
export const dataSource = new DataSource(options);
