-- Rebuild player_stats from the recorded matches and achievements.
--
-- A historical defect dropped losses: a player whose record on a (ban list,
-- season) was only losses never got a stats row at all, and some rows lost part
-- of their losses. Wins were never affected. The matches themselves were always
-- recorded, so the ladders can be rebuilt from them rather than estimated.
--
-- Rules, both verified against production data before writing this:
--   wins   = matches won        (anulled and soft-deleted matches excluded)
--   losses = matches lost
--   points = sum of match points
--          + achievement points whose labels name this ladder in this season
--   "Global" is the same aggregate over every ban list, "N/A" included.
-- The "N/A" ladder (matches played with no ban list) is rebuilt like any
-- other, so Global always equals the sum of its parts.
--
-- Ratings are untouched: Elo depends on the order matches were played.
--
-- Run BEFORE the rank_id migrations, on the ban_list_name schema:
--   psql -h <host> -p <port> -U <user> -d evolution -f rebuild-player-stats.sql
--
-- Set report_only to true for a dry run that prints the diff and rolls back.

\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE rebuild_options (report_only boolean NOT NULL) ON COMMIT DROP;
INSERT INTO rebuild_options VALUES (true);   -- <<< set to false to apply

-- Achievement points, exploded to the ladders their labels name.
CREATE TEMP TABLE achievement_points ON COMMIT DROP AS
SELECT ua.user_id, ua.season, label AS ban_list_name, sum(a.earned_points)::int AS points
FROM user_achievements ua
JOIN achievements a ON a.id = ua.achievement_id
CROSS JOIN LATERAL json_array_elements_text(ua.labels) AS label
GROUP BY 1, 2, 3;

-- Per-ban-list ladders plus the Global aggregate, from real matches.
CREATE TEMP TABLE rebuilt ON COMMIT DROP AS
WITH played AS (
	SELECT user_id, ban_list_name, season, winner, points
	FROM matches
	WHERE anulled = false AND deleted_at IS NULL
), per_list AS (
	SELECT user_id, ban_list_name, season,
	       count(*) FILTER (WHERE winner)::int AS wins,
	       count(*) FILTER (WHERE NOT winner)::int AS losses,
	       sum(points)::int AS points
	FROM played
	GROUP BY 1, 2, 3
), global AS (
	SELECT user_id, 'Global' AS ban_list_name, season,
	       count(*) FILTER (WHERE winner)::int AS wins,
	       count(*) FILTER (WHERE NOT winner)::int AS losses,
	       sum(points)::int AS points
	FROM played
	GROUP BY 1, 3
), combined AS (
	SELECT * FROM per_list UNION ALL SELECT * FROM global
)
SELECT b.user_id, b.ban_list_name, b.season, b.wins, b.losses,
       b.points + COALESCE(ap.points, 0) AS points
FROM combined b
LEFT JOIN achievement_points ap
       ON ap.user_id = b.user_id AND ap.season = b.season AND ap.ban_list_name = b.ban_list_name;

-- What the rebuild would change.
CREATE TEMP TABLE rebuild_diff ON COMMIT DROP AS
SELECT COALESCE(r.user_id, s.user_id) AS user_id,
       COALESCE(r.ban_list_name, s.ban_list_name) AS ban_list_name,
       COALESCE(r.season, s.season) AS season,
       s.wins AS old_wins, s.losses AS old_losses, s.points AS old_points,
       r.wins AS new_wins, r.losses AS new_losses, r.points AS new_points,
       CASE WHEN s.user_id IS NULL THEN 'insert'
            WHEN r.user_id IS NULL THEN 'orphan'
            WHEN s.wins = r.wins AND s.losses = r.losses AND s.points = r.points THEN 'unchanged'
            WHEN s.wins > r.wins OR s.losses > r.losses THEN 'shrinks'
            ELSE 'grows' END AS kind
FROM rebuilt r
FULL JOIN player_stats s
       ON s.user_id = r.user_id AND s.ban_list_name = r.ban_list_name AND s.season = r.season;

SELECT kind, count(*) AS rows FROM rebuild_diff GROUP BY kind ORDER BY rows DESC;

-- Rows losing recorded wins or losses have no evidence behind them in matches;
-- they are listed in full so the decision is never silent.
SELECT ban_list_name, season, old_wins, old_losses, new_wins, new_losses
FROM rebuild_diff WHERE kind = 'shrinks' ORDER BY ban_list_name, season;

-- Ladders with a stats row but no matches at all (legacy imports).
SELECT ban_list_name, season, count(*) AS rows
FROM rebuild_diff WHERE kind = 'orphan' GROUP BY 1, 2 ORDER BY 3 DESC;

DO $$
DECLARE
	dry boolean;
BEGIN
	SELECT report_only INTO dry FROM rebuild_options;
	IF dry THEN
		RAISE EXCEPTION 'DRY RUN — report above, nothing written. Set report_only to false to apply.';
	END IF;
END $$;

UPDATE player_stats s
SET wins = r.wins, losses = r.losses, points = r.points
FROM rebuilt r
WHERE s.user_id = r.user_id AND s.ban_list_name = r.ban_list_name AND s.season = r.season
  AND (s.wins <> r.wins OR s.losses <> r.losses OR s.points <> r.points);

INSERT INTO player_stats (user_id, ban_list_name, season, wins, losses, points)
SELECT r.user_id, r.ban_list_name, r.season, r.wins, r.losses, r.points
FROM rebuilt r
WHERE NOT EXISTS (
	SELECT 1 FROM player_stats s
	WHERE s.user_id = r.user_id AND s.ban_list_name = r.ban_list_name AND s.season = r.season
);

COMMIT;
