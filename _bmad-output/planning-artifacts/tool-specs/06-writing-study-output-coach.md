# Tool Spec 06: Writing and Study Output Coach

## Quick Spec

**Goal:** Help users improve essays, summaries, reports, and study outputs with focused feedback on clarity, structure, rubric coverage, and next edits.

**Primary users:** Students, content creators, professionals writing reports.  
**Route:** `app/(app)/writing-coach/page.tsx`  
**Domain folder:** `features/writing-coach/`  
**UI folder:** `components/writing-coach/`

## Product Story

As a learner or knowledge worker, I want feedback on a draft so that I can improve structure and clarity before submission.

## MVP Scope

- Paste draft text.
- Select output type: essay, summary, report, study note.
- Optional rubric/checklist input.
- AI feedback in categories: clarity, structure, evidence, missing points, next edits.
- Save review history.
- Award XP for completing a review and applying revisions.

## Out of Scope

- Full plagiarism detection.
- Citation database integration.
- Real-time grammar underlines.
- Generic long-form content generation.

## User Stories and Acceptance Criteria

### Story WC-1: Submit Draft for Review

As a user, I want to submit a draft for structured feedback so that I know what to improve.

Acceptance criteria:
- Given I paste a draft, when I choose type and submit, then the app returns structured feedback.
- Given the draft is too short, then validation blocks the request.
- Given AI review fails, then the app shows retry and preserves the draft.

Tasks:
- Add `writing_reviews` table.
- Add AI provider abstraction or reuse future provider from flashcard generation.
- Add `reviewWritingDraft` server action.
- Build `DraftInputPanel`.
- Build `ReviewFeedbackPanel`.

### Story WC-2: Rubric and Checklist Review

As a student, I want to paste assignment criteria so that feedback checks my work against the rubric.

Acceptance criteria:
- Given I provide rubric text, then feedback includes rubric coverage.
- Given no rubric is provided, then the app uses a default checklist for the selected type.
- Given feedback renders, then missing criteria are visually separated from general suggestions.

Tasks:
- Add prompt templates by output type.
- Build `RubricInput`.
- Build `RubricCoverageList`.
- Add tests for request payload shaping.

### Story WC-3: Revision Task List

As a user, I want feedback converted into actionable tasks so that I can revise the draft step by step.

Acceptance criteria:
- Given feedback has suggestions, then the app displays revision tasks.
- Given I mark a revision task done, then progress updates.
- Given all revision tasks are done, then XP is awarded once.

Tasks:
- Add `writing_review_tasks` table.
- Add `completeWritingReviewTask` server action.
- Build `RevisionTaskList`.
- Award XP when all tasks for a review are complete.

### Story WC-4: Save Review History

As a user, I want to see past writing reviews so that I can track improvement over time.

Acceptance criteria:
- Given I completed reviews, then history lists recent reviews.
- Given I open a past review, then feedback and tasks are visible.
- Given I delete a review, then it is soft-deleted or archived.

Tasks:
- Add `WritingReviewHistory`.
- Add archive action.
- Add route `app/(app)/writing-coach/[reviewId]/page.tsx`.

## Data Model Draft

```sql
writing_reviews(id, user_id, title, output_type, draft_text_hash, rubric_text_hash, feedback_json, status, archived_at, created_at, updated_at)
writing_review_tasks(id, user_id, review_id, title, category, status, completed_at, sort_order)
```

## AI Rules

- Store hashes or short excerpts where possible; avoid storing unnecessary full source text unless user explicitly saves it.
- Keep feedback structured as JSON.
- Do not promise correctness of citations or factual claims without source verification.
- Position as review and coaching, not academic dishonesty.

## Quick Dev File Checklist

- `app/(app)/writing-coach/page.tsx`
- `app/(app)/writing-coach/[reviewId]/page.tsx`
- `features/writing-coach/actions.ts`
- `features/writing-coach/provider.ts`
- `features/writing-coach/prompts.ts`
- `features/writing-coach/types.ts`
- `components/writing-coach/DraftInputPanel.tsx`
- `components/writing-coach/RubricInput.tsx`
- `components/writing-coach/ReviewFeedbackPanel.tsx`
- `components/writing-coach/RevisionTaskList.tsx`
- `supabase/migrations/00026_writing_coach.sql`

## Test Plan

- Short drafts fail validation.
- AI failure preserves user draft.
- Review feedback parses as structured JSON.
- Completing all revision tasks awards XP once.
- Review history only shows current user's reviews.

