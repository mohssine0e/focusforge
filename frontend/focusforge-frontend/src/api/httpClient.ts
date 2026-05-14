import axios from 'axios';

const API_BASE_URL = '';

// Define the API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Create an interceptor to handle the new API response format
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('focusforge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to automatically extract data from the ApiResponse wrapper
httpClient.interceptors.response.use(
  (response) => {
    // If the response data has the new ApiResponse format, extract the actual data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { httpClient };
