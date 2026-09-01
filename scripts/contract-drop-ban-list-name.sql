-- Contract step: retire ban_list_name once every writer uses rank_id.
--
-- This is deliberately NOT a migration. Migrations run automatically and all at
-- once, and this is the one destructive step of the rank_id move: it must be a
-- decision, taken when the new server and API have been running long enough to
-- trust. Until then the tables carry both columns and either version can write.
--
--   psql -h <host> -p <port> -U <user> -d evolution -f contract-drop-ban-list-name.sql
--
-- Run topup-rank-id.sql first: this refuses to continue while any row is
-- still unmapped. Reversal is the pre-run backup.

\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE contract_options (report_only boolean NOT NULL) ON COMMIT DROP;
INSERT INTO contract_options VALUES (true);   -- <<< set to false to apply

SELECT 'player_stats'   AS table_name, count(*) FILTER (WHERE rank_id IS NULL) AS unmapped, count(*) AS rows FROM player_stats
UNION ALL SELECT 'player_ratings', count(*) FILTER (WHERE rank_id IS NULL), count(*) FROM player_ratings
UNION ALL SELECT 'rating_history', count(*) FILTER (WHERE rank_id IS NULL), count(*) FROM rating_history;

DO $$
DECLARE
	dry boolean;
	stuck bigint;
BEGIN
	SELECT count(*) INTO stuck FROM (
		SELECT 1 FROM player_stats   WHERE rank_id IS NULL
		UNION ALL SELECT 1 FROM player_ratings WHERE rank_id IS NULL
		UNION ALL SELECT 1 FROM rating_history WHERE rank_id IS NULL
	) x;
	IF stuck > 0 THEN
		RAISE EXCEPTION 'ABORT: % rows still have no rank_id — their ban list has no rank row', stuck;
	END IF;

	SELECT report_only INTO dry FROM contract_options;
	IF dry THEN
		RAISE EXCEPTION 'DRY RUN — top-up counted above, nothing dropped. Set report_only to false to apply.';
	END IF;
END $$;

ALTER TABLE "player_stats"   ALTER COLUMN "rank_id" SET NOT NULL;
ALTER TABLE "player_ratings" ALTER COLUMN "rank_id" SET NOT NULL;
ALTER TABLE "rating_history" ALTER COLUMN "rank_id" SET NOT NULL;

DROP INDEX IF EXISTS "public"."IDX_23e2bf8c6fb0b1ed0462bec18d";
DROP INDEX IF EXISTS "public"."IDX_b7572760014b333b1477ae0dcf";
DROP INDEX IF EXISTS "public"."IDX_78654e82aa4c1de9dd7a7a3e53";

ALTER TABLE "player_stats"   DROP COLUMN "ban_list_name";
ALTER TABLE "player_ratings" DROP COLUMN "ban_list_name";
ALTER TABLE "rating_history" DROP COLUMN "ban_list_name";

COMMIT;
