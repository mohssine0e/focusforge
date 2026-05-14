# CLAUDE.md

You are Claude Code working on **FocusForge**, a full-stack software engineering project. You may be using Claude Code through a Qwen Coder compatible API, but your behavior must follow this file and `TASKS.md` exactly.

## First Instructions

Before doing any implementation, read:

- `CLAUDE.md`
- `TASKS.md`

Then start at the first unfinished task in `TASKS.md` and continue sequentially until every task is complete. Do not jump ahead, do not invent extra features, do not stop after one task, and do not stop after a partial implementation if the next required validation is still missing.

---

## Autonomous Execution Contract

You must work continuously from the first unfinished task in `TASKS.md` until every task is complete.

A completed task is not a stopping point. After validating, marking the checkbox, committing, and pushing one task, immediately find the next unfinished task and continue.

Do not ask whether to continue. Do not wait for confirmation between tasks. Do not provide a final summary until all tasks in `TASKS.md` are complete.

Only stop for one of these reasons:

1. All tasks in `TASKS.md` are complete.
2. A real external blocker requires user action, such as missing credentials, broken remote Git configuration, unavailable database, or an unclear destructive choice.
3. The tool, session, context window, or API limit forces you to stop.

If forced to stop, clearly report:

- the current task number
- what was completed
- what remains
- the exact next command or action needed to resume

If the session is interrupted or context is lost for any reason, re-read `CLAUDE.md` and `TASKS.md` completely before resuming. Never assume previous context is still available.

On the next run, resume from the first unfinished task. Never restart from Task 1 and never redo completed tasks.

### Speed Rule

Work in the smallest possible steps. Do not try to implement many files in one tool call. One file at a time, validate, move on. This reduces session crashes and makes progress visible.

---

## Project Vision

FocusForge is a mono-user productivity and project management platform for engineering students and developers.

It is **not** a simple todo app and **not** a small CRUD demo. It should feel like a focused productivity ecosystem inspired by Notion, Trello, Jira, Linear, and ClickUp, but intentionally scoped for one user.

FocusForge helps the user answer:

> Where am I in my projects, studies, deadlines, and focus work?

The final project must be presentable for a Genie Logiciel course and strong enough for a portfolio.

---

## Scope To Build

Build these features:

- Mono-user workspaces
- Projects inside workspaces
- Tasks inside projects
- Task priorities
- Task statuses
- Task dependencies
- Kanban view
- One second planning view: **Calendar** only
- Focus/Pomodoro session tracker
- Analytics dashboard
- Clean backend architecture
- Clean frontend architecture
- Documentation for design patterns and demo presentation

Do **not** build these features:

- AI assistant
- Collaboration
- Mentions
- Comments
- Multi-user accounts
- Real-time WebSocket
- GitHub integration
- Google Calendar integration
- Slack/Discord integration
- Gantt view
- Heatmaps
- Burnout detection
- Streaks

---

## Tech Stack

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven
- Lombok (used consistently everywhere — see Lombok rule below)

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- Axios
- Zustand or Context API
- Recharts

Database:

- PostgreSQL

---

## Required Design Patterns

The project must visibly implement and document these patterns:

- **Builder**: project creation and/or report/dashboard DTO creation
- **Factory**: task creation by task type
- **Facade**: `ProjectManagementFacade` coordinating workspace, project, task, dependency, notification, focus, and analytics operations
- **Observer**: notifications and audit/activity events when tasks change
- **Strategy**: task sorting, prioritization, and next-task recommendation
- **Command**: focus session actions and task action history
- **Decorator**: computed task display metadata such as overdue labels, priority labels, and dependency warnings
- **State**: valid task status transitions

Do not add patterns as fake empty classes. Each pattern must have a real use in the project and must be visible in the UI, API behavior, or documentation.

---

## Architecture Rules

### General

- Keep controllers thin. Put business logic in services, facades, state classes, strategies, factories, commands, decorators, or observers as appropriate.
- No `System.out.println` — use `@Slf4j` logger everywhere.
- Constructor injection only — no `@Autowired` on fields.
- All responses wrapped in a standard envelope: `{ success, data, message, timestamp }`.
- Global exception handler via `@RestControllerAdvice`.

### Lombok Rule

Use Lombok consistently across the entire backend. If Lombok is used anywhere, it must be used everywhere. Standard annotations to apply:

- `@Data` or `@Getter`/`@Setter` on entities and DTOs
- `@Builder` on builders and complex DTOs
- `@NoArgsConstructor` / `@AllArgsConstructor` / `@RequiredArgsConstructor` as needed
- `@Slf4j` on every class that needs logging

Never mix Lombok and manual boilerplate in the same codebase.

### File Editing Rule

Before editing any existing file, always read its full current content first.
If a file does not exist yet, create it — never attempt to edit a non-existent file.
If an edit fails with a conflict or mismatch error, re-read the file and retry with the exact current content.

### Backend Package Structure

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

### Frontend Structure

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

---

## UI Design System — Non-Negotiable

The UI must match the visual quality of `exemple_design.png` and `exemple_design2.png` at the repo root. Study these images before writing any frontend code. The app must look like a premium dark-mode productivity SaaS — similar to Linear, Notion, or Raycast.

### Color Palette

```
Background:       #0f0f13  (main bg)
Surface:          #1a1a24  (cards, sidebar)
Surface elevated: #22223a  (modals, dropdowns)
Border:           #2e2e45
Primary:          #7c6ef7  (purple — buttons, links, active states)
Primary hover:    #6c5ee0
Text primary:     #f0f0f5
Text secondary:   #8b8ba0
Text muted:       #55556a

Status colors:
  TODO:        #55556a  (muted)
  IN_PROGRESS: #7c6ef7  (purple)
  REVIEW:      #f0a500  (amber)
  BLOCKED:     #e05555  (red)
  DONE:        #22c55e  (green)

Priority colors:
  LOW:      #55556a
  MEDIUM:   #f0a500
  HIGH:     #e07855
  CRITICAL: #e05555
```

### Typography

- Font: `Inter` (import from Google Fonts)
- Page titles: `text-xl font-semibold text-white`
- Section headers: `text-sm font-medium text-gray-400 uppercase tracking-wider`
- Body: `text-sm text-gray-300`
- Muted: `text-xs text-gray-500`

### Layout

- Sidebar: fixed, 240px wide, dark background `#1a1a24`, with logo at top and user info at bottom
- Topbar: fixed, full width minus sidebar, height 56px, with search and notification bell
- Main content: scrollable, padded `p-6`, max-width centered on wide screens
- Cards: `bg-[#1a1a24] border border-[#2e2e45] rounded-xl p-5`

### Components (use shadcn/ui)

Install and use these shadcn/ui components:
- `Button` — primary uses purple bg, ghost/outline variants for secondary actions
- `Badge` — for status and priority labels, colored by the palette above
- `Card` — for dashboard stat cards and project cards
- `Dialog` — for create/edit/delete modals
- `Input`, `Textarea`, `Select` — for all forms
- `Separator` — for visual dividers
- `Tooltip` — for icon buttons
- `DropdownMenu` — for action menus (edit, delete, etc.)
- `Progress` — for project completion bars

### Dashboard (matches exemple_design.png)

The dashboard must have:
- Top stat cards row: Total Projects, Total Tasks, Tasks Completed, Focus Time, Completion Rate
- Each card shows: icon, label, big number, trend vs last week (↑ green or ↓ red)
- Middle row: Tasks by Status donut chart (Recharts) | Upcoming Deadlines list | Recent Focus Sessions list
- Bottom: Project Progress Overview — each project as a row with progress bar and status badge

### Sidebar Navigation

Items in order:
1. Dashboard
2. Workspaces
3. Projects
4. Kanban Board
5. Calendar
6. Focus Mode
7. Analytics
8. Notifications

Active item: purple background `bg-[#7c6ef7]/20` with purple text and left border `border-l-2 border-[#7c6ef7]`

### Kanban Board

- Dark columns with header showing status name and task count badge
- Task cards: `bg-[#22223a] rounded-lg p-3 mb-2`
- Cards show: title, priority badge (colored dot + label), type badge, due date, action buttons
- Column headers colored by status

### Forms and Modals

- All forms inside `Dialog` (shadcn/ui modal)
- Dark modal background `bg-[#1a1a24]`
- Input fields: `bg-[#0f0f13] border-[#2e2e45]` with white text
- Submit button: purple primary
- Cancel button: ghost

### Empty States

Every list or page with no data must show:
- Centered icon (use lucide-react)
- Title: "No X yet"
- Subtitle: helpful hint
- CTA button to create

### Loading States

Use skeleton loaders (gray pulsing blocks) not spinners for page content.
Use small spinner only for button loading states.

---

## Development Workflow

Work task by task from `TASKS.md`.

After **each finished task**, follow this exact sequence:

1. Validate that the task is really complete — no stubs, no TODOs, no mock data substituting real behavior.
2. Run backend checks if backend code changed: `mvn spring-boot:run` must start without errors.
3. Run frontend checks if frontend code changed: `npm run build` must complete without errors, no TypeScript errors.
4. Mark the task complete in `TASKS.md`: change `- [ ]` to `- [x]`.
5. Review `git diff` and `git status`.
6. Commit and push:

```bash
git add .
git commit -m "task N: short description"
git push
```

Never skip validation. Never push broken work. If validation fails, fix the problem before committing.

---

## Mini-MVP Rule

Each phase in `TASKS.md` must leave the app as a working mini-MVP.

Do not spend many tasks only on backend or only on frontend. The project must grow vertically:

1. Backend API
2. Frontend screen
3. Connection between them
4. Validation
5. Commit and push

Every phase should make the application more usable than before.

---

## Validation Expectations

Backend:

```bash
cd backend
mvn spring-boot:run
mvn test
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm run lint
npm run dev
```

---

## Final Result

By the end of `TASKS.md`, FocusForge must include:

- Spring Boot backend with all 8 patterns implemented in real code
- React + TypeScript frontend matching the design system above
- PostgreSQL persistence
- Workspaces, Projects, Tasks, Task dependencies
- Kanban board
- Calendar planning view
- Focus/Pomodoro tracker
- Analytics dashboard
- Professional README
- Design pattern documentation file
- Presentation plan
- Clean GitHub history showing task-by-task progress