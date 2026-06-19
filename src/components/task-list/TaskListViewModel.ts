import { useState, useEffect, useCallback } from 'react';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';
import { taskService } from '../../services/taskService';

export interface TaskListViewModel {
  tasks: TaskItem[];
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  removeTask: (id: number) => void;
  handleStatusChange: (id: number, newStatus: TaskItemStatus) => Promise<void>;
}

export function useTaskListViewModel(): TaskListViewModel {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const removeTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleStatusChange = useCallback(async (id: number, newStatus: TaskItemStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      await taskService.updateTask(id, { title: task.title, description: task.description, status: newStatus });
    } catch (err) {
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
      console.error(err);
    }
  }, [tasks]);

  return { tasks, loading, error, loadTasks, removeTask, handleStatusChange };
}
