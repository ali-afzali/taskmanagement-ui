import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from './TaskList';
import { useTaskListViewModel } from './TaskListViewModel';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';

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

// ── Mock dnd-kit ─────────────────────────────────────────────────────────────
let capturedHandlers: Record<string, Function> = {};

jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: any) => {
    capturedHandlers = { onDragStart, onDragOver, onDragEnd };
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
  { id: 1, title: 'Task One', description: 'Desc one', status: TaskItemStatus.NotStarted, createdDate: '2024-01-01' },
  { id: 2, title: 'Task Two', description: 'Desc two', status: TaskItemStatus.InProgress, createdDate: '2024-01-02' },
];

const defaultViewModel = {
  tasks: mockTasks,
  loading: false,
  error: null,
  loadTasks: jest.fn(),
  removeTask: jest.fn(),
  handleStatusChange: jest.fn(),
};

function renderTaskList(props = {}) {
  return render(<TaskList {...props} />);
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedHandlers = {};
    mockedUseViewModel.mockReturnValue(defaultViewModel);
  });

  describe('loading state', () => {
    it('shows a loading spinner when loading', () => {
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, loading: true, tasks: [] });
      renderTaskList();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render columns while loading', () => {
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, loading: true, tasks: [] });
      renderTaskList();
      expect(screen.queryByTestId('status-columns')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error alert when error is set', () => {
      mockedUseViewModel.mockReturnValue({
        ...defaultViewModel,
        loading: false,
        error: 'Failed to load tasks. Please try again later.',
      });
      renderTaskList();
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tasks. Please try again later.')).toBeInTheDocument();
    });

    it('shows a Retry button in the error state', () => {
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, loading: false, error: 'Error' });
      renderTaskList();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls loadTasks when Retry is clicked', () => {
      const loadTasks = jest.fn();
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, loading: false, error: 'Error', loadTasks });
      renderTaskList();
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(loadTasks).toHaveBeenCalledTimes(1);
    });

    it('does not render columns in error state', () => {
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, loading: false, error: 'Error' });
      renderTaskList();
      expect(screen.queryByTestId('status-columns')).not.toBeInTheDocument();
    });
  });

  describe('loaded state', () => {
    it('renders StatusColumns with tasks', () => {
      renderTaskList();
      expect(screen.getByTestId('status-columns')).toBeInTheDocument();
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
    });

    it('calls removeTask when a task is deleted', () => {
      const removeTask = jest.fn();
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, removeTask });
      renderTaskList();
      fireEvent.click(screen.getByRole('button', { name: 'delete-1' }));
      expect(removeTask).toHaveBeenCalledWith(1);
    });

    it('calls onTaskSelect when a task is edited', () => {
      const onTaskSelect = jest.fn();
      renderTaskList({ onTaskSelect });
      fireEvent.click(screen.getByRole('button', { name: 'edit-1' }));
      expect(onTaskSelect).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('renders an empty drag overlay when no drag is active', () => {
      renderTaskList();
      const overlay = screen.getByTestId('drag-overlay');
      expect(overlay).toBeInTheDocument();
      expect(screen.queryByTestId('drag-overlay-card')).not.toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('shows TaskCard in DragOverlay when dragging starts', () => {
      const { rerender } = render(<TaskList />);
      act(() => {
        capturedHandlers.onDragStart({ active: { id: 1 } });
      });
      rerender(<TaskList />);
      expect(screen.getAllByTestId('drag-overlay-card').length).toBeGreaterThan(0);
    });

    it('calls handleStatusChange on drag end when over a different column', () => {
      const handleStatusChange = jest.fn();
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, handleStatusChange });
      renderTaskList();
      act(() => {
        capturedHandlers.onDragEnd({ active: { id: 1 }, over: { id: TaskItemStatus.Completed } });
      });
      expect(handleStatusChange).toHaveBeenCalledWith(1, TaskItemStatus.Completed);
    });

    it('does not call handleStatusChange when dropped on the same id', () => {
      const handleStatusChange = jest.fn();
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, handleStatusChange });
      renderTaskList();
      act(() => {
        capturedHandlers.onDragEnd({ active: { id: 1 }, over: { id: 1 } });
      });
      expect(handleStatusChange).not.toHaveBeenCalled();
    });

    it('does not call handleStatusChange when dropped outside any column', () => {
      const handleStatusChange = jest.fn();
      mockedUseViewModel.mockReturnValue({ ...defaultViewModel, handleStatusChange });
      renderTaskList();
      act(() => {
        capturedHandlers.onDragEnd({ active: { id: 1 }, over: null });
      });
      expect(handleStatusChange).not.toHaveBeenCalled();
    });
  });
});
