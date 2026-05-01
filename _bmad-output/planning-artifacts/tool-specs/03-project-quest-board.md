# Tool Spec 03: Project Quest Board

## Quick Spec

**Goal:** Turn personal work projects into RPG quest lines with tasks, Pomodoro estimates, milestones, and XP.

**Primary users:** Freelancers, content creators, students managing assignments.  
**Route:** `app/(app)/quests/page.tsx` or `app/(app)/projects/page.tsx`  
**Domain folder:** `features/projects/`  
**UI folder:** `components/projects/`

## Product Story

As a freelancer or student, I want to manage projects as quest lines so that finishing tasks and milestones contributes to my character progress.

## MVP Scope

- Create projects with objective, deadline, status, and color.
- Create tasks with priority, estimated Pomodoro count, due date, and status.
- Kanban board: Backlog, Active, Done.
- Link tasks to Pomodoro sessions.
- Award XP for completed tasks and milestones.
- Project progress summary.

## Out of Scope

- Team collaboration.
- Comments and attachments.
- Client billing.
- External integrations.

## User Stories and Acceptance Criteria

### Story PQ-1: Create Project Quest

As a user, I want to create a project quest so that I can track a larger goal in JL-Tools.

Acceptance criteria:
- Given I am authenticated, when I create a project with title and deadline, then it appears on the quest board.
- Given the title is empty, when I save, then validation blocks submission.
- Given I archive a project, then it is hidden from active views but retained in history.

Tasks:
- Add `projects` table.
- Add project CRUD server actions.
- Build `ProjectQuestForm`, `ProjectQuestCard`, empty state.
- Add sidebar nav entry.

### Story PQ-2: Manage Tasks on Kanban Board

As a user, I want to move tasks across statuses so that project progress is easy to scan.

Acceptance criteria:
- Given a project exists, when I add a task, then it appears in Backlog.
- Given I drag a task to Active or Done, then status persists.
- Given a task is marked Done, then completed timestamp is saved.
- Given the task is already Done, then XP is not awarded again.

Tasks:
- Add `project_tasks` table.
- Build `QuestBoard`, `QuestColumn`, `QuestTaskCard`.
- Use `@dnd-kit` for drag and drop.
- Add `completeProjectTask` action with XP idempotency.
- Add tests for status transitions.

### Story PQ-3: Link Task to Pomodoro

As a user, I want a project task to become my Pomodoro focus target so that focus sessions count toward real work.

Acceptance criteria:
- Given a project task has estimated Pomodoros, when I start a Pomodoro from the task, then the timer uses that task as context.
- Given a Pomodoro session completes, then the task completed Pomodoro count increments.
- Given completed Pomodoros reach estimate, then the UI suggests marking the task done.

Tasks:
- Add nullable `project_task_id` to Pomodoro session or bridge table.
- Extend Pomodoro task selector to include project tasks.
- Add query for active project tasks.
- Update session completion flow.

### Story PQ-4: Milestone Boss Battle

As a user, I want large milestones to feel like boss battles so that major project progress is more motivating.

Acceptance criteria:
- Given a project has milestones, when all tasks in a milestone are done, then milestone completion is available.
- Given I complete a milestone, then bonus XP is awarded once.
- Given milestone completes, then a celebratory modal appears.

Tasks:
- Add `project_milestones` table.
- Build `MilestoneProgress`.
- Add `completeProjectMilestone` action.
- Reuse `LevelUpModal` style patterns for milestone feedback.

## Data Model Draft

```sql
projects(id, user_id, title, description, color, deadline, status, archived_at, created_at, updated_at)
project_milestones(id, user_id, project_id, title, due_date, sort_order, completed_at, xp_awarded)
project_tasks(id, user_id, project_id, milestone_id, title, notes, status, priority, due_date, estimated_pomodoros, completed_pomodoros, completed_at, xp_awarded, sort_order)
project_task_pomodoro_sessions(id, user_id, project_task_id, pomodoro_session_id)
```

## Quick Dev File Checklist

- `app/(app)/projects/page.tsx`
- `app/(app)/projects/ProjectsClient.tsx`
- `features/projects/actions.ts`
- `features/projects/queries.ts`
- `features/projects/types.ts`
- `components/projects/QuestBoard.tsx`
- `components/projects/QuestTaskCard.tsx`
- `components/projects/ProjectQuestForm.tsx`
- `components/projects/MilestoneProgress.tsx`
- `supabase/migrations/00023_project_quest_board.sql`

## Test Plan

- Project CRUD respects ownership.
- Drag status changes persist.
- Completing a task awards XP exactly once.
- Pomodoro completion increments linked task count.
- Milestone completion requires task completion and awards XP once.

