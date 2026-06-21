import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskListViewModel } from './TaskListViewModel';
import { taskService } from '../../services/taskService';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';
import { ApiError } from '../../services/apiError';

jest.mock('../../services/taskService');
const mockedTaskService = taskService as jest.Mocked<typeof taskService>;

const mockTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Task One',
    description: 'Desc one',
    status: TaskItemStatus.NotStarted,
    createdDate: '2024-01-01',
    assigneeUserId: 1,
    createdByUserId: 1,
  },
  {
    id: 2,
    title: 'Task Two',
    description: 'Desc two',
    status: TaskItemStatus.InProgress,
    createdDate: '2024-01-02',
    assigneeUserId: 1,
    createdByUserId: 1,
  },
];

describe('useTaskListViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Initial load ────────────────────────────────────────────────────────────

  it('starts with loading=true and empty tasks', () => {
    mockedTaskService.getTasks.mockResolvedValue([]);
    const { result } = renderHook(() => useTaskListViewModel());

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads tasks successfully and sets loading=false', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('sets error message when loadTasks fails', async () => {
    mockedTaskService.getTasks.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.tasks).toEqual([]);
  });

  it('uses ApiError message when loadTasks throws ApiError', async () => {
    mockedTaskService.getTasks.mockRejectedValue(
      new ApiError(401, 'Your session has expired. Please log in again.')
    );
    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Your session has expired. Please log in again.');
  });

  // ── deleteTask ──────────────────────────────────────────────────────────────

  it('removes task optimistically and shows success notification on delete', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.deleteTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks.find(t => t.id === 1)).toBeUndefined();
    expect(result.current.notification).toEqual({
      message: 'Task deleted successfully.',
      severity: 'success',
    });
  });

  it('reverts task list and shows error notification when delete fails', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.deleteTask.mockRejectedValue(new Error('Failed to delete task.'));

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks.find(t => t.id === 1)).toBeDefined();
    expect(result.current.notification).toEqual({
      message: 'Failed to delete task.',
      severity: 'error',
    });
  });

  // ── clearNotification ───────────────────────────────────────────────────────

  it('clearNotification sets notification to null', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.deleteTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(1);
    });
    expect(result.current.notification).not.toBeNull();

    act(() => {
      result.current.clearNotification();
    });
    expect(result.current.notification).toBeNull();
  });

  // ── handleStatusChange ──────────────────────────────────────────────────────

  it('updates task status optimistically on successful status change', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.updateTask.mockResolvedValue({
      ...mockTasks[0],
      status: TaskItemStatus.InProgress,
    });

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(1, TaskItemStatus.InProgress);
    });

    expect(result.current.tasks.find(t => t.id === 1)?.status).toBe(TaskItemStatus.InProgress);
    expect(result.current.notification).toBeNull();
  });

  it('does nothing when status change is to the same status', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(1, TaskItemStatus.NotStarted);
    });

    expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
  });

  it('reverts status and shows error notification when status change fails', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.updateTask.mockRejectedValue(new Error('Server error.'));

    const { result } = renderHook(() => useTaskListViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(1, TaskItemStatus.Completed);
    });

    expect(result.current.tasks.find(t => t.id === 1)?.status).toBe(TaskItemStatus.NotStarted);
    expect(result.current.notification?.severity).toBe('error');
    expect(result.current.notification?.message).toBe('Server error.');
  });
});
