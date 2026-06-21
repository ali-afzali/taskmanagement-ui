const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';
const USER_ID_KEY = 'auth_user_id';

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getAuthUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function saveAuthUsername(username: string): void {
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function removeAuthUsername(): void {
  sessionStorage.removeItem(USERNAME_KEY);
}

export function getAuthUserId(): number | null {
  const val = sessionStorage.getItem(USER_ID_KEY);
  return val !== null ? parseInt(val, 10) : null;
}

export function saveAuthUserId(userId: number): void {
  sessionStorage.setItem(USER_ID_KEY, String(userId));
}

export function removeAuthUserId(): void {
  sessionStorage.removeItem(USER_ID_KEY);
}
