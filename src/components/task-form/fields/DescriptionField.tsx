import React from 'react';
import { TextField } from '@mui/material';

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({ value, onChange }) => (
  <TextField
    label="Description"
    fullWidth
    multiline
    rows={4}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter task description"
  />
);

export default DescriptionField;
