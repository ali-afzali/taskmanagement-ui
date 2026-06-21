import type { FormEvent } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTaskFormViewModel } from './TaskFormViewModel';
import { taskService } from '../../services/taskService';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';

jest.mock('../../services/taskService');
const mockedTaskService = taskService as jest.Mocked<typeof taskService>;

const existingTask: TaskItem = {
  id: 5,
  title: 'Existing Task',
  description: 'Some description',
  status: TaskItemStatus.InProgress,
  createdDate: '2024-01-01',
  assigneeUserId: 1,
  createdByUserId: 1,
};

const fakeEvent = { preventDefault: jest.fn() } as unknown as FormEvent;

describe('useTaskFormViewModel', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Initial state ───────────────────────────────────────────────────────────

  it('starts with empty fields and no error when no task is provided', () => {
    const { result } = renderHook(() => useTaskFormViewModel(undefined, jest.fn()));

    expect(result.current.title).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.status).toBe(TaskItemStatus.NotStarted);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('pre-populates fields when an existing task is provided', () => {
    const { result } = renderHook(() => useTaskFormViewModel(existingTask, jest.fn()));

    expect(result.current.title).toBe('Existing Task');
    expect(result.current.description).toBe('Some description');
    expect(result.current.status).toBe(TaskItemStatus.InProgress);
  });

  // ── Field setters ───────────────────────────────────────────────────────────

  it('updates description via setDescription', () => {
    const { result } = renderHook(() => useTaskFormViewModel(undefined, jest.fn()));

    act(() => {
      result.current.setDescription('My description');
    });

    expect(result.current.description).toBe('My description');
  });

  it('updates status via setStatus', () => {
    const { result } = renderHook(() => useTaskFormViewModel(undefined, jest.fn()));

    act(() => {
      result.current.setStatus(TaskItemStatus.Completed);
    });

    expect(result.current.status).toBe(TaskItemStatus.Completed);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('sets error and does not call service when title is empty', async () => {
    mockedTaskService.createTask.mockResolvedValue({} as TaskItem);
    const { result } = renderHook(() => useTaskFormViewModel(undefined, jest.fn()));

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Title is required');
    expect(mockedTaskService.createTask).not.toHaveBeenCalled();
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  it('calls createTask with the form values and invokes onSave on success', async () => {
    mockedTaskService.createTask.mockResolvedValue({} as TaskItem);
    const onSave = jest.fn();
    const { result } = renderHook(() => useTaskFormViewModel(undefined, onSave));

    act(() => {
      result.current.setTitle('New Task');
      result.current.setDescription('A description');
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockedTaskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Task', description: 'A description' })
    );
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  it('calls updateTask with the task id and form values and invokes onSave on success', async () => {
    mockedTaskService.updateTask.mockResolvedValue({} as TaskItem);
    const onSave = jest.fn();
    const { result } = renderHook(() => useTaskFormViewModel(existingTask, onSave));

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockedTaskService.updateTask).toHaveBeenCalledWith(
      existingTask.id,
      expect.objectContaining({ title: 'Existing Task' })
    );
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it('sets error message and clears loading when save fails', async () => {
    mockedTaskService.createTask.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useTaskFormViewModel(undefined, jest.fn()));

    act(() => {
      result.current.setTitle('Task Title');
    });

    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });
});
