export enum TaskItemStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskItemStatus;
  createdDate: string;
  updatedDate?: string;
  assigneeUserId: number;
  createdByUserId: number;
  updatedByUserId?: number;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskItemStatus;
  assigneeUserId?: number;
  createdByUserId?: number;
}

export interface UpdateTaskDto {
  title: string;
  description: string;
  status: TaskItemStatus;
  assigneeUserId?: number;
  updatedByUserId?: number;
}
