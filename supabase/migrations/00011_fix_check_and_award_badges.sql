-- ============================================================
-- FIX: check_and_award_badges missing 'total_habits_completed' branch
-- Seed badge `first_habit` uses condition_type = 'total_habits_completed',
-- which had no matching WHEN in the CASE and no ELSE clause, so the
-- function threw "case not found". That exception propagated up through
-- award_xp() → update_streak() trigger and rolled back every habit
-- check-in insert, making the "hoàn thành habit" button appear broken.
-- ============================================================

create or replace function check_and_award_badges(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_stats character_stats%rowtype;
  v_badge record;
begin
  select * into v_stats from character_stats where user_id = p_user_id;
  if not found then return; end if;

  for v_badge in
    select b.* from badges b
    where not exists (
      select 1 from user_badges ub where ub.user_id = p_user_id and ub.badge_id = b.id
    )
  loop
    case v_badge.condition_type
      when 'total_xp' then
        if v_stats.total_xp >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'level' then
        if v_stats.level >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'total_pomodoros' then
        if v_stats.total_pomodoros >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'longest_streak' then
        if v_stats.longest_streak >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'total_cards_reviewed' then
        if v_stats.total_cards_reviewed >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      when 'total_habits_completed' then
        if v_stats.total_habits_completed >= v_badge.condition_value then
          insert into user_badges (user_id, badge_id) values (p_user_id, v_badge.id) on conflict do nothing;
        end if;
      else
        null;
    end case;
  end loop;
end;
$$;
