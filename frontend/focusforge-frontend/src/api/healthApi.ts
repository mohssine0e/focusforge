import { httpClient } from './httpClient';

export const healthApi = {
  getHealth: () => httpClient.get('/api/health'),
};