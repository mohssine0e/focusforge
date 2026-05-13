# CLAUDE.md

You are Claude Code working on **FocusForge**, a full-stack software engineering project. You may be using Claude Code through a Qwen Coder compatible API, but your behavior must follow this file and `TASKS.md` exactly.

## First Instructions

Before doing any implementation, read:

- `CLAUDE.md`
- `TASKS.md`

Then start at the first unfinished task in `TASKS.md` and continue sequentially. Do not jump ahead, do not invent extra features, and do not stop after a partial implementation if the next required validation is still missing.

## Project Vision

FocusForge is a mono-user productivity and project management platform for engineering students and developers.

It is **not** a simple todo app and **not** a small CRUD demo. It should feel like a focused productivity ecosystem inspired by Notion, Trello, Jira, Linear, and ClickUp, but intentionally scoped for one user.

FocusForge helps the user answer:

> Where am I in my projects, studies, deadlines, and focus work?

The final project must be presentable for a Genie Logiciel course and strong enough for a portfolio.

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

Do **not** build these features for now:

- AI assistant
- Collaboration
- Mentions
- Comments
- Multi-user accounts
- Real-time WebSocket
- GitHub integration
- Google Calendar integration
- Slack/Discord integration
- Both Calendar and Gantt
- Heatmaps
- Burnout detection
- Streaks

## Tech Stack

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven
- Lombok only if it helps and is used consistently

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- Zustand or Context API
- Recharts

Database:

- PostgreSQL

## Required Design Patterns

The project must visibly implement and document these patterns:

- **Builder**: project creation and/or report/dashboard DTO creation
- **Factory**: task creation by task type
- **Facade**: `ProjectManagementFacade` coordinating workspace, project, task, dependency, notification, focus, and analytics operations where useful
- **Observer**: notifications and audit/activity events when tasks change
- **Strategy**: task sorting, prioritization, and next-task recommendation
- **Command**: focus session actions and task action history where useful
- **Decorator**: computed task display metadata such as overdue labels, priority labels, and dependency warnings
- **State**: valid task status transitions

Do not add patterns as fake empty classes. Each pattern must have a real use in the project and must be visible in the UI, API behavior, or documentation.

## Architecture Rules

Backend package structure should stay modular:

```txt
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
```

Frontend structure should stay modular:

```txt
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

Keep controllers thin. Put business logic in services, facades, state classes, strategies, factories, commands, decorators, or observers as appropriate.

## Development Workflow

Work task by task from `TASKS.md`.

After **each finished task**, you must:

1. Validate that the task is really complete.
2. Run backend checks if backend code changed.
3. Run frontend checks if frontend code changed.
4. Make sure the app still starts or that the changed part can be manually verified.
5. Mark the task as complete in `TASKS.md` by changing that task's checkbox from `- [ ]` to `- [x]`.
6. Review `git diff` and `git status`.
7. Commit changes with a clear message.
8. Push to GitHub.
9. Only then move to the next task.

Never skip validation. Never push broken work. If validation fails, fix the problem before committing. If a task is too large, split the implementation internally, but the public task is only complete after the validation passes.

## Git Rule

After every completed task, run the equivalent of:

```bash
git status
git diff
git add .
git commit -m "task N: short description"
git push
```

If `git push` fails because the remote is not configured, document the issue clearly and continue only after the repository situation is fixed by the user.

## Mini-MVP Rule

Each phase in `TASKS.md` must leave the app as a working mini-MVP.

Do not spend many tasks only on backend or only on frontend. The project must grow vertically:

1. Backend API
2. Frontend screen
3. Connection between them
4. Validation
5. Commit and push

Every phase should make the application more usable.

## UI Rules

The UI should look modern, serious, and usable for a student/developer productivity platform. see (exemple_design.png and exemple_design2.png) for a rough example of the style and components to aim for.

Use:

- App shell with sidebar and topbar
- Dashboard cards
- Clean forms
- Tables or structured lists
- Kanban columns
- Calendar view
- Status badges
- Priority colors
- Recharts charts
- Loading states
- Error states
- Empty states
- Delete confirmations

Avoid:

- Default ugly HTML
- Decorative landing pages
- Huge marketing hero sections
- Too many views
- Features outside the agreed scope

UI/UX quality is extremely important.

The application must look like a premium modern SaaS product.

Design inspiration:
- Linear
- Notion
- Raycast
- Vercel
- modern productivity tools

Frontend must prioritize:
- spacing
- typography
- visual hierarchy
- polished components
- responsive design
- modern dashboards
- elegant dark mode
- clean interactions

Avoid:
- generic admin template look
- bootstrap-style UI
- cluttered pages
- too many colors
- poor spacing

Use:
- TailwindCSS
- shadcn/ui
- smooth transitions
- subtle hover effects
- modern cards
- beautiful charts
- premium sidebar layout

The UI should feel intelligent, calm, and productivity-focused.

## Validation Expectations

Use the strongest validation available in the current project state.

Backend validation examples:

```bash
cd backend
mvn test
mvn spring-boot:run
```

Frontend validation examples:

```bash
cd frontend
npm install
npm run build
npm run lint
npm run dev
```

If a command does not exist yet, either add it when appropriate or explain in the commit/task notes what was validated instead.

UI/UX quality is extremely important.

The application must look like a premium modern SaaS product.

Design inspiration:
- Linear
- Notion
- Raycast
- Vercel
- modern productivity tools

Frontend must prioritize:
- spacing
- typography
- visual hierarchy
- polished components
- responsive design
- modern dashboards
- elegant dark mode
- clean interactions

Avoid:
- generic admin template look
- bootstrap-style UI
- cluttered pages
- too many colors
- poor spacing

Use:
- TailwindCSS
- shadcn/ui
- smooth transitions
- subtle hover effects
- modern cards
- beautiful charts
- premium sidebar layout

The UI should feel intelligent, calm, and productivity-focused.

## Final Result

By the end of `TASKS.md`, FocusForge must include:

- Spring Boot backend
- React frontend
- PostgreSQL persistence
- Workspaces
- Projects
- Tasks
- Task dependencies
- Kanban board
- Calendar planning view
- Focus/Pomodoro tracker
- Analytics dashboard
- Design patterns implemented in real code
- Professional README
- Design pattern documentation
- Presentation plan
- GitHub history showing task-by-task progress
