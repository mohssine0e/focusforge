# FocusForge Presentation Plan

## Project Problem

Engineering students and developers often manage projects, study tasks, deadlines, and deep work in separate tools. The result is fragmented planning:

- Tasks exist without project context.
- Deadlines are visible only in lists.
- Focus sessions are disconnected from actual work.
- It is hard to answer: "What should I work on next?"

FocusForge solves this by providing one mono-user planning workspace for projects, tasks, deadlines, workflow, analytics, and focus work.

## Proposed Solution

FocusForge is a full-stack productivity and project management platform inspired by Notion, Linear, Jira, and ClickUp, scoped for one user.

Core idea:

```txt
Workspace -> Projects -> Tasks -> Workflow, Dependencies, Focus, Analytics
```

The app is not a simple todo list. It adds engineering-oriented structure:

- Project hierarchy
- Controlled Kanban workflow
- Dependency rules
- Recommendation strategies
- Focus sessions
- Analytics dashboard
- Calendar planning
- Notification feedback

## Demo Flow

1. Open the Dashboard.
   - Show totals, workload snapshot, charts, project progress, and focus time.

2. Open Workspaces.
   - Create or show a workspace.
   - Explain that this is the top-level planning container.

3. Open a Workspace.
   - Show projects and project cards.
   - Create a project if needed.

4. Open a Project.
   - Create tasks.
   - Show task badges, estimates, metadata, and dependency controls.
   - Show sorting and next-task recommendation.

5. Open the Kanban board.
   - Move a task through valid transitions.
   - Explain invalid transitions are rejected by backend State pattern rules.

6. Show Dependencies.
   - Add a task dependency.
   - Explain blocked-start validation.

7. Show Notifications.
   - Move a task status and show generated notification.

8. Open Focus Mode.
   - Select a task.
   - Start, finish, or cancel a focus session.
   - Show session history.

9. Open Calendar.
   - Show due tasks grouped by date.
   - Explain backend filtering by date, workspace, or project.

10. Return to Analytics.
    - Show how the app answers the core question about current workload.

## Backend Architecture

Backend stack:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven

Main layers:

```txt
Controller -> Service / Facade -> Repository -> Entity -> PostgreSQL
```

Supporting architecture:

- `dto`: request and response models
- `exception`: global API error envelope
- `builder`: project creation
- `factory`: task creation
- `facade`: cross-service project management
- `observer`: task status notifications
- `strategy`: sorting and recommendation
- `command`: focus session actions
- `decorator`: task display metadata
- `state`: workflow transition rules

All API responses follow:

```txt
{ success, data, message, timestamp }
```

## Frontend Architecture

Frontend stack:

- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- TailwindCSS utility classes

Main structure:

```txt
src/api        typed API clients
src/components reusable workspace/project components
src/pages      dashboard, project detail, Kanban, calendar, focus
src/types      shared TypeScript contracts
src/store      shared state placeholder
```

User experience:

- Fixed sidebar and topbar
- Dark productivity SaaS style
- Dashboard-first experience
- Responsive navigation
- Empty, loading, error, and disabled states
- Real backend data, no mock replacement data

## Design Patterns

Required patterns used in production code:

- Builder: `ProjectBuilder`
- Factory: `TaskFactory`
- Facade: `ProjectManagementFacade`
- Observer: `TaskObserver`, `NotificationObserver`
- Strategy: task sorting and recommendation strategies
- Command: focus session commands
- Decorator: computed task metadata decorators
- State: valid task status transition classes

Presentation emphasis:

The patterns are not isolated examples. They are integrated into real user flows: project creation, task creation, Kanban movement, notifications, recommendations, focus sessions, and display metadata.

## Database Overview

Main tables:

- `workspaces`
- `projects`
- `tasks`
- `task_dependencies`
- `notifications`
- `focus_sessions`

Relationships:

```txt
Workspace 1 -> many Projects
Project 1 -> many Tasks
Task 1 -> many FocusSessions
Task many -> many Tasks through TaskDependency
Task status changes -> Notifications
```

Persistence is handled through Spring Data JPA repositories with PostgreSQL.

## Conclusion

FocusForge demonstrates a complete full-stack engineering project:

- Clean backend layering
- Real database-backed features
- Multiple design patterns used in production flows
- Typed frontend API integration
- Useful dashboard and planning UX
- Validation and error handling across backend and frontend

The final demo should end on the dashboard because it summarizes the product purpose: showing where the user stands across projects, studies, deadlines, and focus work.
