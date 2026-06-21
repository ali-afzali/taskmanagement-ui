import type { FormEvent } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useLoginViewModel } from './LoginViewModel';
import { authenticationService } from '../../services/authenticationService';
import * as storage from '../../utils/storage';
import { ApiError } from '../../services/apiError';

jest.mock('../../services/authenticationService', () => ({
  authenticationService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('../../utils/storage', () => ({
  saveAuthToken: jest.fn(),
  saveAuthUsername: jest.fn(),
  saveAuthUserId: jest.fn(),
}));

const mockedLogin = authenticationService.login as jest.Mock;
const fakeEvent = { preventDefault: jest.fn() } as unknown as FormEvent;

describe('useLoginViewModel', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Initial state ───────────────────────────────────────────────────────────

  it('starts with empty fields, loading=false, error=null, errorType=null', () => {
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    expect(result.current.username).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.errorType).toBeNull();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('sets error and does not call login when username is empty', async () => {
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setPassword('secret');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Username and password are required.');
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('sets error and does not call login when password is empty', async () => {
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setUsername('admin');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Username and password are required.');
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  // ── Successful login ────────────────────────────────────────────────────────

  it('saves token, username and userId then calls onLoginSuccess on success', async () => {
    mockedLogin.mockResolvedValue({ token: 'tok123', userId: 7, username: 'admin' });
    const onLoginSuccess = jest.fn();
    const { result } = renderHook(() => useLoginViewModel(onLoginSuccess));

    act(() => {
      result.current.setUsername('admin');
      result.current.setPassword('secret');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(storage.saveAuthToken).toHaveBeenCalledWith('tok123');
    expect(storage.saveAuthUsername).toHaveBeenCalledWith('admin');
    expect(storage.saveAuthUserId).toHaveBeenCalledWith(7);
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it('sets errorType=auth on 401 ApiError', async () => {
    mockedLogin.mockRejectedValue(new ApiError(401, 'Invalid credentials.'));
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setUsername('admin');
      result.current.setPassword('wrong');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errorType).toBe('auth');
    expect(result.current.error).toBe('Invalid credentials.');
  });

  it('sets errorType=network on status-0 ApiError', async () => {
    mockedLogin.mockRejectedValue(new ApiError(0, 'Unable to connect to the server.'));
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setUsername('admin');
      result.current.setPassword('pass');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errorType).toBe('network');
  });

  it('sets errorType=server on 500 ApiError', async () => {
    mockedLogin.mockRejectedValue(new ApiError(500, 'Internal server error.'));
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setUsername('admin');
      result.current.setPassword('pass');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errorType).toBe('server');
  });

  it('sets errorType=server and a generic message on unexpected errors', async () => {
    mockedLogin.mockRejectedValue(new Error('Unexpected'));
    const { result } = renderHook(() => useLoginViewModel(jest.fn()));

    act(() => {
      result.current.setUsername('admin');
      result.current.setPassword('pass');
    });
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errorType).toBe('server');
    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
  });
});
