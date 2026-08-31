import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

import { config } from "./config";
import { AchievementEntity } from "./entities/AchievementEntity";
import { DuelResumeEntity } from "./entities/DuelResumeEntity";
import { LightningRankingEntity } from "./entities/LightningRankingEntity";
import { LightningTournamentEntity } from "./entities/LightningTournamentEntity";
import { MatchResumeEntity } from "./entities/MatchResumeEntity";
import { PlayerRatingEntity } from "./entities/PlayerRatingEntity";
import { PlayerStatsEntity } from "./entities/PlayerStatsEntity";
import { RatingHistoryEntity } from "./entities/RatingHistoryEntity";
import { RankEntity } from "./entities/RankEntity";
import { RankMemberEntity } from "./entities/RankMemberEntity";
import { TournamentEntity } from "./entities/TournamentEntity";
import { UserAchievementEntity } from "./entities/UserAchievementEntity";
import { UserBanEntity } from "./entities/UserBanEntity";
import { UserProfileEntity } from "./entities/UserProfileEntity";
import { UnrankedMatchEntity } from "./entities/UnrankedMatchEntity";
import { UnrankedDuelEntity } from "./entities/UnrankedDuelEntity";

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
		LightningRankingEntity,
		UnrankedMatchEntity,
		UnrankedDuelEntity,
		PlayerRatingEntity,
		RatingHistoryEntity,
		RankEntity,
		RankMemberEntity,
	],
	subscribers: [],
	migrations: [join(__dirname, "/migrations/*.ts")],
};
export const dataSource = new DataSource(options);
