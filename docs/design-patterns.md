# FocusForge Design Patterns

This document explains the required design patterns used in FocusForge and where they appear in production code.

## Builder

Used for project creation.

Classes:

- `builder/ProjectBuilder.java`
- `service/ProjectService.java`

Why:

Project creation has multiple fields and defaults. The builder keeps construction readable and avoids spreading entity setup across the service.

Flow:

```txt
ProjectService
  -> ProjectBuilder.builder()
  -> name / description / status / priority / dates / workspace
  -> build()
  -> ProjectRepository.save()
```

Benefit:

The project creation path is explicit, easy to extend, and avoids constructors with long argument lists in service code.

## Factory

Used for task creation by task type.

Classes:

- `factory/TaskFactory.java`
- `entity/TaskType.java`
- `service/TaskService.java`

Why:

Different task types need sensible default estimates. The factory centralizes task-type defaults instead of scattering conditional logic through controllers or services.

Flow:

```txt
TaskService.createTask()
  -> TaskFactory.createTask(title, description, project, type)
  -> STUDY/CODING/RESEARCH/ADMIN defaults
  -> TaskRepository.save()
```

Benefit:

New task types can be added in one location without changing controller behavior.

## Facade

Used to coordinate project-management operations across services.

Classes:

- `facade/ProjectManagementFacade.java`
- `controller/ProjectController.java`

Why:

Controllers should stay thin. The facade provides a single orchestration point for operations that involve workspace, project, task, and status behavior.

Flow:

```txt
Controller
  -> ProjectManagementFacade
  -> WorkspaceService / ProjectService / TaskService / TaskStateService
```

Benefit:

HTTP handlers remain focused on request and response concerns while cross-service workflows live behind a stable API.

## Observer

Used for task status change notifications.

Classes:

- `observer/TaskStatusChangedEvent.java`
- `observer/TaskObserver.java`
- `observer/NotificationObserver.java`
- `service/TaskService.java`
- `service/NotificationService.java`

Why:

Status changes should trigger secondary behavior without hard-coding notification details into workflow logic.

Flow:

```txt
TaskService.updateTaskStatus()
  -> create TaskStatusChangedEvent
  -> notify List<TaskObserver>
  -> NotificationObserver
  -> NotificationService.createNotification()
```

Benefit:

More observers, such as audit logging, can be added later without changing the task status method.

## Strategy

Used for task sorting and next-task recommendation.

Classes:

- `strategy/TaskSortStrategy.java`
- `strategy/ByPriorityStrategy.java`
- `strategy/ByDeadlineStrategy.java`
- `strategy/ByStatusStrategy.java`
- `strategy/TaskRecommendationStrategy.java`
- `strategy/PriorityFirstRecommendationStrategy.java`
- `strategy/DeadlineFirstRecommendationStrategy.java`
- `strategy/ShortestTaskRecommendationStrategy.java`
- `service/TaskService.java`

Why:

Sorting and recommendation rules are interchangeable algorithms selected by query parameter.

Flow:

```txt
GET /api/projects/{projectId}/tasks?sort=priority
  -> TaskService
  -> matching TaskSortStrategy
  -> sorted tasks

GET /api/projects/{projectId}/tasks/recommended?strategy=deadline
  -> TaskService
  -> matching TaskRecommendationStrategy
  -> recommended task
```

Benefit:

Each rule stays small and testable, and the service does not need a growing switch statement.

## Command

Used for focus session actions with action history.

Classes:

- `command/FocusSessionCommand.java`
- `command/StartFocusSessionCommand.java`
- `command/FinishFocusSessionCommand.java`
- `command/CancelFocusSessionCommand.java`
- `service/FocusSessionService.java`

Why:

Focus actions are user commands with consistent execution and history tracking.

Flow:

```txt
FocusSessionController
  -> FocusSessionService
  -> Start/Finish/CancelFocusSessionCommand.execute()
  -> FocusSessionRepository
  -> action history
```

Benefit:

Focus behavior is grouped into explicit actions, making command history and future undo-like behavior easier to reason about.

## Decorator

Used for computed task display metadata.

Classes:

- `decorator/TaskMetadataDecorator.java`
- `decorator/PriorityTaskDecorator.java`
- `decorator/DeadlineTaskDecorator.java`
- `decorator/DependencyTaskDecorator.java`
- `decorator/TaskDisplayMetadata.java`
- `decorator/TaskResponseDecorator.java`
- `dto/TaskResponse.java`

Why:

Display-only metadata such as overdue state, priority label, and dependency warnings should not bloat the `Task` entity.

Flow:

```txt
TaskController
  -> TaskResponseDecorator.decorate(task)
  -> PriorityTaskDecorator
  -> DeadlineTaskDecorator
  -> DependencyTaskDecorator
  -> TaskResponse.from(task, metadata)
```

Benefit:

The persistence model remains clean while the frontend receives richer task cards.

## State

Used to enforce valid task status transitions.

Classes:

- `state/TaskState.java`
- `state/TodoState.java`
- `state/InProgressState.java`
- `state/BlockedState.java`
- `state/ReviewState.java`
- `state/DoneState.java`
- `service/TaskStateService.java`
- `service/TaskService.java`

Why:

Task workflow rules should live in state classes rather than ad hoc controller checks.

Allowed transitions:

- `TODO -> IN_PROGRESS`
- `TODO -> BLOCKED`
- `IN_PROGRESS -> REVIEW`
- `IN_PROGRESS -> BLOCKED`
- `BLOCKED -> IN_PROGRESS`
- `REVIEW -> DONE`

Flow:

```txt
PATCH /api/tasks/{id}/status
  -> TaskService.updateTaskStatus()
  -> TaskStateService.isValidTransition(current, next)
  -> concrete TaskState
  -> accept or reject
```

Benefit:

Workflow rules are explicit, easy to audit, and protected from invalid UI or API calls.
