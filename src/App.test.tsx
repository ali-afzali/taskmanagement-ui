import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { TaskItem, TaskItemStatus } from './types/TaskItem';

// ── Mock child components ────────────────────────────────────────────────────
jest.mock('./components/app-header/AppHeader', () => ({
  __esModule: true,
  default: ({ onNewTask }: { onNewTask: () => void }) => (
    <header data-testid="app-header">
      <button onClick={onNewTask}>New Task</button>
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
  it('renders AppHeader and TaskList on initial load', () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

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
    expect(screen.getByTestId('task-form')).toBeInTheDocument();

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
    expect(screen.getByTestId('task-form')).toBeInTheDocument();

    act(() => {
      screen.getByText('Cancel').click();
    });

    expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
  });

  it('clears selected task after Save so a subsequent New Task opens a blank form', () => {
    render(<App />);

    // Select a task and save
    act(() => {
      screen.getByText('Select Task').click();
    });
    act(() => {
      screen.getByText('Save').click();
    });

    // Open a new form — selectedTask should be cleared
    act(() => {
      screen.getByText('New Task').click();
    });

    expect(screen.getByTestId('task-form-title').textContent).toBe('new');
  });

  it('clears selected task after Cancel so a subsequent New Task opens a blank form', () => {
    render(<App />);

    // Select a task and cancel
    act(() => {
      screen.getByText('Select Task').click();
    });
    act(() => {
      screen.getByText('Cancel').click();
    });

    // Open a new form — selectedTask should be cleared
    act(() => {
      screen.getByText('New Task').click();
    });

    expect(screen.getByTestId('task-form-title').textContent).toBe('new');
  });
});
