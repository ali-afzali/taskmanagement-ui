import { ApiError } from './apiError';

describe('ApiError', () => {
  it('sets name, message, and status correctly', () => {
    const error = new ApiError(404, 'Not found');

    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
  });

  it('is an instance of Error and ApiError', () => {
    const error = new ApiError(500, 'Server error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });

  it('isNetworkError is true only when status is 0', () => {
    expect(new ApiError(0, 'Network error').isNetworkError).toBe(true);
    expect(new ApiError(401, 'Unauthorized').isNetworkError).toBe(false);
    expect(new ApiError(500, 'Server error').isNetworkError).toBe(false);
  });

  it('isAuthError is true for status 401', () => {
    expect(new ApiError(401, 'Unauthorized').isAuthError).toBe(true);
  });

  it('isAuthError is true for status 403', () => {
    expect(new ApiError(403, 'Forbidden').isAuthError).toBe(true);
  });

  it('isAuthError is false for non-auth statuses', () => {
    expect(new ApiError(0, 'Network error').isAuthError).toBe(false);
    expect(new ApiError(404, 'Not found').isAuthError).toBe(false);
    expect(new ApiError(500, 'Server error').isAuthError).toBe(false);
  });
});
