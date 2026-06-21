import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { getAuthToken } from './utils/storage';
import { TaskItem, TaskItemStatus } from './types/TaskItem';

// ── Mock storage ──────────────────────────────────────────────────────────────
jest.mock('./utils/storage', () => ({
  getAuthToken: jest.fn().mockReturnValue('fake-token'),
  getAuthUsername: jest.fn().mockReturnValue('testuser'),
  getAuthUserId: jest.fn().mockReturnValue(1),
  saveAuthToken: jest.fn(),
  saveAuthUsername: jest.fn(),
  saveAuthUserId: jest.fn(),
  removeAuthToken: jest.fn(),
  removeAuthUsername: jest.fn(),
  removeAuthUserId: jest.fn(),
}));

// ── Mock services ─────────────────────────────────────────────────────────────
jest.mock('./services/authenticationService', () => ({
  authenticationService: {
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Mock child components ─────────────────────────────────────────────────────
jest.mock('./components/login/LoginPage', () => ({
  __esModule: true,
  default: ({ onLoginSuccess }: { onLoginSuccess: () => void }) => (
    <div data-testid="login-page">
      <button onClick={onLoginSuccess}>Login</button>
    </div>
  ),
}));

jest.mock('./components/app-header/AppHeader', () => ({
  __esModule: true,
  default: ({
    onNewTask,
    onLogout,
  }: {
    onNewTask: () => void;
    onLogout: () => void;
    username: string;
  }) => (
    <header data-testid="app-header">
      <button onClick={onNewTask}>New Task</button>
      <button onClick={onLogout}>Logout</button>
    </header>
  ),
}));

jest.mock('./components/task-list/TaskList', () => ({
  __esModule: true,
  default: ({ onTaskSelect }: { onTaskSelect: (task: TaskItem) => void }) => (
    <div data-testid="task-list">
      <button
        onClick={() =>
          onTaskSelect({
            id: 1,
            title: 'Existing Task',
            description: 'desc',
            status: TaskItemStatus.NotStarted,
            createdDate: '2024-01-01',
            assigneeUserId: 1,
            createdByUserId: 1,
          })
        }
      >
        Select Task
      </button>
    </div>
  ),
}));

jest.mock('./components/task-form/TaskForm', () => ({
  __esModule: true,
  default: ({
    task,
    onSave,
    onCancel,
  }: {
    task?: TaskItem;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="task-form">
      <span data-testid="task-form-title">{task ? task.title : 'new'}</span>
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('App', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Auth gate ───────────────────────────────────────────────────────────────

  it('renders AppHeader and TaskList when authenticated', () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('shows LoginPage when not authenticated', () => {
    (getAuthToken as jest.Mock).mockReturnValueOnce(null);
    render(<App />);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
  });

  it('shows the app after a successful login', () => {
    (getAuthToken as jest.Mock).mockReturnValueOnce(null);
    render(<App />);

    act(() => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  it('shows LoginPage after logout', async () => {
    render(<App />);
    expect(screen.getByTestId('app-header')).toBeInTheDocument();

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
  });

  // ── TaskForm visibility ─────────────────────────────────────────────────────

  it('does not show TaskForm on initial render', () => {
    render(<App />);

    expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
  });

  it('shows TaskForm without a selected task when New Task is clicked', () => {
    render(<App />);

    act(() => {
      screen.getByText('New Task').click();
    });

    expect(screen.getByTestId('task-form')).toBeInTheDocument();
    expect(screen.getByTestId('task-form-title').textContent).toBe('new');
  });

  it('shows TaskForm with the selected task when a task is selected', () => {
    render(<App />);

    act(() => {
      screen.getByText('Select Task').click();
    });

    expect(screen.getByTestId('task-form')).toBeInTheDocument();
    expect(screen.getByTestId('task-form-title').textContent).toBe('Existing Task');
  });

  it('hides TaskForm and clears selection when Save is clicked', () => {
    render(<App />);

    act(() => {
      screen.getByText('Select Task').click();
    });
    act(() => {
      screen.getByText('Save').click();
    });

    expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
  });

  it('hides TaskForm when Cancel is clicked', () => {
    render(<App />);

    act(() => {
      screen.getByText('New Task').click();
    });
    act(() => {
      screen.getByText('Cancel').click();
    });

    expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
  });

  it('clears selected task after Save so a subsequent New Task opens a blank form', () => {
    render(<App />);

    act(() => {
      screen.getByText('Select Task').click();
    });
    act(() => {
      screen.getByText('Save').click();
    });
    act(() => {
      screen.getByText('New Task').click();
    });

    expect(screen.getByTestId('task-form-title').textContent).toBe('new');
  });

  it('clears selected task after Cancel so a subsequent New Task opens a blank form', () => {
    render(<App />);

    act(() => {
      screen.getByText('Select Task').click();
    });
    act(() => {
      screen.getByText('Cancel').click();
    });
    act(() => {
      screen.getByText('New Task').click();
    });

    expect(screen.getByTestId('task-form-title').textContent).toBe('new');
  });
});
