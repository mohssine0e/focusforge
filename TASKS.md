# TASKS.md

# FocusForge Development Plan

Build FocusForge progressively. Every phase must end with a working mini-MVP where the backend and frontend are connected.

Follow `CLAUDE.md` strictly:

- Complete tasks sequentially.
- Validate after each task.
- Mark the completed task checkbox from `- [ ]` to `- [x]`.
- Commit after each task.(if no remote branch, create one with `git checkout -b main` first)
- Push to GitHub after each task.
- Do not continue to the next task until the current task is validated and pushed.

The first unfinished task is the first task section whose checkbox is still `- [ ]`.

## Phase 1 - Full-Stack Foundation MVP

Goal: create a runnable backend, runnable frontend, and first real API connection.

### Task 1 - Initialize repository structure

- [x] **Task 1 complete**

Create or normalize the root structure:

```txt
focusforge/
  backend/
  frontend/
  docs/
  README.md
  CLAUDE.md
  TASKS.md
```

Add a root `.gitignore` for Java, Node, IDE files, environment files, and build outputs.

Validate:

- The folders exist.
- `git status` shows only intended files.
- First commit is created and pushed.

### Task 2 - Create Spring Boot backend skeleton

- [x] **Task 2 complete**

Create the backend with:

- Java 21
- Maven
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL driver

Add:

- `GET /api/health`
- base package structure from `CLAUDE.md`
- development config for PostgreSQL
- clear application name: `focusforge`

Validate:

- `mvn test` passes.
- Backend starts successfully.
- `GET /api/health` returns a simple OK response.
- Commit and push.

### Task 3 - Create React frontend skeleton

- [x] **Task 3 complete**

Create the frontend with:

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

Add:

- basic app shell
- homepage/dashboard route
- visible `FocusForge` title
- clean starter styling, not default HTML

Validate:

- `npm install` succeeds.
- `npm run build` passes.
- Frontend starts with `npm run dev`.
- Commit and push.

### Task 4 - Connect frontend health check to backend

- [x] **Task 4 complete**

Create:

- `src/api/httpClient.ts`
- `src/api/healthApi.ts`
- frontend health status component

The frontend must call `GET /api/health` and display backend connection state.

Mini-MVP:

- Backend runs.
- Frontend runs.
- Frontend confirms backend connection.

Validate:

- Backend build passes.
- Frontend build passes.
- Manual browser check shows backend status.
- Commit and push.

## Phase 2 - Workspace MVP

Goal: user can create, view, update, and delete workspaces from the UI.

### Task 5 - Add shared backend foundation

- [x] **Task 5 complete**

Add backend foundation needed by entities:

- `BaseEntity` or common timestamp fields
- global exception handler
- not-found exception
- validation error responses
- DTO mapping style decision

Validate:

- `mvn test` passes.
- Health endpoint still works.
- Commit and push.

### Task 6 - Create Workspace backend model and CRUD

- [x] **Task 6 complete**

Create:

- `Workspace` entity with `id`, `name`, `description`, `createdAt`, `updatedAt`
- `WorkspaceRepository`
- `WorkspaceService`
- request/response DTOs
- validation rules

Implement service methods:

- create workspace
- list workspaces
- get workspace by id
- update workspace
- delete workspace

Validate:

- `mvn test` passes.
- Database table can be created by JPA.
- Commit and push.

### Task 7 - Create Workspace REST controller

- [x] **Task 7 complete**

Add endpoints:

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/{id}`
- `PUT /api/workspaces/{id}`
- `DELETE /api/workspaces/{id}`

Validate:

- Test manually with curl or an HTTP client.
- Invalid input returns useful validation errors.
- Missing workspace returns 404.
- Commit and push.

### Task 8 - Build Workspace frontend API and page

- [x] **Task 8 complete**

Create:

- `workspaceApi.ts`
- workspace TypeScript types
- workspace list page
- create workspace form
- edit workspace form or inline edit
- delete action with confirmation
- loading, empty, and error states

Mini-MVP:

- User can manage workspaces fully from the UI.

Validate:

- Frontend build passes.
- Backend build passes if touched.
- Manual UI test confirms CRUD.
- Commit and push.

## Phase 3 - Project MVP With Builder Pattern

Goal: user can manage projects inside a workspace, and Builder pattern is used in real backend code.

### Task 9 - Create Project backend model

- [x] **Task 9 complete**

Create:

- `Project` entity
- `ProjectStatus` enum
- `Priority` enum if not already created
- relationship: many projects belong to one workspace

Project fields:

- `id`
- `name`
- `description`
- `status`
- `priority`
- `startDate`
- `dueDate`
- `workspace`
- `createdAt`
- `updatedAt`

Validate:

- `mvn test` passes.
- JPA relationship is correct.
- Commit and push.

### Task 10 - Implement Project Builder pattern

- [x] **Task 10 complete**

Create a real Builder implementation for project creation.

Use it in the project service when creating projects:

```java
Project project = ProjectBuilder.builder()
    .name(request.name())
    .description(request.description())
    .priority(request.priority())
    .workspace(workspace)
    .build();
```

Validate:

- Builder is used in production code.
- Project creation still works.
- Commit and push.

### Task 11 - Add Project backend CRUD endpoints

- [x] **Task 11 complete**

Create:

- `ProjectRepository`
- `ProjectService`
- `ProjectController`
- project DTOs

Endpoints:

- `GET /api/workspaces/{workspaceId}/projects`
- `POST /api/workspaces/{workspaceId}/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

Validate:

- Manual API tests pass.
- Project cannot be created for missing workspace.
- Commit and push.

### Task 12 - Build Project frontend inside Workspace detail

- [x] **Task 12 complete**

Create:

- workspace detail route
- project API client
- project list/cards
- create project form
- edit/delete project actions
- project priority and status badges

Mini-MVP:

- User can open a workspace and manage projects inside it.

Validate:

- Frontend build passes.
- Manual UI test confirms workspace -> projects flow.
- Commit and push.

## Phase 4 - Task MVP With Factory Pattern

Goal: user can manage tasks inside a project, and Factory pattern creates task types.

### Task 13 - Create Task backend model

- [x] **Task 13 complete**

Create:

- `Task` entity
- `TaskStatus` enum: `TODO`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`
- `TaskType` enum: `STUDY`, `CODING`, `RESEARCH`, `ADMIN`
- relationship: many tasks belong to one project

Task fields:

- `id`
- `title`
- `description`
- `status`
- `priority`
- `type`
- `dueDate`
- `estimatedMinutes`
- `project`
- `createdAt`
- `updatedAt`

Validate:

- `mvn test` passes.
- JPA mapping works.
- Commit and push.

### Task 14 - Implement Task Factory pattern

- [x] **Task 14 complete**

Create `TaskFactory`.

It must create tasks by `TaskType` with sensible defaults, for example:

- `STUDY`: default estimate 60 minutes
- `CODING`: default estimate 90 minutes
- `RESEARCH`: default estimate 45 minutes
- `ADMIN`: default estimate 30 minutes

Use the factory in task creation service logic.

Validate:

- Factory is used in production code.
- Defaults are applied when estimate is missing.
- Commit and push.

### Task 15 - Add Task backend CRUD endpoints

- [x] **Task 15 complete**

Create:

- `TaskRepository`
- `TaskService`
- `TaskController`
- task DTOs

Endpoints:

- `GET /api/projects/{projectId}/tasks`
- `POST /api/projects/{projectId}/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

Validate:

- Manual API tests pass.
- Task cannot be created for missing project.
- Commit and push.

### Task 16 - Build Task frontend inside Project detail

- [x] **Task 16 complete**

Create:

- project detail route
- task API client
- task list
- create task form
- edit/delete task actions
- priority, status, and type badges

Mini-MVP:

- User can create workspace -> project -> tasks from the UI.

Validate:

- Frontend build passes.
- Manual UI test confirms full hierarchy.
- Commit and push.

## Phase 5 - Kanban MVP With State Pattern

Goal: user can move tasks through a controlled workflow visually.

### Task 17 - Add task status update endpoint

- [x] **Task 17 complete**

Create endpoint:

- `PATCH /api/tasks/{id}/status`

It must update only the task status and return the updated task.

Mini-MVP:

- User can manage task workflow visually from Kanban.

Validate:

- Manual API test passes.
- Invalid task id returns 404.
- Commit and push.

### Task 18 - Implement State pattern for task transitions

- [x] **Task 18 complete**

Implement State pattern for valid task status transitions.

Allowed transitions:

- `TODO -> IN_PROGRESS`
- `IN_PROGRESS -> REVIEW`
- `REVIEW -> DONE`
- `IN_PROGRESS -> BLOCKED`
- `BLOCKED -> IN_PROGRESS`
- `TODO -> BLOCKED`

Invalid transitions must be rejected with a clear error.

Mini-MVP:

- Valid transitions work.
- Invalid transitions fail.
- State pattern classes are used by service code.

Validate:

- Valid transitions work.
- Invalid transitions fail.
- State pattern classes are used by service code.
- Commit and push.

### Task 19 - Build Kanban board frontend

- [x] **Task 19 complete**

Create Kanban view with columns:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `REVIEW`
- `DONE`

Show tasks as cards with:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `REVIEW`
- `DONE`

Show tasks as cards with:

- title
- priority
- type
- due date
- status actions

Validate:

- Frontend build passes.
- Board renders real project tasks.
- Commit and push.

### Task 20 - Connect Kanban status actions

- [x] **Task 20 complete**

Add status movement actions:

- start
- block
- resume
- review
- done

Use the backend status endpoint. Disable or hide invalid actions where possible.

Mini-MVP:

- User can manage task workflow visually from Kanban.

Validate:

- Manual UI test confirms allowed transitions.
- Invalid transitions do not break the UI.
- Commit and push.

## Phase 6 - Facade And Clean API Layer MVP

Goal: make the architecture look professional and keep controllers thin.

### Task 21 - Add ProjectManagementFacade

- [x] **Task 21 complete**

Create `ProjectManagementFacade`.

It should coordinate useful operations across:

- workspace service
- project service
- task service
- status transition logic

Use it where controller operations require orchestration.

Validate:

- Facade is used by at least one controller.
- Existing API behavior still works.
- Commit and push.

### Task 22 - Refactor controllers and backend responses

- [x] **Task 22 complete**

Refactor controllers to stay thin.

Ensure:

- controllers handle HTTP concerns
- services/facade handle business logic
- response DTOs are consistent
- errors are consistent

Validate:

- Backend build passes.
- Previously built frontend flows still work.
- Commit and push.

### Task 23 - Organize frontend API and app state

- [x] **Task 23 complete**

Organize frontend code:

- `api/workspaceApi.ts`
- `api/projectApi.ts`
- `api/taskApi.ts`
- shared `httpClient.ts`
- shared types
- basic global state with Zustand or Context if useful

Mini-MVP:

- No behavior regression.
- Codebase is easier to extend.

Validate:

- Frontend build passes.
- Manual smoke test passes.
- Commit and push.

## Phase 7 - Task Dependencies MVP

Goal: tasks can depend on other tasks, with validation preventing impossible workflows.

### Task 24 - Add task dependency backend model

- [x] **Task 24 complete**

Implement dependencies using either:

- `TaskDependency` entity, or
- self many-to-many relation

Rules:

- A task can depend on multiple other tasks.
- A task cannot depend on itself.
- Dependency means the task should not start before required tasks are done.

Validate:

- JPA mapping works.
- `mvn test` passes.
- Commit and push.

### Task 25 - Add dependency backend endpoints

- [x] **Task 25 complete**

Create endpoints:

- `POST /api/tasks/{taskId}/dependencies/{dependsOnTaskId}`
- `DELETE /api/tasks/{taskId}/dependencies/{dependsOnTaskId}`
- `GET /api/tasks/{taskId}/dependencies`

Validate:

- Manual API tests pass.
- Missing task returns 404.
- Commit and push.

### Task 26 - Add dependency validation

- [x] **Task 26 complete**

Prevent:

- self-dependency
- duplicate dependency
- circular dependency
- moving to `IN_PROGRESS` when dependencies are not done

Validate:

- Manual API tests cover each validation rule.
- State transition logic respects dependencies.
- Commit and push.

### Task 27 - Build dependency UI

- [x] **Task 27 complete**

In task detail or task edit UI, show:

- current dependencies
- add dependency selector
- remove dependency action
- blocked-by-dependency warning

Mini-MVP:

- User can manage dependencies end-to-end.

Validate:

- Frontend build passes.
- Manual UI test confirms dependency behavior.
- Commit and push.

## Phase 8 - Observer Pattern And Notifications MVP

Goal: task changes generate visible notifications.

### Task 28 - Create notification backend model

- [x] **Task 28 complete**

Create:

- `Notification` entity
- `NotificationType` enum
- `NotificationRepository`
- `NotificationService`

Fields:

- `id`
- `message`
- `type`
- `read`
- `createdAt`

Types:

- `TASK_UPDATED`
- `TASK_BLOCKED`
- `TASK_COMPLETED`
- `DEADLINE_WARNING`

Validate:

- `mvn test` passes.
- Notification table can be created.
- Commit and push.

### Task 29 - Implement Observer pattern for task events

- [x] **Task 29 complete**

Create observer system with:

- task event object
- observer interface
- `NotificationObserver`
- optional `AuditLogObserver`

When task status changes, notify observers and create a notification.

Validate:

- Observer classes are used in production code.
- Status change creates notification.
- Commit and push.

### Task 30 - Add notification API endpoints

- [x] **Task 30 complete**

Create endpoints:

- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`
- `DELETE /api/notifications/{id}`

Validate:

- Manual API tests pass.
- Unread/read behavior works.
- Commit and push.

### Task 31 - Build notification panel frontend

- [x] **Task 31 complete**

Add notification UI:

- unread count in topbar/sidebar
- latest notifications panel
- mark as read action
- delete action

Mini-MVP:

- Task changes create visible notifications in the frontend.

Validate:

- Frontend build passes.
- Manual UI test confirms notification flow.
- Commit and push.

## Phase 9 - Strategy Pattern MVP

Goal: task sorting and next-task recommendation are powered by Strategy pattern.

### Task 32 - Implement task sorting strategies

- [x] **Task 32 complete**

Create strategies:

- `ByPriorityStrategy`
- `ByDeadlineStrategy`
- `ByStatusStrategy`

Support:

- `GET /api/projects/{projectId}/tasks?sort=priority`
- `GET /api/projects/{projectId}/tasks?sort=deadline`
- `GET /api/projects/{projectId}/tasks?sort=status`

Validate:

- Strategy classes are used by service code.
- Sorting works through API.
- Commit and push.

### Task 33 - Implement next-task recommendation strategy

- [ ] **Task 33 complete**

Create recommendation strategies:

- priority first
- deadline first
- shortest task first

Endpoint:

- `GET /api/projects/{projectId}/tasks/recommended?strategy=priority`

No AI. Keep the rule-based logic simple and explainable.

Validate:

- Recommended task changes based on selected strategy.
- Commit and push.

### Task 34 - Add sorting and recommendation to frontend

- [ ] **Task 34 complete**

Frontend:

- sorting control on task list
- sorting control on Kanban if useful
- recommended next task card
- strategy selector

Mini-MVP:

- User can sort tasks and see the recommended next task.

Validate:

- Frontend build passes.
- Manual UI test confirms strategy behavior.
- Commit and push.

## Phase 10 - Focus/Pomodoro MVP With Command Pattern

Goal: user can track focus sessions linked to tasks.

### Task 35 - Create FocusSession backend model

- [ ] **Task 35 complete**

Create:

- `FocusSession` entity
- `FocusSessionType` enum: `POMODORO`, `DEEP_WORK`, `QUICK_FOCUS`
- `FocusSessionRepository`

Fields:

- `id`
- `task`
- `startTime`
- `endTime`
- `durationMinutes`
- `sessionType`
- `completed`
- `createdAt`

Validate:

- `mvn test` passes.
- JPA relationship works.
- Commit and push.

### Task 36 - Add focus session backend endpoints

- [ ] **Task 36 complete**

Create:

- `FocusSessionService`
- `FocusSessionController`
- focus DTOs

Endpoints:

- `POST /api/tasks/{taskId}/focus/start`
- `PATCH /api/focus-sessions/{id}/finish`
- `PATCH /api/focus-sessions/{id}/cancel`
- `GET /api/tasks/{taskId}/focus-sessions`
- `GET /api/focus-sessions`

Validate:

- Start, finish, cancel, and list work through API.
- Commit and push.

### Task 37 - Implement Command pattern for focus actions

- [ ] **Task 37 complete**

Create commands:

- `StartFocusSessionCommand`
- `FinishFocusSessionCommand`
- `CancelFocusSessionCommand`

Add simple action history storage in memory or database if already natural.

Validate:

- Commands are used by focus service/facade.
- Focus behavior still works.
- Commit and push.

### Task 38 - Build Focus frontend page

- [ ] **Task 38 complete**

Create Focus page:

- select active task
- choose focus type
- start session
- timer UI
- finish/cancel session
- session history

Mini-MVP:

- User can track Pomodoro/focus sessions linked to tasks.

Validate:

- Frontend build passes.
- Manual UI test confirms focus session flow.
- Commit and push.

## Phase 11 - Decorator Pattern MVP

Goal: tasks display smart computed metadata without bloating the base entity.

### Task 39 - Implement task display decorators

- [ ] **Task 39 complete**

Create decorators:

- `PriorityTaskDecorator`
- `DeadlineTaskDecorator`
- `DependencyTaskDecorator`

Decorators should compute display metadata such as:

- priority label
- overdue warning
- due soon warning
- dependency warning

Validate:

- Decorators are used in backend response creation.
- No entity fields are added only for display labels.
- Commit and push.

### Task 40 - Show decorated task metadata in frontend

- [ ] **Task 40 complete**

Update task cards, lists, and Kanban cards to show:

- priority label
- overdue/due soon warning
- dependency warning
- blocked reason where useful

Mini-MVP:

- Tasks feel smarter and easier to scan.

Validate:

- Frontend build passes.
- Manual UI test confirms labels and warnings.
- Commit and push.

## Phase 12 - Analytics Dashboard MVP

Goal: dashboard gives a useful global view of projects, tasks, workload, and focus time.

### Task 41 - Create analytics backend service

- [ ] **Task 41 complete**

Create:

- `AnalyticsService`
- `AnalyticsController`
- analytics DTOs

Endpoints:

- `GET /api/analytics/overview`
- `GET /api/analytics/projects/{projectId}`

Return:

- total workspaces
- total projects
- total tasks
- tasks by status
- tasks by priority
- completed task count
- total focus minutes

Validate:

- Manual API tests return correct counts.
- Commit and push.

### Task 42 - Build analytics dashboard frontend

- [ ] **Task 42 complete**

Create dashboard with:

- summary cards
- task status chart
- priority chart
- project progress section
- focus minutes card/chart

Use Recharts.

Validate:

- Frontend build passes.
- Dashboard loads real backend data.
- Commit and push.

### Task 43 - Add workload analytics

- [ ] **Task 43 complete**

Backend calculates:

- tasks due today
- tasks due this week
- overdue tasks
- high-priority open tasks
- blocked tasks

Frontend displays these in the dashboard.

Mini-MVP:

- User can understand workload at a glance.

Validate:

- Backend build passes.
- Frontend build passes.
- Manual dashboard check confirms data.
- Commit and push.

## Phase 13 - Calendar Planning View MVP

Goal: user has Kanban plus one planning view.

### Task 44 - Add backend endpoint for due tasks

- [ ] **Task 44 complete**

Create endpoint:

- `GET /api/tasks/due`

Support optional query params:

- `from`
- `to`
- `workspaceId`
- `projectId`

Return tasks grouped or sorted by due date.

Validate:

- Manual API tests work with and without filters.
- Commit and push.

### Task 45 - Build Calendar planning view frontend

- [ ] **Task 45 complete**

Create Calendar page:

- month or week layout
- tasks displayed by due date
- priority/status badges
- click task to open details or project page

Do not build Gantt.

Mini-MVP:

- User has Kanban and Calendar as the two main planning views.

Validate:

- Frontend build passes.
- Manual UI test confirms calendar data.
- Commit and push.

## Phase 14 - Professional UI And UX Polish

Goal: make the app feel like a serious portfolio project.

### Task 46 - Improve app layout and navigation

- [ ] **Task 46 complete**

Create or polish:

- sidebar
- topbar
- route navigation
- active route states
- responsive main content layout
- consistent page headers

Validate:

- Frontend build passes.
- Manual check on desktop and narrow screen.
- Commit and push.

### Task 47 - Improve forms, loading, errors, and empty states

- [ ] **Task 47 complete**

Add consistent:

- loading states
- error messages
- empty states
- delete confirmations
- disabled submit states
- basic validation messages

Validate:

- Frontend build passes.
- Manual test with empty data and invalid input.
- Commit and push.

### Task 48 - Polish visual design and usability

- [ ] **Task 48 complete**

Improve:

- priority colors
- status badges
- card spacing
- dashboard chart layout
- Kanban readability
- Calendar readability
- Focus page timer styling

Avoid overdecorating. Keep the app clean and productive.

Mini-MVP:

- The app is demo-ready visually.

Validate:

- Frontend build passes.
- Manual UI smoke test across main pages.
- Commit and push.

## Phase 15 - Final Validation And Documentation

Goal: finish with a complete, presentable project.

### Task 49 - Final backend and frontend validation

- [ ] **Task 49 complete**

Run and fix all issues:

Backend:

- `mvn test`
- start backend
- test important endpoints manually
- check error handling

Frontend:

- `npm install`
- `npm run build`
- `npm run lint` if configured
- start frontend
- manually test main flows

Main flows:

- health check
- workspace CRUD
- project CRUD
- task CRUD
- Kanban status movement
- dependencies
- notifications
- sorting/recommendation
- focus sessions
- analytics dashboard
- calendar view

Validate:

- Everything needed for the demo works.
- Commit and push.

### Task 50 - Write final documentation and presentation support

- [ ] **Task 50 complete**

Create or complete:

- `README.md`
- `docs/design-patterns.md`
- `docs/presentation-plan.md`

`README.md` must include:

- project description
- problem solved
- feature list
- tech stack
- architecture overview
- setup instructions
- API overview
- screenshots section placeholder

`docs/design-patterns.md` must explain each required pattern:

- why it was used
- where it appears
- important class names
- small UML-style explanation in text
- benefit to the project

`docs/presentation-plan.md` must include:

- project problem
- proposed solution
- demo flow
- backend architecture
- frontend architecture
- design patterns
- database overview
- conclusion

Final result:

- FocusForge is complete enough for a Genie Logiciel presentation.
- GitHub history shows incremental task-by-task progress.

Validate:

- Documentation is accurate.
- Final backend/frontend checks still pass if code changed.
- Commit and push.

## Prompt To Use In Claude Code

Use this exact prompt when starting Claude Code:

```txt
Read CLAUDE.md and TASKS.md carefully.

Start from the first unfinished task and execute tasks sequentially.

Continue autonomously until every task in TASKS.md is complete.

After each task:
- validate the result
- run necessary backend/frontend checks
- mark the task checkbox as done with `- [x]`
- review git diff and git status
- commit changes
- push to GitHub
- immediately continue to the next unfinished task

Do not skip tasks.
Do not build features outside the scope.
Each phase must keep the app working as a mini-MVP with backend and frontend connected.
Do not ask whether to continue between tasks.
Do not stop after completing only one task.
Do not provide a final summary until all tasks are complete.

Only stop if:
- all tasks are complete
- a real blocker requires user action
- the session/tool/context/API limit forces you to stop

If stopped, report the exact current task number, what was completed, what remains, and how to resume.
```
