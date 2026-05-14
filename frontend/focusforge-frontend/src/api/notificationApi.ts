import { httpClient } from './httpClient';
import type { AppNotification } from '../types';

class NotificationApi {
  async getNotifications(): Promise<AppNotification[]> {
    const response = await httpClient.get('/api/notifications');
    return response.data;
  }

  async markAsRead(id: number): Promise<AppNotification> {
    const response = await httpClient.patch(`/api/notifications/${id}/read`);
    return response.data;
  }

  async deleteNotification(id: number): Promise<void> {
    await httpClient.delete(`/api/notifications/${id}`);
  }
}

export const notificationApi = new NotificationApi();
