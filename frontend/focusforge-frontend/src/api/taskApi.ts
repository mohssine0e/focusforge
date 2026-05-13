import { httpClient } from './httpClient';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string;
  estimatedMinutes: number;
  project: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  type: string;
}

class TaskApi {
  async getTasksByProject(projectId: number): Promise<Task[]> {
    const response = await httpClient.get<Task[]>(`/api/projects/${projectId}/tasks`);
    return response.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await httpClient.get<Task>(`/api/tasks/${id}`);
    return response.data;
  }

  async createTask(projectId: number, taskData: TaskRequest): Promise<Task> {
    const response = await httpClient.post<Task>(`/api/projects/${projectId}/tasks`, null, {
      params: taskData,
    });
    return response.data;
  }

  async updateTask(id: number, taskData: TaskRequest): Promise<Task> {
    const response = await httpClient.put<Task>(`/api/tasks/${id}`, null, {
      params: taskData,
    });
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await httpClient.delete(`/api/tasks/${id}`);
  }

  async updateTaskStatus(taskId: number, status: string): Promise<any> {
    const response = await httpClient.patch<any>(`/api/tasks/${taskId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
}

export const taskApi = new TaskApi();
