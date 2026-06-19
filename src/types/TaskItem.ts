export enum TaskItemStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: TaskItemStatus;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskItemStatus;
}

export interface UpdateTaskDto {
  title: string;
  description: string;
  status: TaskItemStatus;
}
