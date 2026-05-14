import { httpClient } from './httpClient';
import type { AppUser, AuthResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

class AuthApi {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post('/api/auth/login', request);
    return response.data;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post('/api/auth/register', request);
    return response.data;
  }

  async me(): Promise<AppUser> {
    const response = await httpClient.get('/api/auth/me');
    return response.data;
  }
}

export const authApi = new AuthApi();
