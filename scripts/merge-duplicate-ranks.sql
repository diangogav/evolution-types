-- Merge duplicate ranks created by banlist header renames.
-- Requires: backfill_ranks_and_rank_id migration already applied (rank_id present).
-- Edit the VALUES list per environment, then run inside a transaction:
--   psql -h <host> -U <user> -d <db> -f merge-duplicate-ranks.sql
--
-- Behavior per (source, target) pair:
--   * If any user has rows in BOTH ranks for the same season, the script ABORTS (no silent data invention).
--   * If the target rank does not exist, the source rank is simply RENAMED to the target name.
--   * Otherwise rows are re-pointed to the target rank and the source rank is deleted.

BEGIN;

CREATE TEMP TABLE rank_merges (source_name text NOT NULL, target_name text NOT NULL) ON COMMIT DROP;

INSERT INTO rank_merges (source_name, target_name) VALUES
	('2011.09 Tengu Plant', '2011.09 Tengu'),
	('JTP', 'JTP (Original)');

DO $$
DECLARE
	m RECORD;
	src_id uuid;
	tgt_id uuid;
	collisions bigint;
BEGIN
	FOR m IN SELECT * FROM rank_merges LOOP
		SELECT id INTO src_id FROM ranks WHERE name = m.source_name;
		IF src_id IS NULL THEN
			RAISE NOTICE 'skip: source rank "%" not found', m.source_name;
			CONTINUE;
		END IF;

		SELECT id INTO tgt_id FROM ranks WHERE name = m.target_name;
		IF tgt_id IS NULL THEN
			UPDATE ranks SET name = m.target_name WHERE id = src_id;
			RAISE NOTICE 'renamed: "%" -> "%"', m.source_name, m.target_name;
			CONTINUE;
		END IF;

		SELECT count(*) INTO collisions FROM (
			SELECT user_id, season FROM player_stats WHERE rank_id = src_id
			INTERSECT
			SELECT user_id, season FROM player_stats WHERE rank_id = tgt_id
		) c;
		IF collisions > 0 THEN
			RAISE EXCEPTION 'ABORT: % user/season collisions between "%" and "%" in player_stats — resolve manually', collisions, m.source_name, m.target_name;
		END IF;

		SELECT count(*) INTO collisions FROM (
			SELECT user_id, season FROM player_ratings WHERE rank_id = src_id
			INTERSECT
			SELECT user_id, season FROM player_ratings WHERE rank_id = tgt_id
		) c;
		IF collisions > 0 THEN
			RAISE EXCEPTION 'ABORT: % user/season collisions between "%" and "%" in player_ratings — resolve manually', collisions, m.source_name, m.target_name;
		END IF;

		UPDATE player_stats SET rank_id = tgt_id WHERE rank_id = src_id;
		UPDATE player_ratings SET rank_id = tgt_id WHERE rank_id = src_id;
		UPDATE rating_history SET rank_id = tgt_id WHERE rank_id = src_id;
		DELETE FROM rank_members WHERE rank_id = src_id;
		DELETE FROM ranks WHERE id = src_id;
		RAISE NOTICE 'merged: "%" -> "%"', m.source_name, m.target_name;
	END LOOP;
END $$;

COMMIT;
