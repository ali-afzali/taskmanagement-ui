import { useState, useEffect, useCallback } from 'react';
import { TaskItem, TaskItemStatus, CreateTaskDto, UpdateTaskDto } from '../../types/TaskItem';
import { taskService } from '../../services/taskService';

export interface TaskFormViewModel {
  title: string;
  description: string;
  status: TaskItemStatus;
  loading: boolean;
  error: string | null;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setStatus: (value: TaskItemStatus) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useTaskFormViewModel(
  task: TaskItem | undefined,
  onSave: () => void
): TaskFormViewModel {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskItemStatus>(TaskItemStatus.NotStarted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (task) {
          const updateDto: UpdateTaskDto = { title, description, status };
          await taskService.updateTask(task.id, updateDto);
        } else {
          const createDto: CreateTaskDto = { title, description, status };
          await taskService.createTask(createDto);
        }

        onSave();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save task. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [title, description, status, task, onSave]
  );

  return {
    title,
    description,
    status,
    loading,
    error,
    setTitle,
    setDescription,
    setStatus,
    handleSubmit,
  };
}
