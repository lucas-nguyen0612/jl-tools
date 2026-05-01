-- Add `search_user_content(p_user_id uuid, p_query text)` RPC.
--
-- Inline search dropdown (Phase B of dashboard polish) needs a single round
-- trip that searches a user's flashcard decks, habits, and pomodoro tasks
-- by name/title. We expose this as a Postgres function so the client doesn't
-- have to issue 3 parallel queries and merge them.
--
-- Security: SECURITY DEFINER so the function can read across tables without
-- relying on individual RLS predicates, but we explicitly guard with
-- `auth.uid()` to prevent any caller from passing another user's id and
-- leaking their content. Pattern matches 00017_secure_apply_sm2_and_award_xp.

create or replace function search_user_content(
  p_user_id uuid,
  p_query text
)
returns table(
  type text,
  id uuid,
  label text,
  sublabel text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_query text;
  v_pattern text;
begin
  v_caller := auth.uid();
  if v_caller is not null and v_caller <> p_user_id then
    raise exception 'Unauthorized: p_user_id does not match auth.uid()'
      using errcode = '42501';
  end if;

  v_query := btrim(coalesce(p_query, ''));
  if length(v_query) < 1 then
    return;
  end if;

  v_pattern := '%' || v_query || '%';

  return query
  (
    select
      'flashcard_deck'::text as type,
      d.id,
      d.name as label,
      d.description as sublabel
    from flashcard_decks d
    where d.user_id = p_user_id
      and d.name ilike v_pattern
  )
  union all
  (
    select
      'habit'::text as type,
      h.id,
      h.name as label,
      h.category as sublabel
    from habits h
    where h.user_id = p_user_id
      and h.is_archived = false
      and h.name ilike v_pattern
  )
  union all
  (
    select
      'pomodoro_task'::text as type,
      t.id,
      t.title as label,
      case when t.is_completed then 'completed' else null end as sublabel
    from pomodoro_tasks t
    where t.user_id = p_user_id
      and t.title ilike v_pattern
  )
  order by type, label
  limit 30;
end;
$$;

revoke all on function search_user_content(uuid, text) from public;
grant execute on function search_user_content(uuid, text) to authenticated;
