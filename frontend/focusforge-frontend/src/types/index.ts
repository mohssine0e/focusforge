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
  project: {
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
