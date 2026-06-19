import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskListViewModel } from './TaskListViewModel';
import { taskService } from '../../services/taskService';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';

jest.mock('../../services/taskService');

const mockedTaskService = taskService as jest.Mocked<typeof taskService>;

const mockTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Task One',
    description: 'Description one',
    status: TaskItemStatus.NotStarted,
    createdDate: '2024-01-01',
  },
  {
    id: 2,
    title: 'Task Two',
    description: 'Description two',
    status: TaskItemStatus.InProgress,
    createdDate: '2024-01-02',
  },
];

describe('useTaskListViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading state and empty tasks', async () => {
    mockedTaskService.getTasks.mockResolvedValue([]);

    const { result } = renderHook(() => useTaskListViewModel());

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('loads tasks successfully on mount', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('sets error when loadTasks fails', async () => {
    mockedTaskService.getTasks.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load tasks. Please try again later.');
    expect(result.current.tasks).toEqual([]);
  });

  it('reloads tasks when loadTasks is called manually', async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce([]).mockResolvedValueOnce(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([]);

    await act(async () => {
      await result.current.loadTasks();
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.error).toBeNull();
  });

  it('removeTask removes the task with the given id', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.removeTask(1);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe(2);
  });

  it('removeTask does nothing when id does not exist', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.removeTask(999);
    });

    expect(result.current.tasks).toHaveLength(2);
  });

  it('handleStatusChange updates task status optimistically', async () => {
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

    const updatedTask = result.current.tasks.find(t => t.id === 1);
    expect(updatedTask?.status).toBe(TaskItemStatus.InProgress);
    expect(mockedTaskService.updateTask).toHaveBeenCalledWith(1, {
      title: 'Task One',
      description: 'Description one',
      status: TaskItemStatus.InProgress,
    });
  });

  it('handleStatusChange reverts status on updateTask failure', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);
    mockedTaskService.updateTask.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(1, TaskItemStatus.Completed);
    });

    const task = result.current.tasks.find(t => t.id === 1);
    expect(task?.status).toBe(TaskItemStatus.NotStarted);
  });

  it('handleStatusChange does nothing when status is unchanged', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(1, TaskItemStatus.NotStarted);
    });

    expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
  });

  it('handleStatusChange does nothing when task id does not exist', async () => {
    mockedTaskService.getTasks.mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTaskListViewModel());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleStatusChange(999, TaskItemStatus.Completed);
    });

    expect(mockedTaskService.updateTask).not.toHaveBeenCalled();
    expect(result.current.tasks).toEqual(mockTasks);
  });
});
