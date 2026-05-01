# Tool Spec 01: Study Planner and Exam Roadmap

## Quick Spec

**Goal:** Help students convert exams, subjects, chapters, and available study days into a daily roadmap with quests, Pomodoro targets, and progress forecasting.

**Primary users:** Students, exam-prep learners, self-learners with deadlines.  
**Route:** `app/(app)/study-planner/page.tsx`  
**Domain folder:** `features/study-planner/`  
**UI folder:** `components/study-planner/`

## Product Story

As a student preparing for an exam, I want to enter my exam date, subjects, chapters, and weekly availability so that JL-Tools can generate daily study quests and keep me on track through XP, streaks, and visible progress.

## MVP Scope

- Create, edit, archive a study plan.
- Add subjects and chapters/topics with estimated effort.
- Set exam date, target score, weekly availability, and preferred session length.
- Generate daily roadmap items from today to exam date.
- Link roadmap items to Pomodoro sessions and Flashcard decks.
- Show progress state: on track, behind, ahead.
- Award XP when planned blocks are completed.

## Out of Scope

- AI-generated curriculum.
- Calendar integration.
- Collaborative plans.
- Full school timetable management.

## User Stories and Acceptance Criteria

### Story SP-1: Create Study Plan

As a learner, I want to create a study plan with exam date and subjects so that I can see what needs to be completed before the deadline.

Acceptance criteria:
- Given I am authenticated, when I open Study Planner, then I can create a new plan.
- Given I enter title, exam date, target score, and timezone, when I save, then a plan is persisted.
- Given the exam date is in the past, when I submit, then validation blocks the save.
- Given the plan is saved, when I return to the page, then it appears in my active plans.

Tasks:
- Add `study_plans` table.
- Add Zod schema for plan creation.
- Add `createStudyPlan`, `updateStudyPlan`, `archiveStudyPlan` server actions.
- Build `StudyPlanForm`.
- Build plan list and empty state.
- Add unit tests for validation.

### Story SP-2: Add Subjects and Chapters

As a learner, I want to break a plan into subjects and chapters so that the roadmap can distribute work realistically.

Acceptance criteria:
- Given a plan exists, when I add a subject, then it appears under the plan.
- Given a subject exists, when I add chapters with effort estimate, then chapters are ordered and saved.
- Given a chapter is completed, when I mark it done, then completion is persisted.

Tasks:
- Add `study_subjects` and `study_topics` tables.
- Build subject and topic CRUD actions.
- Build `SubjectList`, `TopicRow`, `EffortStepper`.
- Add drag reorder using existing `@dnd-kit` if reorder is included in MVP.
- Add RLS policies for owner-only access.

### Story SP-3: Generate Daily Roadmap

As a learner, I want JL-Tools to generate daily study blocks so that I know what to study today.

Acceptance criteria:
- Given a plan has topics and exam date, when I generate roadmap, then daily study blocks are created.
- Given my weekly availability excludes a weekday, then generated blocks avoid that day.
- Given I change availability, when I regenerate, then future incomplete blocks are recalculated.
- Given a day has too much workload, then the page warns me that the plan is overloaded.

Tasks:
- Add `study_availability` and `study_blocks` tables.
- Implement deterministic scheduling utility in `features/study-planner/scheduler.ts`.
- Add overload detection.
- Build `RoadmapTimeline`, `TodayStudyBlock`, `ProgressForecast`.
- Add tests for scheduler edge cases.

### Story SP-4: Complete Study Block and Award XP

As a learner, I want completed roadmap items to award XP so that my study progress grows my character.

Acceptance criteria:
- Given I complete a study block, when the server action succeeds, then XP is awarded once.
- Given I try to complete the same block twice, then duplicate XP is not awarded.
- Given a block is linked to a Pomodoro task, when the Pomodoro session completes, then the block can be marked complete.

Tasks:
- Add `completed_at`, `xp_awarded`, and `pomodoro_task_id` fields to `study_blocks`.
- Add `completeStudyBlock` server action.
- Call existing XP award function server-side.
- Trigger `XPGainOverlay` and `LevelUpModal`.
- Add idempotency test.

## Data Model Draft

```sql
study_plans(id, user_id, title, exam_date, target_score, timezone, status, created_at, updated_at)
study_subjects(id, user_id, plan_id, name, color, sort_order, created_at, updated_at)
study_topics(id, user_id, subject_id, title, effort_minutes, mastery_target, status, sort_order, created_at, updated_at)
study_availability(id, user_id, plan_id, weekday, available_minutes)
study_blocks(id, user_id, plan_id, topic_id, scheduled_date, planned_minutes, status, completed_at, xp_awarded, pomodoro_task_id)
```

## Quick Dev File Checklist

- `app/(app)/study-planner/page.tsx`
- `app/(app)/study-planner/StudyPlannerClient.tsx`
- `features/study-planner/actions.ts`
- `features/study-planner/queries.ts`
- `features/study-planner/types.ts`
- `features/study-planner/scheduler.ts`
- `components/study-planner/StudyPlanForm.tsx`
- `components/study-planner/RoadmapTimeline.tsx`
- `components/study-planner/ProgressForecast.tsx`
- `supabase/migrations/00021_study_planner.sql`

## Test Plan

- Scheduler distributes workload only across available days.
- Past exam dates fail validation.
- Completing a block awards XP exactly once.
- RLS blocks access to another user's plan.
- Mobile layout shows today's block before long roadmap history.

