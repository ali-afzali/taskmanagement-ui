import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { TaskItemStatus } from '../../../types/TaskItem';

interface StatusFieldProps {
  value: TaskItemStatus;
  onChange: (value: TaskItemStatus) => void;
}

const StatusField: React.FC<StatusFieldProps> = ({ value, onChange }) => (
  <FormControl fullWidth>
    <InputLabel id="status-label">Status</InputLabel>
    <Select
      labelId="status-label"
      label="Status"
      value={value}
      onChange={e => onChange(Number(e.target.value) as TaskItemStatus)}
    >
      <MenuItem value={TaskItemStatus.NotStarted}>Not Started</MenuItem>
      <MenuItem value={TaskItemStatus.InProgress}>In Progress</MenuItem>
      <MenuItem value={TaskItemStatus.Completed}>Completed</MenuItem>
      <MenuItem value={TaskItemStatus.Cancelled}>Cancelled</MenuItem>
    </Select>
  </FormControl>
);

export default StatusField;
