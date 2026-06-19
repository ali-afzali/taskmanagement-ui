export interface LoginCredentials {
  username: string;
  password: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://localhost:7217';

export const authorizationService = {
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/Authorization/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const token = await response.text();
    return token;
  },
};
