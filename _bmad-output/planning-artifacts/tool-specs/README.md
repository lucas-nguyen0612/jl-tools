# JL-Tools Expansion Tool Specs

**Date:** 2026-04-25  
**Purpose:** Quick spec and quick dev planning documents for post-MVP tool expansion.  
**Project context:** JL-Tools currently includes Pomodoro, Habit Tracker, Flashcards, and unified RPG gamification.

## Recommended Build Order

1. [Study Planner and Exam Roadmap](./01-study-planner-exam-roadmap.md)
2. [AI Note to Flashcard and Quiz Generator](./02-ai-note-to-flashcard-quiz-generator.md)
3. [Project Quest Board](./03-project-quest-board.md)
4. [Focus Analytics and Weekly Review](./04-focus-analytics-weekly-review.md)
5. [Focus Guard and Distraction Blocker](./05-focus-guard-distraction-blocker.md)
6. [Writing and Study Output Coach](./06-writing-study-output-coach.md)
7. [Group Study and Accountability](./07-group-study-accountability.md)

## Shared Implementation Rules

- Keep Server Components as default and use client islands only for interactive surfaces.
- Put domain logic under `features/<tool-name>/`.
- Put UI components under `components/<tool-name>/`.
- Put routes under `app/(app)/<tool-name>/`.
- Add Supabase schema changes in a new numbered migration.
- Award XP only through the existing server-side XP path and Postgres functions.
- Reuse `XPBar`, `LevelBadge`, `XPGainOverlay`, `LevelUpModal`, `Heatmap`, `Sparkline`, and shadcn/ui primitives.
- Every tool must create at least one daily completion event that can feed quests, XP, streaks, and weekly review.

## Suggested Shared XP Values

These are planning values. Final values should be added to `lib/xp/constants.ts` and seeded into quests where needed.

| Action | XP |
|---|---:|
| Complete planned study block | 10 |
| Finish daily roadmap target | 25 |
| Generate and approve AI flashcards | 5 |
| Complete quiz | 10 |
| Complete project task | 10 |
| Complete project milestone | 35 |
| Review weekly report | 15 |
| Complete clean focus guard session | 5 bonus |
| Submit writing draft review | 10 |
| Join group focus room and finish session | 10 |

