-- ============================================================
-- 00029_fix_habits_category_check.sql
-- Aligns habits.category check constraint with frontend values.
-- DB had: health, learning, work, social, custom
-- Frontend sends: health, fitness, learning, productivity, mindfulness, other
-- ============================================================

ALTER TABLE habits
  DROP CONSTRAINT IF EXISTS habits_category_check;

ALTER TABLE habits
  ADD CONSTRAINT habits_category_check
    CHECK (category IN ('health', 'fitness', 'learning', 'productivity', 'mindfulness', 'other'));

-- Migrate any rows with old category values to closest equivalent
UPDATE habits SET category = 'productivity' WHERE category = 'work';
UPDATE habits SET category = 'other'        WHERE category = 'social';
UPDATE habits SET category = 'other'        WHERE category = 'custom';
