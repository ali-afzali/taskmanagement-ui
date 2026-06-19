import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { TaskItem } from '../../types/TaskItem';
import { useTaskFormViewModel } from './TaskFormViewModel';
import TitleField from './fields/TitleField';
import DescriptionField from './fields/DescriptionField';
import StatusField from './fields/StatusField';

interface TaskFormProps {
  task?: TaskItem;
  onSave: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onCancel }) => {
  const {
    title,
    description,
    status,
    loading,
    error,
    setTitle,
    setDescription,
    setStatus,
    handleSubmit,
  } = useTaskFormViewModel(task, onSave);

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onCancel}>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TitleField value={title} onChange={setTitle} />

          <DescriptionField value={description} onChange={setDescription} />

          <StatusField value={status} onChange={setStatus} />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TaskForm;
