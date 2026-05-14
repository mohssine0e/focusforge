import { httpClient } from './httpClient';
import type { FocusSession, FocusSessionType } from '../types';

class FocusApi {
  async startSession(taskId: number, sessionType: FocusSessionType): Promise<FocusSession> {
    const response = await httpClient.post(`/api/tasks/${taskId}/focus/start`, null, {
      params: { sessionType },
    });
    return response.data;
  }

  async finishSession(sessionId: number): Promise<FocusSession> {
    const response = await httpClient.patch(`/api/focus-sessions/${sessionId}/finish`);
    return response.data;
  }

  async cancelSession(sessionId: number): Promise<FocusSession> {
    const response = await httpClient.patch(`/api/focus-sessions/${sessionId}/cancel`);
    return response.data;
  }

  async getTaskSessions(taskId: number): Promise<FocusSession[]> {
    const response = await httpClient.get(`/api/tasks/${taskId}/focus-sessions`);
    return response.data;
  }

  async getAllSessions(): Promise<FocusSession[]> {
    const response = await httpClient.get('/api/focus-sessions');
    return response.data;
  }

  async getActiveSession(): Promise<FocusSession | null> {
    const response = await httpClient.get('/api/focus-sessions/active');
    return response.data;
  }
}

export const focusApi = new FocusApi();
