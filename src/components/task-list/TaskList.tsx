import React from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskItem, TaskItemStatus } from '../../types/TaskItem';
import { useTaskListViewModel } from './TaskListViewModel';
import TaskCard from '../task-card/TaskCard';
import StatusColumns from '../status-columns/column/StatusColumns';

interface TaskListProps {
  onTaskSelect?: (task: TaskItem) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onTaskSelect }) => {
  const { tasks, loading, error, loadTasks, removeTask, handleStatusChange } =
    useTaskListViewModel();
  const [activeTask, setActiveTask] = React.useState<TaskItem | null>(null);
  const [overId, setOverId] = React.useState<TaskItemStatus | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadTasks}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? (event.over.id as TaskItemStatus) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);
    if (over && active.id !== over.id) {
      handleStatusChange(active.id as number, over.id as TaskItemStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <StatusColumns tasks={tasks} overId={overId} onEdit={onTaskSelect} onDeleted={removeTask} />
      </Box>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onDeleted={removeTask} overlay />}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskList;
