# FocusForge

FocusForge is a mono-user productivity and project management platform for engineering students and developers. It answers one practical question:

> Where am I in my projects, studies, deadlines, and focus work?

It combines project tracking, task workflow, dependencies, focus sessions, notifications, analytics, and a calendar planning view in one full-stack application.

## Features

- Workspace, project, and task management
- Controlled Kanban workflow with valid status transitions
- Task dependencies with self, duplicate, circular, and blocked-start validation
- Notifications generated from task status changes
- Rule-based task sorting and next-task recommendation
- Focus session tracking with start, finish, cancel, and history
- Analytics dashboard for project/task totals, workload, priorities, status, and focus time
- Calendar planning view backed by due-task filters
- Premium dark-mode React UI with responsive sidebar/topbar layout

## Tech Stack

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven

Frontend:

- React
- TypeScript
- Vite
- TailwindCSS utility classes
- React Router
- Axios
- Recharts

## Architecture

Backend packages are organized by responsibility:

- `controller`: thin REST controllers
- `service`: application business logic
- `repository`: Spring Data persistence
- `entity`: JPA entities and enums
- `dto`: API response/request models
- `builder`, `factory`, `facade`, `observer`, `strategy`, `command`, `decorator`, `state`: design pattern implementations used in production flows
- `exception`: global API error handling

Frontend structure:

- `src/api`: typed API clients
- `src/components`: reusable workspace/project UI
- `src/pages`: dashboard, workspaces, projects, Kanban, calendar, focus
- `src/types`: shared TypeScript contracts
- `src/store`: shared state placeholder

All backend responses use the envelope:

```json
{
  "success": true,
  "data": {},
  "message": null,
  "timestamp": "2026-05-14T04:10:25"
}
```

## Setup

Prerequisites:

- Java 21+
- Maven
- Node.js and npm
- PostgreSQL running locally

Create a PostgreSQL database:

```bash
createdb focusforge
```

Configure database credentials in:

```txt
backend/src/main/resources/application.properties
```

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

Run the frontend:

```bash
cd frontend/focusforge-frontend
npm install
npm run dev
```

Backend URL:

```txt
http://localhost:8080
```

Frontend URL:

```txt
http://localhost:5173
```

The Vite dev server proxies `/api` to the backend.

## Validation

Backend:

```bash
cd backend
mvn test
mvn spring-boot:run
```

Frontend:

```bash
cd frontend/focusforge-frontend
npm install
npm run build
npm run lint
```

## API Overview

Health:

- `GET /api/health`

Workspaces:

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/{id}`
- `PUT /api/workspaces/{id}`
- `DELETE /api/workspaces/{id}`

Projects:

- `GET /api/workspaces/{workspaceId}/projects`
- `POST /api/workspaces/{workspaceId}/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`

Tasks:

- `GET /api/projects/{projectId}/tasks?sort=priority|deadline|status`
- `POST /api/projects/{projectId}/tasks`
- `GET /api/projects/{projectId}/tasks/recommended?strategy=priority|deadline|shortest`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `GET /api/tasks/due?from=YYYY-MM-DD&to=YYYY-MM-DD&workspaceId=&projectId=`

Dependencies:

- `POST /api/tasks/{taskId}/dependencies/{dependsOnTaskId}`
- `DELETE /api/tasks/{taskId}/dependencies/{dependsOnTaskId}`
- `GET /api/tasks/{taskId}/dependencies`

Notifications:

- `GET /api/notifications`
- `PATCH /api/notifications/{id}/read`
- `DELETE /api/notifications/{id}`

Focus sessions:

- `POST /api/tasks/{taskId}/focus/start`
- `PATCH /api/focus-sessions/{id}/finish`
- `PATCH /api/focus-sessions/{id}/cancel`
- `GET /api/tasks/{taskId}/focus-sessions`
- `GET /api/focus-sessions`

Analytics:

- `GET /api/analytics/overview`
- `GET /api/analytics/projects/{projectId}`

## Screenshots

Screenshots can be added here for the final presentation:

- Dashboard
- Project task detail
- Kanban board
- Calendar planning view
- Focus mode
