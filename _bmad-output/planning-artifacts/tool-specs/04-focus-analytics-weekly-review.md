# Tool Spec 04: Focus Analytics and Weekly Review

## Quick Spec

**Goal:** Convert existing activity logs into actionable insight, weekly summaries, and next-week targets.

**Primary users:** Students, freelancers, productivity-focused users.  
**Route:** `app/(app)/analytics/page.tsx`  
**Domain folder:** `features/analytics/`  
**UI folder:** `components/analytics/`

## Product Story

As a JL-Tools user, I want weekly analytics that summarize focus, habits, flashcards, and XP so that I understand my progress and can improve next week.

## MVP Scope

- Weekly dashboard for focus minutes, Pomodoro count, habit completion, flashcard reviews, retention, XP gain.
- Best focus day/time insights.
- Trend comparison against previous week.
- Weekly review completion event with XP.
- Suggested next-week targets.

## Out of Scope

- Complex predictive analytics.
- AI narrative summaries.
- Export to PDF.
- Cross-user benchmarking.

## User Stories and Acceptance Criteria

### Story FA-1: Weekly Analytics Dashboard

As a user, I want to see my weekly performance across all tools so that I can understand what I accomplished.

Acceptance criteria:
- Given I open Analytics, then I see current week summary cards.
- Given I have no activity, then I see useful empty states and suggested first actions.
- Given I change week, then metrics update for that week.

Tasks:
- Add analytics queries across Pomodoro, habits, flashcards, XP transactions.
- Build `WeeklySummaryCards`.
- Build `WeekSelector`.
- Add loading and error states.

### Story FA-2: Focus Pattern Insight

As a user, I want to know when I focus best so that I can schedule important work in better time windows.

Acceptance criteria:
- Given I have completed Pomodoro sessions, then the app shows best focus weekday and hour range.
- Given there is insufficient data, then it states that more sessions are needed.
- Given sessions include interruptions, then clean session rate is displayed.

Tasks:
- Add `computeFocusPatterns` utility.
- Build `FocusPatternPanel`.
- Add test fixtures for sparse and dense data.

### Story FA-3: Flashcard and Habit Trends

As a learner, I want to understand review consistency and habit completion so that I know where discipline is slipping.

Acceptance criteria:
- Given I reviewed flashcards, then review count and rating distribution are shown.
- Given I completed habits, then completion rate and streak activity are shown.
- Given the current week is weaker than previous week, then trend delta is visible.

Tasks:
- Add `FlashcardTrendChart`.
- Add `HabitConsistencyPanel`.
- Reuse `Heatmap` or `Sparkline` where appropriate.

### Story FA-4: Complete Weekly Review

As a user, I want to complete a weekly review so that reflection becomes part of the RPG loop.

Acceptance criteria:
- Given the weekly review is incomplete, when I confirm reflection, then review is marked complete.
- Given the review is complete, then XP cannot be awarded again for the same week.
- Given review completes, then the app suggests next-week targets.

Tasks:
- Add `weekly_reviews` table.
- Add `completeWeeklyReview` server action.
- Build `WeeklyReviewPanel`.
- Award XP once per user/week.

## Data Model Draft

```sql
weekly_reviews(id, user_id, week_start_date, focus_target_minutes, habit_target_count, flashcard_target_count, reflection_note, completed_at, xp_awarded)
```

Most analytics should be computed from existing immutable logs instead of duplicating data.

## Quick Dev File Checklist

- `app/(app)/analytics/page.tsx`
- `features/analytics/queries.ts`
- `features/analytics/actions.ts`
- `features/analytics/compute.ts`
- `features/analytics/types.ts`
- `components/analytics/WeeklySummaryCards.tsx`
- `components/analytics/FocusPatternPanel.tsx`
- `components/analytics/HabitConsistencyPanel.tsx`
- `components/analytics/FlashcardTrendChart.tsx`
- `components/analytics/WeeklyReviewPanel.tsx`
- `supabase/migrations/00024_weekly_reviews.sql`

## Test Plan

- Empty activity renders empty states without crashing.
- Week boundaries respect user timezone.
- Weekly review awards XP once.
- Previous-week comparisons are correct.
- Analytics queries never expose another user's data.

