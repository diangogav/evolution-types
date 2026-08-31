-- Seed historical totals for group (format) ranks from their member ban lists.
--
-- Group ranks accumulate from live matches, so without this they would launch
-- empty and stay invisible until players produce new data. Points, wins and
-- losses are a plain sum of the member ladders, so every number here is derived
-- from real matches — nothing is invented.
--
-- Ratings are deliberately NOT backfilled: Elo depends on the order matches were
-- played and cannot be reconstructed. (It is also moot today: player_ratings is
-- empty, so there is no Elo history to preserve.)
--
-- Requires: the ranks/rank_members rows the game server seeds at boot, so run
-- this AFTER its first boot and BEFORE opening the server to players.
--
--   psql -h <host> -p <port> -U <user> -d evolution -f backfill-group-ranks.sql
--
-- Aborts (changing nothing) when groups are missing or when any group already
-- holds stats, so a double run can never double-count.

BEGIN;

DO $$
DECLARE
	group_count bigint;
	existing bigint;
BEGIN
	SELECT count(*) INTO group_count FROM ranks WHERE type = 'group' AND enabled;
	IF group_count = 0 THEN
		RAISE EXCEPTION 'ABORT: no enabled group ranks found — boot the game server first so it seeds them from config/rank-groups.json';
	END IF;

	SELECT count(*) INTO existing
	FROM player_stats s JOIN ranks r ON r.id = s.rank_id
	WHERE r.type = 'group';
	IF existing > 0 THEN
		RAISE EXCEPTION 'ABORT: group ranks already hold % stats rows — this backfill runs once, before the server takes matches', existing;
	END IF;

	RAISE NOTICE 'backfilling % enabled group rank(s)', group_count;
END $$;

-- Every member list contributed to its format while it was the current one, so a
-- season's format total is the sum of all of them. Membership uses the same
-- patterns the game server matches with: "* X" is a suffix, anything else exact.
WITH member AS (
	SELECT DISTINCT g.id AS group_id, b.id AS banlist_id
	FROM ranks g
	JOIN rank_members m ON m.rank_id = g.id
	JOIN ranks b ON b.type = 'banlist' AND b.enabled
	 AND (CASE WHEN m.pattern LIKE '* %'
	           THEN b.name LIKE '%' || substring(m.pattern from 3)
	            AND b.name <> substring(m.pattern from 3)
	           ELSE b.name = m.pattern END)
	WHERE g.type = 'group' AND g.enabled
)
INSERT INTO player_stats (user_id, rank_id, season, wins, losses, points)
SELECT s.user_id, member.group_id, s.season,
       SUM(s.wins), SUM(s.losses), SUM(s.points)
FROM player_stats s
JOIN member ON member.banlist_id = s.rank_id
GROUP BY s.user_id, member.group_id, s.season;

SELECT r.name AS rank, s.season, count(*) AS players, sum(s.wins) AS wins, sum(s.points) AS points
FROM player_stats s JOIN ranks r ON r.id = s.rank_id
WHERE r.type = 'group'
GROUP BY r.name, s.season
ORDER BY r.name, s.season;

COMMIT;
