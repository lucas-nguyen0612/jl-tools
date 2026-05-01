-- ============================================================
-- 00026_avatars_bucket_5mb.sql
--
-- WHAT
--   Raises the `avatars` bucket file_size_limit from 2 MB to 5 MB.
--
-- WHY
--   Product update — original 2 MB cap (set in 00024) was too tight
--   for high-DPR portrait uploads.
-- ============================================================

update storage.buckets
set file_size_limit = 5242880 -- 5 MB
where id = 'avatars';
