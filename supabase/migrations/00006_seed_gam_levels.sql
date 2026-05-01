-- ============================================================
-- 00006_seed_gam_levels.sql
-- Seeds the 20 gamification levels with XP thresholds and titles
-- Depends on: nothing (standalone seed, idempotent)
-- ============================================================

-- Gamification levels table
CREATE TABLE IF NOT EXISTS public.gam_levels (
  level     INTEGER PRIMARY KEY,
  min_xp    INTEGER NOT NULL,
  title_vi  TEXT    NOT NULL,
  title_en  TEXT    NOT NULL,

  CONSTRAINT level_range CHECK (level BETWEEN 1 AND 20),
  CONSTRAINT xp_positive CHECK (min_xp >= 0),
  CONSTRAINT unique_min_xp UNIQUE (min_xp)
);

-- Seed 20 levels (idempotent — only inserts if level doesn't exist)
INSERT INTO public.gam_levels (level, min_xp, title_vi, title_en) VALUES
  (1,  0,    'Tân binh',              'Rookie'),
  (2,  100,  'Người mới',            'Newcomer'),
  (3,  250,  'Học viên',             'Apprentice'),
  (4,  450,  'Chiến binh',           'Fighter'),
  (5,  700,  'Chiến binh kỷ luật',  'Discipline Warrior'),
  (6,  1000, 'Kiên trì',             'Perseverant'),
  (7,  1350, 'Siêng năng',           'Diligent'),
  (8,  1750, 'Thận trọng',           'Conscientious'),
  (9,  2200, 'Bậc thầy tập trung',   'Focus Master'),
  (10, 2700, 'Nhà vô địch',          'Champion'),
  (11, 3250, 'Huyền thoại',          'Legend'),
  (12, 3850, 'Tiên tri',             'Prophet'),
  (13, 4500, 'Sư phụ',               'Mentor'),
  (14, 5200, 'Đại sư',              'Grandmaster'),
  (15, 5950, 'Siêu sao',             'Superstar'),
  (16, 6750, 'Thánh nhân',           'Sage'),
  (17, 7600, 'Triết gia',            'Philosopher'),
  (18, 8500, 'Sáng tạo',             'Creator'),
  (19, 9450, 'Quái vật',             'Monster'),
  (20, 10500,'Huyền thoại vĩnh hằng','Eternal Legend')
ON CONFLICT (level) DO NOTHING;

COMMENT ON TABLE public.gam_levels IS '20 gamification levels with XP thresholds and bilingual titles';
COMMENT ON COLUMN public.gam_levels.min_xp IS 'Minimum total XP required to reach this level';
COMMENT ON COLUMN public.gam_levels.title_vi IS 'Vietnamese title displayed at this level';
COMMENT ON COLUMN public.gam_levels.title_en IS 'English title displayed at this level';
