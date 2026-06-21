import { useState, useCallback } from 'react';
import { authenticationService, LoginCredentials } from '../../services/authenticationService';
import { saveAuthToken, saveAuthUsername, saveAuthUserId } from '../../utils/storage';
import { ApiError } from '../../services/apiError';

export type LoginErrorType = 'auth' | 'network' | 'server' | null;

export interface LoginViewModel {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  errorType: LoginErrorType;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useLoginViewModel(onLoginSuccess: () => void): LoginViewModel {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<LoginErrorType>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!username.trim() || !password.trim()) {
        setError('Username and password are required.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setErrorType(null);

        const credentials: LoginCredentials = { username, password };
        const {
          token,
          userId,
          username: returnedUsername,
        } = await authenticationService.login(credentials);
        saveAuthToken(token);
        saveAuthUsername(returnedUsername);
        saveAuthUserId(userId);
        onLoginSuccess();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          setErrorType(err.isNetworkError ? 'network' : err.isAuthError ? 'auth' : 'server');
        } else {
          setError('An unexpected error occurred. Please try again.');
          setErrorType('server');
        }
      } finally {
        setLoading(false);
      }
    },
    [username, password, onLoginSuccess]
  );

  return {
    username,
    password,
    loading,
    error,
    errorType,
    setUsername,
    setPassword,
    handleSubmit,
  };
}
