import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const healthApi = {
  getHealth: () => httpClient.get('/api/health'),
};