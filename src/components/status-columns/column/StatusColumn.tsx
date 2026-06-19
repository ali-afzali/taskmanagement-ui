import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { TaskItem, TaskItemStatus } from '../../../types/TaskItem';
import TaskCard from '../../task-card/TaskCard';
export interface StatusColumnProps {
  status: TaskItemStatus;
  label: string;
  color: string;
  chipColor: 'default' | 'info' | 'success' | 'error';
  tasks: TaskItem[];
  onEdit?: (task: TaskItem) => void;
  onDeleted: (id: number) => void;
  isOver: boolean;
}

const StatusColumn: React.FC<StatusColumnProps> = ({
  status,
  label,
  color,
  chipColor,
  tasks,
  onEdit,
  onDeleted,
  isOver,
}) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <Paper
      ref={setNodeRef}
      elevation={isOver ? 4 : 2}
      sx={{
        bgcolor: color,
        outline: isOver ? '2px dashed' : 'none',
        outlineColor: 'primary.main',
        borderRadius: 2,
        p: 1.5,
        minHeight: 400,
        transition: 'outline 0.15s, box-shadow 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        <Chip label={tasks.length} size="small" color={chipColor} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No tasks
          </Typography>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDeleted={onDeleted} />
          ))
        )}
      </Box>
    </Paper>
  );
};

export default StatusColumn;
