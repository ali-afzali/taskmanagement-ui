import { ApiError } from './apiError';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://localhost:7217';

export const authenticationService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/Authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection and try again.');
    }

    switch (response.status) {
      case 401:
        throw new ApiError(401, 'Invalid username or password.');
      case 403:
        throw new ApiError(403, 'Your account is locked or disabled. Contact your administrator.');
      case 500:
      case 502:
      case 503:
        throw new ApiError(response.status, 'Server error. Please try again later.');
      default:
        if (!response.ok) {
          throw new ApiError(response.status, 'Login failed. Please try again.');
        }
    }

    return response.json() as Promise<LoginResponse>;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/Authentication/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Ignore network errors on logout — clear local session regardless
    }
  },
};
