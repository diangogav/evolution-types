-- Fill rank_id on rows written by a server that predates it.
--
-- During the expand phase both columns exist: the old server writes
-- ban_list_name and leaves rank_id NULL, the new one writes rank_id. A row the
-- old server wrote is invisible to the new one, which looks ladders up by
-- rank_id, so run this at the restart — after the old server stops and before
-- the new one starts — to hand those rows over. Safe to re-run.
--
--   psql -h <host> -p <port> -U <user> -d evolution -f topup-rank-id.sql
--
-- Where both a rank_id row and an older name-keyed row exist for the same
-- player, ladder and season, their totals are summed into the rank_id row: both
-- describe real matches and the ladder is one.

\set ON_ERROR_STOP on

BEGIN;

SELECT 'player_stats' AS table_name, count(*) FILTER (WHERE rank_id IS NULL) AS to_fill FROM player_stats
UNION ALL SELECT 'player_ratings', count(*) FILTER (WHERE rank_id IS NULL) FROM player_ratings
UNION ALL SELECT 'rating_history', count(*) FILTER (WHERE rank_id IS NULL) FROM rating_history;

-- player_stats: merge overlapping pairs, then adopt the rest.
WITH pending AS (
	SELECT s.id, s.user_id, s.season, s.wins, s.losses, s.points, r.id AS rank_id
	FROM player_stats s JOIN ranks r ON r.name = s.ban_list_name
	WHERE s.rank_id IS NULL
), merged AS (
	UPDATE player_stats t
	SET wins = t.wins + p.wins, losses = t.losses + p.losses, points = t.points + p.points
	FROM pending p
	WHERE t.user_id = p.user_id AND t.season = p.season AND t.rank_id = p.rank_id
	RETURNING p.id AS absorbed
)
DELETE FROM player_stats WHERE id IN (SELECT absorbed FROM merged);

UPDATE player_stats s SET rank_id = r.id FROM ranks r
WHERE s.rank_id IS NULL AND s.ban_list_name = r.name;

-- player_ratings: an Elo pool cannot be summed, so the rank_id row wins and the
-- older name-keyed row is dropped rather than blended into a fictional rating.
WITH pending AS (
	SELECT s.id, s.user_id, s.season, r.id AS rank_id
	FROM player_ratings s JOIN ranks r ON r.name = s.ban_list_name
	WHERE s.rank_id IS NULL
)
DELETE FROM player_ratings
WHERE id IN (
	SELECT p.id FROM pending p
	JOIN player_ratings t ON t.user_id = p.user_id AND t.season = p.season AND t.rank_id = p.rank_id
);

UPDATE player_ratings s SET rank_id = r.id FROM ranks r
WHERE s.rank_id IS NULL AND s.ban_list_name = r.name;

UPDATE rating_history s SET rank_id = r.id FROM ranks r
WHERE s.rank_id IS NULL AND s.ban_list_name = r.name;

DO $$
DECLARE
	stuck bigint;
BEGIN
	SELECT count(*) INTO stuck FROM (
		SELECT 1 FROM player_stats WHERE rank_id IS NULL
		UNION ALL SELECT 1 FROM player_ratings WHERE rank_id IS NULL
		UNION ALL SELECT 1 FROM rating_history WHERE rank_id IS NULL
	) x;
	IF stuck > 0 THEN
		RAISE EXCEPTION 'ABORT: % rows still have no rank_id — their ban list has no rank row', stuck;
	END IF;
	RAISE NOTICE 'every row now carries a rank_id';
END $$;

COMMIT;
