import { useCallback } from 'react';
import { TaskItem } from '../../types/TaskItem';
import { taskService } from '../../services/taskService';

export interface TaskCardViewModel {
  handleDelete: () => Promise<void>;
}

export function useTaskCardViewModel(
  task: TaskItem,
  onDeleted: (id: number) => void
): TaskCardViewModel {
  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(task.id);
      onDeleted(task.id);
    } catch (err) {
      alert('Failed to delete task');
      console.error(err);
    }
  }, [task.id, onDeleted]);

  return { handleDelete };
}
