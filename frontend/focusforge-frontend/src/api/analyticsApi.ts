import { httpClient } from './httpClient';
import type { AnalyticsOverview } from '../types';

class AnalyticsApi {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await httpClient.get('/api/analytics/overview');
    return response.data;
  }
}

export const analyticsApi = new AnalyticsApi();
