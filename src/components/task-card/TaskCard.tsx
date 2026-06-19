import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from '../../types/TaskItem';
import { useTaskCardViewModel } from './TaskCardViewModel';

export interface TaskCardProps {
  task: TaskItem;
  onEdit?: (task: TaskItem) => void;
  onDeleted: (id: number) => void;
  overlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDeleted, overlay }) => {
  const { handleDelete } = useTaskCardViewModel(task, onDeleted);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{ borderRadius: 2, userSelect: 'none' }}
    >
      <CardContent sx={{ pb: 0, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <DragIndicatorIcon
          {...listeners}
          {...attributes}
          sx={{ color: 'text.disabled', mt: 0.3, cursor: overlay ? 'grabbing' : 'grab', flexShrink: 0 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} gutterBottom>
            {task.title}
          </Typography>
          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
            {new Date(task.createdDate).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
        {onEdit && (
          <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(task)}>
            Edit
          </Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default TaskCard;
