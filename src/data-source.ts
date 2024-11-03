import { DataSource, DataSourceOptions } from "typeorm";
import { UserProfileEntity } from "./entities/UserProfileEntity";
import { MatchResumeEntity } from "./entities/MatchResumeEntity";
import { DuelResumeEntity } from "./entities/DuelResumeEntity";
import { PlayerStatsEntity } from "./entities/PlayerStatsEntity";
import { TournamentEntity } from "./entities/TournamentEntity";
import { config } from "./config";

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
	],
	subscribers: [],
	migrations: ["src/shared/db/postgres/infrastructure/migrations/*.ts"],
};
export const dataSource = new DataSource(options);
