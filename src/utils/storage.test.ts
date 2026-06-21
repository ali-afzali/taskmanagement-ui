import {
  getAuthToken,
  saveAuthToken,
  removeAuthToken,
  getAuthUsername,
  saveAuthUsername,
  removeAuthUsername,
  getAuthUserId,
  saveAuthUserId,
  removeAuthUserId,
} from './storage';

describe('storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // ── token ───────────────────────────────────────────────────────────────────

  it('getAuthToken returns null when not set', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('saveAuthToken and getAuthToken round-trip', () => {
    saveAuthToken('abc123');
    expect(getAuthToken()).toBe('abc123');
  });

  it('removeAuthToken clears the token', () => {
    saveAuthToken('abc123');
    removeAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  // ── username ────────────────────────────────────────────────────────────────

  it('getAuthUsername returns null when not set', () => {
    expect(getAuthUsername()).toBeNull();
  });

  it('saveAuthUsername and getAuthUsername round-trip', () => {
    saveAuthUsername('alice');
    expect(getAuthUsername()).toBe('alice');
  });

  it('removeAuthUsername clears the username', () => {
    saveAuthUsername('alice');
    removeAuthUsername();
    expect(getAuthUsername()).toBeNull();
  });

  // ── userId ──────────────────────────────────────────────────────────────────

  it('getAuthUserId returns null when not set', () => {
    expect(getAuthUserId()).toBeNull();
  });

  it('saveAuthUserId and getAuthUserId round-trip as a number', () => {
    saveAuthUserId(42);
    expect(getAuthUserId()).toBe(42);
  });

  it('removeAuthUserId clears the userId', () => {
    saveAuthUserId(42);
    removeAuthUserId();
    expect(getAuthUserId()).toBeNull();
  });
});
