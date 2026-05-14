# AGENTS.md

You are OpenAI Codex CLI working on **FocusForge**, a full-stack software engineering project.

Before doing anything else, read:

- `AGENTS.md` (this file)
- `TASKS.md`

Then start at the first unfinished task in `TASKS.md` (first checkbox that is still `- [ ]`) and work sequentially until all tasks are complete.

---

## Autonomous Execution Contract

Work continuously from the first unfinished task until all tasks are done.

Do not stop between tasks. Do not ask whether to continue. Do not wait for confirmation. Do not summarize until everything is complete.

Only stop if:

1. All tasks in `TASKS.md` are complete.
2. A real external blocker needs user action: missing credentials, broken git remote, database unreachable, or a destructive action that is unclear.
3. The session, context window, or API limit forces a stop.

If forced to stop, report:

- current task number
- what is done
- what remains
- exact command to resume

If context is lost or session restarts, re-read `AGENTS.md` and `TASKS.md` fully before resuming. Never redo completed tasks. Never restart from Task 1.

### Speed Rule

One file per operation. Do not modify multiple files in a single step. Write one file, verify it, move to the next. This prevents context overflow and session crashes.

---

## Project

FocusForge is a mono-user productivity and project management platform for engineering students and developers. It is not a todo app. It is not a CRUD demo. It is a real usable product inspired by Notion, Linear, Jira, and ClickUp, scoped intentionally for one user.

The user's question the app answers:

> Where am I in my projects, studies, deadlines, and focus work?

---

## Stack

Backend:
- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven
- Lombok (used everywhere consistently)

Frontend:
- React with TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router v6
- Axios
- Zustand or Context API
- Recharts

---

## Architecture

Backend packages:

```
controller/
service/
repository/
entity/
dto/
mapper/
facade/
factory/
builder/
strategy/
observer/
command/
decorator/
state/
exception/
config/
security/
```

Frontend structure:

```
src/
  api/
  components/
  pages/
  layouts/
  hooks/
  store/
  types/
  utils/
```

Controllers stay thin. Business logic goes in services, facades, factories, strategies, commands, decorators, observers, or state classes.

No `System.out.println`. Use `@Slf4j` everywhere.
Constructor injection only. No `@Autowired` on fields.
All API responses use envelope: `{ success, data, message, timestamp }`.
Global exception handler via `@RestControllerAdvice`.

---

## Design Patterns Required

Each pattern must be used in real production code, not as an empty class.

| Pattern | Where |
|---|---|
| Builder | Project creation via `ProjectBuilder` |
| Factory | Task creation by type via `TaskFactory` |
| Facade | `ProjectManagementFacade` coordinating services |
| Observer | Task status change triggers notifications |
| Strategy | Task sorting and next-task recommendation |
| Command | Focus session actions with history |
| Decorator | Computed task metadata (overdue, priority label, dependency warning) |
| State | Valid task status transitions enforced |

---

## UI Design System

The UI must look like a premium dark-mode productivity SaaS. Study `exemple_design.png` and `exemple_design2.png` in the repo root before writing any frontend code.

### Colors

```
Background:        #0f0f13
Surface (cards):   #1a1a24
Surface elevated:  #22223a
Border:            #2e2e45
Primary:           #7c6ef7
Primary hover:     #6c5ee0
Text primary:      #f0f0f5
Text secondary:    #8b8ba0
Text muted:        #55556a

Status:
  TODO:        #55556a
  IN_PROGRESS: #7c6ef7
  REVIEW:      #f0a500
  BLOCKED:     #e05555
  DONE:        #22c55e

Priority:
  LOW:      #55556a
  MEDIUM:   #f0a500
  HIGH:     #e07855
  CRITICAL: #e05555
```

### Layout

- Sidebar: fixed 240px, `bg-[#1a1a24]`, logo top, user info bottom
- Topbar: fixed 56px height, search + notification bell
- Main: scrollable, `p-6`
- Cards: `bg-[#1a1a24] border border-[#2e2e45] rounded-xl p-5`

### Sidebar Navigation Order

1. Dashboard
2. Workspaces
3. Projects
4. Kanban Board
5. Calendar
6. Focus Mode
7. Analytics
8. Notifications

Active item style: `bg-[#7c6ef7]/20 border-l-2 border-[#7c6ef7] text-[#7c6ef7]`

### Typography

- Font: Inter (Google Fonts)
- Page title: `text-xl font-semibold text-white`
- Section header: `text-sm font-medium text-gray-400 uppercase tracking-wider`
- Body: `text-sm text-gray-300`
- Muted: `text-xs text-gray-500`

### Dashboard Layout

Top row — 5 stat cards: Total Projects, Total Tasks, Tasks Completed, Focus Time, Completion Rate.
Each card: icon + label + big number + trend indicator (↑ green / ↓ red vs last week).

Middle row:
- Tasks by Status: donut chart with Recharts
- Upcoming Deadlines: list with date + priority badge
- Recent Focus Sessions: list with duration

Bottom:
- Project Progress Overview: each project as a row with progress bar + status badge

### Components (shadcn/ui)

Use these components from shadcn/ui:
- `Button` — purple primary, ghost/outline secondary
- `Badge` — colored by status and priority palette
- `Card` — dashboard and project cards
- `Dialog` — all create/edit/delete modals
- `Input`, `Textarea`, `Select` — all forms
- `Separator` — visual dividers
- `Tooltip` — icon buttons
- `DropdownMenu` — edit/delete menus
- `Progress` — project completion bars

### Empty States

Every empty list must show:
- centered lucide-react icon
- "No X yet" title
- helpful subtitle
- CTA button

### Loading States

Use skeleton loaders for page content. Use small inline spinner only for button loading.

---

## Task Execution Workflow

For every task in `TASKS.md`:

1. Read the full task description before writing any code.
2. Implement it completely. No stubs. No TODOs. No mock data replacing real API calls.
3. Validate:
   - Backend changed: `mvn spring-boot:run` starts without errors.
   - Frontend changed: `npm run build` passes with zero TypeScript errors.
4. Mark done in `TASKS.md`: change `- [ ]` to `- [x]`.
5. Run:

```bash
git add .
git commit -m "task N: short description"
git push
```

6. Move immediately to the next unfinished task.

Never commit broken code. Never skip validation. If validation fails, fix it first.

If a task is blocked by something outside your control, mark it `- [!]` in `TASKS.md`, write a one-line comment explaining the blocker, push, and move to the next task.

---

## What Not To Build

Do not build any of these even if they seem related:

- AI assistant or AI suggestions
- Multi-user collaboration
- Real-time WebSocket updates
- GitHub integration
- Google Calendar sync
- Slack or Discord notifications
- Gantt view
- Burnout detection
- Streaks or gamification

---

## Running The Project

```bash
# Database
docker-compose up -d

# Backend
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

Backend runs at `http://localhost:8080`.
Frontend runs at `http://localhost:5173`.
Vite proxies `/api` to the backend.

---

## Resume Prompt

If this session ends before all tasks are complete, start the next session with:

```
Read AGENTS.md and TASKS.md fully.
Find the first task where the checkbox is still - [ ] or - [!].
Resume from that task.
Do not redo any task marked - [x].
Continue autonomously until all tasks are complete.
```

## Git Authentication

The repository uses SSH for git operations. The SSH key is already configured.
The remote origin is: git@github.com:mohssine0e/focusforge.git

If git push fails with HTTPS credentials error, run:
```bash
git remote set-url origin git@github.com:mohssine0e/focusforge.git
git push
```

Never use HTTPS for git operations. Always use the SSH remote above.