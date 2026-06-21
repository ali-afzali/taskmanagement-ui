import { useCallback } from 'react';
import { TaskItem } from '../../types/TaskItem';

export interface TaskCardViewModel {
  handleDelete: () => void;
}

export function useTaskCardViewModel(
  task: TaskItem,
  onDeleted: (id: number) => void
): TaskCardViewModel {
  const handleDelete = useCallback(() => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    onDeleted(task.id);
  }, [task.id, task.title, onDeleted]);

  return { handleDelete };
}
