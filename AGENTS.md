# AGENTS.md

This file is the Codex working contract for **FocusForge**.

Codex must treat `CLAUDE.md` as the canonical project specification and `TASKS.md` as the canonical task execution plan.

## First Instructions

Before doing any implementation, read these files in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `TASKS.md`

Then start at the first unfinished task in `TASKS.md` and execute tasks sequentially until every task is complete.

The first unfinished task is the first task section whose checkbox is still `- [ ]`.

## Autonomous Execution Contract

Work continuously from the first unfinished task in `TASKS.md` until all tasks are complete.

A completed task is not a stopping point. After validating, marking the checkbox, committing, and pushing one task, immediately find the next unfinished task and continue.

Do not ask whether to continue. Do not wait for confirmation between tasks. Do not provide a final summary until every task in `TASKS.md` is complete.

Only stop for one of these reasons:

1. All tasks in `TASKS.md` are complete.
2. A real external blocker requires user action, such as missing credentials, broken remote Git configuration, unavailable database, unavailable dependency, or an unclear destructive choice.
3. The tool, session, context window, or API limit forces you to stop.

If forced to stop, clearly report:

- the current task number
- what was completed
- what remains
- what validation passed or failed
- the exact next command or action needed to resume

On the next run, resume from the first unfinished task. Never restart from Task 1 and never redo completed tasks.

## Task Workflow

For each task in `TASKS.md`:

1. Read the full task description and validation checklist.
2. Inspect the existing code before editing.
3. Implement only what the current task requires.
4. Keep backend, frontend, and documentation consistent with `CLAUDE.md`.
5. Run the strongest relevant validation available.
6. Fix validation failures before committing.
7. Mark the task checkbox from `- [ ]` to `- [x]`.
8. Review `git diff` and `git status`.
9. Commit with a clear message like `task N: short description`.
10. Push to GitHub.
11. Immediately continue to the next unfinished task.

Do not skip tasks. Do not jump ahead. Do not add features outside the scope in `CLAUDE.md`.

## Validation Rules

Use the strongest validation available in the current project state.

Backend examples:

```bash
cd backend
mvn test
mvn spring-boot:run
```

Frontend examples:

```bash
cd frontend/focusforge-frontend
npm install
npm run build
npm run lint
npm run dev
```

If a command does not exist yet, either add it when appropriate or document what was validated instead.

Never mark a task complete if validation is still failing.

## Git Rules

After every completed task, run the equivalent of:

```bash
git status
git diff
git add .
git commit -m "task N: short description"
git push
```

If `git push` fails because the remote or credentials are not configured, stop and report the exact blocker. Do not pretend the task was fully pushed.

## Existing User Work

The repository may contain uncommitted work from the user or another agent.

Before editing, check `git status`.

Never revert unrelated changes unless the user explicitly asks. If existing changes are related to the current task, work with them carefully instead of discarding them.

## Project Rules

Follow all project rules in `CLAUDE.md`, including:

- tech stack
- scope and non-scope features
- backend package structure
- frontend folder structure
- required design patterns
- mini-MVP rule
- UI/UX quality expectations
- validation expectations

`CLAUDE.md` and `TASKS.md` are the source of truth. This file exists to make Codex follow them continuously and resume correctly after interruptions.

