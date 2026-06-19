import React from 'react';
import { TextField } from '@mui/material';

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const TitleField: React.FC<TitleFieldProps> = ({ value, onChange }) => (
  <TextField
    label="Title"
    required
    fullWidth
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter task title"
    autoFocus
  />
);

export default TitleField;
