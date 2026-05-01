# Tool Spec 02: AI Note to Flashcard and Quiz Generator

## Quick Spec

**Goal:** Reduce flashcard creation friction by turning notes into draft flashcards, cloze cards, quizzes, and short explanations.

**Primary users:** Students, certification learners, self-learners.  
**Route:** `app/(app)/flashcards/generate/page.tsx` or modal inside Flashcards.  
**Domain folder:** `features/flashcards/ai-generation/` or `features/ai-study/`  
**UI folder:** `components/flashcard/ai-generation/`

## Product Story

As a learner, I want to paste study notes and generate flashcards or quizzes so that I can start reviewing immediately without manually writing every card.

## MVP Scope

- Paste text notes into a generator.
- Select output type: basic Q/A cards, cloze cards, multiple-choice quiz.
- Preview generated items before saving.
- Edit, reject, or approve generated items.
- Save approved cards into an existing or new deck.
- Track generation history and source text metadata.

## Out of Scope

- PDF upload.
- Image OCR.
- Public deck marketplace.
- Fully automatic save without human review.

## User Stories and Acceptance Criteria

### Story AI-FC-1: Generate Draft Cards From Notes

As a learner, I want to paste notes and generate draft cards so that I can convert study material faster.

Acceptance criteria:
- Given I paste notes with at least 200 characters, when I click generate, then draft cards appear.
- Given notes are too short, when I click generate, then validation asks for more context.
- Given AI generation fails, then the UI shows a retryable error and does not create cards.
- Given generation succeeds, then no cards are saved until I approve them.

Tasks:
- Add AI provider abstraction in `features/flashcards/ai-generation/provider.ts`.
- Add `generateFlashcardDrafts` server action.
- Add input validation and rate limit guard.
- Build `NoteInputPanel`, `GenerationOptions`, `DraftCardList`.
- Store generation request and response metadata.

### Story AI-FC-2: Review and Approve Draft Cards

As a learner, I want to edit generated cards before saving so that low-quality AI output does not pollute my deck.

Acceptance criteria:
- Given draft cards exist, when I edit front/back/tags, then edits are local until save.
- Given I reject a card, when I save, then rejected cards are not inserted.
- Given I approve cards, when I save, then cards are inserted into the selected deck.
- Given cards are saved, then deck counts update correctly.

Tasks:
- Build `DraftCardEditor`.
- Reuse existing flashcard card insertion patterns.
- Add bulk insert action with ownership checks.
- Add optimistic UI only after server success.
- Add tests for rejected vs approved drafts.

### Story AI-FC-3: Generate Quiz Mode

As a learner, I want to generate a quick quiz from notes so that I can test understanding before creating long-term flashcards.

Acceptance criteria:
- Given I choose quiz output, when generation succeeds, then questions include options and correct answer.
- Given I answer a quiz, when I submit, then I see score and explanations.
- Given I finish a quiz, then XP is awarded once.

Tasks:
- Add `ai_quizzes` and `ai_quiz_questions` tables.
- Build `GeneratedQuizSession`.
- Add `completeGeneratedQuiz` server action.
- Add XP event type for quiz completion.

### Story AI-FC-4: Convert Missed Quiz Items to Flashcards

As a learner, I want to convert missed quiz questions into flashcards so that weak knowledge enters spaced repetition.

Acceptance criteria:
- Given I miss a quiz question, when results render, then I can create a card from it.
- Given I create a card, then it is inserted into the chosen deck.
- Given the same quiz question was already converted, then duplicate conversion is blocked.

Tasks:
- Add `converted_card_id` to quiz question records.
- Build `ConvertToCardButton`.
- Add duplicate guard.

## Data Model Draft

```sql
ai_generation_jobs(id, user_id, source_type, source_text_hash, prompt_version, output_type, status, error_message, created_at)
ai_generated_items(id, user_id, job_id, item_type, front, back, cloze_text, options_json, answer_json, tags, status, saved_card_id)
ai_quizzes(id, user_id, job_id, title, completed_at, score, xp_awarded)
ai_quiz_questions(id, user_id, quiz_id, prompt, options_json, correct_answer, explanation, user_answer, is_correct, converted_card_id)
```

## AI Safety and Cost Rules

- Do not send user identity or unrelated profile data to the model.
- Truncate or chunk long notes before generation.
- Keep prompt versions in code and store `prompt_version`.
- Require user approval before saving generated study content.
- Add server-side rate limits before public launch.

## Quick Dev File Checklist

- `app/(app)/flashcards/generate/page.tsx`
- `features/flashcards/ai-generation/actions.ts`
- `features/flashcards/ai-generation/provider.ts`
- `features/flashcards/ai-generation/prompts.ts`
- `features/flashcards/ai-generation/types.ts`
- `components/flashcard/ai-generation/NoteInputPanel.tsx`
- `components/flashcard/ai-generation/DraftCardEditor.tsx`
- `components/flashcard/ai-generation/GeneratedQuizSession.tsx`
- `supabase/migrations/00022_ai_flashcard_generation.sql`

## Test Plan

- Too-short notes fail validation.
- AI failure leaves no saved cards.
- Approved cards are inserted; rejected drafts are ignored.
- Quiz completion awards XP once.
- RLS blocks access to another user's generation jobs.

