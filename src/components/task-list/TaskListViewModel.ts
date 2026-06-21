import { useState, useEffect, useCallback } from 'react';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';
import { taskService } from '../../services/taskService';

export interface Notification {
  message: string;
  severity: 'error' | 'warning' | 'success';
}

export interface TaskListViewModel {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  notification: Notification | null;
  loadTasks: () => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearNotification: () => void;
  handleStatusChange: (id: number, newStatus: TaskItemStatus) => Promise<void>;
}

export function useTaskListViewModel(): TaskListViewModel {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const clearNotification = useCallback(() => setNotification(null), []);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const deleteTask = useCallback(
    async (id: number) => {
      const snapshot = tasks;
      setTasks(prev => prev.filter(t => t.id !== id));
      try {
        await taskService.deleteTask(id);
        setNotification({ message: 'Task deleted successfully.', severity: 'success' });
      } catch (err) {
        setTasks(snapshot);
        setNotification({
          message: err instanceof Error ? err.message : 'Failed to delete task.',
          severity: 'error',
        });
      }
    },
    [tasks]
  );

  const handleStatusChange = useCallback(
    async (id: number, newStatus: TaskItemStatus) => {
      const task = tasks.find(t => t.id === id);
      if (!task || task.status === newStatus) return;

      setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));

      try {
        await taskService.updateTask(id, {
          title: task.title,
          description: task.description,
          status: newStatus,
        });
      } catch (err) {
        setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: task.status } : t)));
        setNotification({
          message: err instanceof Error ? err.message : 'Failed to update task status.',
          severity: 'error',
        });
      }
    },
    [tasks]
  );

  return {
    tasks,
    loading,
    error,
    notification,
    loadTasks,
    deleteTask,
    clearNotification,
    handleStatusChange,
  };
}
