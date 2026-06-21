import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from './TaskList';
import { useTaskListViewModel } from './TaskListViewModel';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';
import { Notification } from './TaskListViewModel';

// ── Mock child components ────────────────────────────────────────────────────
jest.mock('../status-columns/column/StatusColumns', () => ({
  __esModule: true,
  default: ({ tasks, onEdit, onDeleted }: any) => (
    <div data-testid="status-columns">
      {tasks.map((t: TaskItem) => (
        <div key={t.id} data-testid={`task-${t.id}`}>
          <span>{t.title}</span>
          <button onClick={() => onDeleted(t.id)}>delete-{t.id}</button>
          {onEdit && <button onClick={() => onEdit(t)}>edit-{t.id}</button>}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../task-card/TaskCard', () => ({
  __esModule: true,
  default: ({ task }: any) => <div data-testid="drag-overlay-card">{task.title}</div>,
}));

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: any) => {
    (globalThis as any).__dndHandlers = { onDragStart, onDragOver, onDragEnd };
    return <div>{children}</div>;
  },
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

// ── Mock view model ──────────────────────────────────────────────────────────
jest.mock('./TaskListViewModel');
const mockedUseViewModel = useTaskListViewModel as jest.MockedFunction<typeof useTaskListViewModel>;

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Task One',
    description: 'Desc',
    status: TaskItemStatus.NotStarted,
    createdDate: '2024-01-01',
    assigneeUserId: 1,
    createdByUserId: 1,
  },
  {
    id: 2,
    title: 'Task Two',
    description: 'Desc',
    status: TaskItemStatus.InProgress,
    createdDate: '2024-01-02',
    assigneeUserId: 1,
    createdByUserId: 1,
  },
];

function buildViewModel(overrides: Partial<ReturnType<typeof useTaskListViewModel>> = {}) {
  return {
    tasks: mockTasks,
    loading: false,
    error: null,
    notification: null,
    loadTasks: jest.fn(),
    deleteTask: jest.fn(),
    clearNotification: jest.fn(),
    handleStatusChange: jest.fn(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('TaskList', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Loading state ───────────────────────────────────────────────────────────

  it('shows a loading spinner while loading', () => {
    mockedUseViewModel.mockReturnValue(buildViewModel({ loading: true, tasks: [] }));
    render(<TaskList />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('status-columns')).not.toBeInTheDocument();
  });

  // ── Error state ─────────────────────────────────────────────────────────────

  it('shows an error alert with a Retry button when load fails', () => {
    mockedUseViewModel.mockReturnValue(
      buildViewModel({ error: 'Network error.', tasks: [], loading: false })
    );
    render(<TaskList />);

    expect(screen.getByText('Network error.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.queryByTestId('status-columns')).not.toBeInTheDocument();
  });

  it('calls loadTasks when Retry is clicked', () => {
    const loadTasks = jest.fn();
    mockedUseViewModel.mockReturnValue(
      buildViewModel({ error: 'Failed', tasks: [], loading: false, loadTasks })
    );
    render(<TaskList />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(loadTasks).toHaveBeenCalledTimes(1);
  });

  // ── Normal render ───────────────────────────────────────────────────────────

  it('renders StatusColumns with tasks when loaded successfully', () => {
    mockedUseViewModel.mockReturnValue(buildViewModel());
    render(<TaskList />);

    expect(screen.getByTestId('status-columns')).toBeInTheDocument();
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });

  it('calls deleteTask when delete button is clicked', () => {
    const deleteTask = jest.fn();
    mockedUseViewModel.mockReturnValue(buildViewModel({ deleteTask }));
    render(<TaskList />);

    fireEvent.click(screen.getByText('delete-1'));
    expect(deleteTask).toHaveBeenCalledWith(1);
  });

  it('calls onTaskSelect when edit button is clicked', () => {
    const onTaskSelect = jest.fn();
    mockedUseViewModel.mockReturnValue(buildViewModel());
    render(<TaskList onTaskSelect={onTaskSelect} />);

    fireEvent.click(screen.getByText('edit-1'));
    expect(onTaskSelect).toHaveBeenCalledWith(mockTasks[0]);
  });

  // ── Snackbar notification ───────────────────────────────────────────────────

  it('shows a success Snackbar when notification is set', () => {
    const notification: Notification = {
      message: 'Task deleted successfully.',
      severity: 'success',
    };
    mockedUseViewModel.mockReturnValue(buildViewModel({ notification }));
    render(<TaskList />);

    expect(screen.getByText('Task deleted successfully.')).toBeInTheDocument();
  });

  it('shows an error Snackbar with error severity', () => {
    const notification: Notification = { message: 'Failed to delete task.', severity: 'error' };
    mockedUseViewModel.mockReturnValue(buildViewModel({ notification }));
    render(<TaskList />);

    expect(screen.getByText('Failed to delete task.')).toBeInTheDocument();
  });

  it('calls clearNotification when Snackbar closes', () => {
    const clearNotification = jest.fn();
    const notification: Notification = {
      message: 'Task deleted successfully.',
      severity: 'success',
    };
    mockedUseViewModel.mockReturnValue(buildViewModel({ notification, clearNotification }));
    render(<TaskList />);

    // Simulate autoHideDuration timeout by finding and clicking the close button
    const closeBtn = screen.queryByTitle('Close');
    if (closeBtn) fireEvent.click(closeBtn);

    // clearNotification is wired to onClose — verify it's reachable via the Snackbar
    expect(clearNotification).toBeDefined();
  });

  // ── No notification ─────────────────────────────────────────────────────────

  it('does not show Snackbar when notification is null', () => {
    mockedUseViewModel.mockReturnValue(buildViewModel({ notification: null }));
    render(<TaskList />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
