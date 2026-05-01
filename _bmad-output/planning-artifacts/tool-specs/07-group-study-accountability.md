# Tool Spec 07: Group Study and Accountability

## Quick Spec

**Goal:** Add lightweight social accountability through focus rooms, small squads, mutual streaks, and group quests.

**Primary users:** Students, exam-prep groups, remote accountability partners.  
**Route:** `app/(app)/groups/page.tsx`  
**Domain folder:** `features/groups/`  
**UI folder:** `components/groups/`

## Product Story

As a learner, I want to join a small study room with peers so that I stay accountable and complete focus sessions more consistently.

## MVP Scope

- Create or join a small study room.
- Room has title, goal, active session state, and member list.
- Members can start a synchronized focus session.
- Completion contributes to individual XP and room progress.
- Group quest summary.

## Out of Scope

- Public discovery feed.
- Chat moderation at scale.
- Voice/video calls.
- Large leaderboards.
- Payments or tutoring marketplace.

## User Stories and Acceptance Criteria

### Story GS-1: Create Private Study Room

As a user, I want to create a private study room so that invited peers can study with me.

Acceptance criteria:
- Given I create a room, then I become owner.
- Given the room is private, then only invite code users can join.
- Given I archive the room, then members no longer see it as active.

Tasks:
- Add `study_rooms` and `study_room_members` tables.
- Add room CRUD actions.
- Generate invite code server-side.
- Build `StudyRoomForm`, `RoomList`, `RoomInvitePanel`.

### Story GS-2: Join Room by Invite Code

As a learner, I want to join with an invite code so that group access stays controlled.

Acceptance criteria:
- Given I enter a valid invite code, then I join the room.
- Given I enter an invalid or expired code, then I see an error.
- Given I am already a member, then duplicate membership is not created.

Tasks:
- Add `joinStudyRoom` action.
- Add unique constraint for user and room.
- Build `JoinRoomDialog`.
- Add tests for duplicate joins.

### Story GS-3: Group Focus Session

As a room member, I want to join a shared focus session so that we complete deep work together.

Acceptance criteria:
- Given a room owner starts a session, then active members see the session state.
- Given I complete the group session, then my individual completion is recorded.
- Given I leave early, then my completion is not counted.
- Given I complete, then XP is awarded once.

Tasks:
- Add `study_room_sessions` and `study_room_session_participants` tables.
- Use Supabase Realtime for room session state.
- Build `GroupFocusRoom`.
- Add completion action with XP idempotency.

### Story GS-4: Group Quest Progress

As a room member, I want shared weekly goals so that the group has a reason to return.

Acceptance criteria:
- Given a room has a weekly focus goal, then member completions contribute to progress.
- Given the group reaches the goal, then members who contributed receive a group quest reward.
- Given a user did not contribute, then they do not receive reward XP.

Tasks:
- Add `study_room_quests` table.
- Add weekly reset logic.
- Build `GroupQuestProgress`.
- Add reward action with contribution checks.

## Data Model Draft

```sql
study_rooms(id, owner_id, title, goal, visibility, invite_code_hash, archived_at, created_at, updated_at)
study_room_members(id, room_id, user_id, role, joined_at, left_at)
study_room_sessions(id, room_id, owner_id, started_at, ended_at, duration_minutes, status)
study_room_session_participants(id, room_session_id, user_id, joined_at, completed_at, xp_awarded)
study_room_quests(id, room_id, week_start_date, target_focus_minutes, completed_at, reward_xp)
```

## Safety and Moderation Notes

- Start with private invite-only rooms.
- No public chat in MVP.
- Add report/block only when public discovery or messaging exists.
- Avoid global leaderboards until anti-cheat and moderation are ready.

## Quick Dev File Checklist

- `app/(app)/groups/page.tsx`
- `app/(app)/groups/[roomId]/page.tsx`
- `features/groups/actions.ts`
- `features/groups/queries.ts`
- `features/groups/realtime.ts`
- `features/groups/types.ts`
- `components/groups/StudyRoomForm.tsx`
- `components/groups/RoomInvitePanel.tsx`
- `components/groups/GroupFocusRoom.tsx`
- `components/groups/GroupQuestProgress.tsx`
- `supabase/migrations/00027_group_study.sql`

## Test Plan

- Invite code join works and rejects invalid codes.
- Duplicate membership is blocked.
- Group session completion awards XP once per participant.
- Room owner permissions are enforced.
- Private room data is not visible to non-members.

