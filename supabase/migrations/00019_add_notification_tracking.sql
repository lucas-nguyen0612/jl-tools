-- ============================================================
-- 00019_add_notification_tracking.sql
-- Persistent "seen" tracking for badge-unlock and level-up
-- notifications shown in the dashboard bell.
-- ============================================================

alter table character_stats
  add column if not exists last_badges_seen_at timestamptz,
  add column if not exists last_level_seen integer;

-- Backfill so existing users do not see phantom notifications on first load
-- after this migration ships. Anything earned/leveled up to before now is
-- considered already-seen.
update character_stats
set last_badges_seen_at = now()
where last_badges_seen_at is null;

update character_stats
set last_level_seen = level
where last_level_seen is null;
