import { TaskItemStatus } from "./TaskItem";

export interface ColumnConfig {
  status: TaskItemStatus;
  label: string;
  color: string;
  chipColor: 'default' | 'info' | 'success' | 'error';
}
