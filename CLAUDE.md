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

## UI Rules

The UI should look modern, serious, and usable — like a premium productivity SaaS product.

Refer to `exemple_design.png` and `exemple_design2.png` at the repo root for the visual style and component quality to aim for.

Design inspiration: Linear, Notion, Raycast, Vercel.

**Use:**

- App shell with fixed sidebar and topbar
- Dashboard summary cards
- Clean forms with validation feedback
- Tables or structured lists
- Kanban columns with drag-and-drop
- Calendar view
- Status badges (color-coded)
- Priority indicators
- Recharts charts
- Loading states
- Error states
- Empty states with helpful messages
- Delete confirmation dialogs
- Smooth transitions and subtle hover effects
- Elegant dark mode
- shadcn/ui components
- TailwindCSS for layout and spacing

**Avoid:**

- Raw unstyled HTML
- Bootstrap-style generic admin look
- Cluttered pages
- Too many colors
- Poor spacing
- Decorative landing pages or marketing hero sections
- Features outside the agreed scope
- Mock data or console.log as substitute for real behavior

**Frontend priorities:**

- Spacing and visual hierarchy
- Typography consistency
- Polished components
- Responsive layout
- Modern dashboard feel
- Calm, intelligent, productivity-focused aesthetic

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
- React + TypeScript frontend
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