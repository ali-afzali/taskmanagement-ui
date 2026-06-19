import React from 'react';
import { TaskItem, TaskItemStatus } from '../../../types/TaskItem';
import StatusColumn from './StatusColumn';
import { ColumnConfig } from '../../../types/ColumnConfig';

export interface ColumnsProps {
  tasks: TaskItem[];
  overId: TaskItemStatus | null;
  onEdit?: (task: TaskItem) => void;
  onDeleted: (id: number) => void;
}

const COLUMNS: ColumnConfig[] = [
  { status: TaskItemStatus.NotStarted, label: 'Not Started', color: '#f5f5f5', chipColor: 'default' },
  { status: TaskItemStatus.InProgress, label: 'In Progress', color: '#e3f2fd', chipColor: 'info' },
  { status: TaskItemStatus.Completed,  label: 'Completed',   color: '#e8f5e9', chipColor: 'success' },
  { status: TaskItemStatus.Cancelled,  label: 'Cancelled',   color: '#fce4ec', chipColor: 'error' },
];


const StatusColumns: React.FC<ColumnsProps> = ({ tasks, overId, onEdit, onDeleted }) => (
  <>
    {COLUMNS.map(({ status, label, color, chipColor }) => (
      <StatusColumn
        key={status}
        status={status}
        label={label}
        color={color}
        chipColor={chipColor}
        tasks={tasks.filter(t => t.status === status)}
        onEdit={onEdit}
        onDeleted={onDeleted}
        isOver={overId === status}
      />
    ))}
  </>
);

export default StatusColumns;
