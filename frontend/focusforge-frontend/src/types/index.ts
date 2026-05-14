export interface Workspace {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  workspaceId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatusType;
  priority: Priority;
  type: TaskType;
  dueDate: string;
  estimatedMinutes: number;
  projectId?: number;
  projectName?: string;
  priorityLabel?: string;
  overdue?: boolean;
  dueSoon?: boolean;
  dependencyWarning?: boolean;
  blockedReason?: string | null;
  project?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatus {
  name: string;
  color: string;
  nextStatuses: string[];
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'DONE';

export type TaskType = 'STUDY' | 'CODING' | 'RESEARCH' | 'ADMIN';

export interface TaskDependency {
  id: number;
  taskId: number;
  taskTitle: string;
  dependsOnTaskId: number;
  dependsOnTaskTitle: string;
  dependsOnTaskStatus: TaskStatusType;
  createdAt: string;
}

export type NotificationType = 'TASK_UPDATED' | 'TASK_BLOCKED' | 'TASK_COMPLETED' | 'DEADLINE_WARNING';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FocusSessionType = 'POMODORO' | 'DEEP_WORK' | 'QUICK_FOCUS';

export interface FocusSession {
  id: number;
  taskId: number;
  taskTitle: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  sessionType: FocusSessionType;
  completed: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalWorkspaces: number;
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  completedTaskCount: number;
  totalFocusMinutes: number;
}

export interface TaskRequest {
  title: string;
  description: string;
  type: TaskType;
  status?: TaskStatusType;
  priority?: Priority;
  dueDate?: string;
  estimatedMinutes?: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description: string;
}
