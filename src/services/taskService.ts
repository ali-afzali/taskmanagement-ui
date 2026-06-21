import { TaskItem, CreateTaskDto, UpdateTaskDto } from '../types/TaskItem';
import { apiClient } from './apiClient';
import { ApiError } from './apiError';
import { getAuthUserId } from '../utils/storage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://localhost:7217';

function currentUserId(): number {
  return getAuthUserId() ?? 0;
}

function handleResponse(response: Response, defaultMessage: string): void {
  if (response.ok) return;
  switch (response.status) {
    case 401:
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    case 403:
      throw new ApiError(403, "You don't have permission to perform this action.");
    case 404:
      throw new ApiError(404, 'The requested task was not found.');
    case 500:
    case 502:
    case 503:
      throw new ApiError(response.status, 'Server error. Please try again later.');
    default:
      throw new ApiError(response.status, defaultMessage);
  }
}

export const taskService = {
  async getTasks(): Promise<TaskItem[]> {
    let response: Response;
    try {
      response = await apiClient.get(`${API_BASE_URL}/Tasks`);
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
    handleResponse(response, 'Failed to fetch tasks.');
    return response.json();
  },

  async getTask(id: number): Promise<TaskItem> {
    let response: Response;
    try {
      response = await apiClient.get(`${API_BASE_URL}/Tasks/${id}`);
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
    handleResponse(response, 'Failed to fetch task.');
    return response.json();
  },

  async createTask(task: CreateTaskDto): Promise<TaskItem> {
    const payload: CreateTaskDto = {
      ...task,
      createdByUserId: currentUserId(),
      assigneeUserId: task.assigneeUserId || currentUserId(),
    };
    let response: Response;
    try {
      response = await apiClient.post(`${API_BASE_URL}/Tasks`, payload);
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
    handleResponse(response, 'Failed to create task.');
    return response.json();
  },

  async updateTask(id: number, task: UpdateTaskDto): Promise<TaskItem> {
    const payload: UpdateTaskDto = {
      ...task,
      updatedByUserId: currentUserId(),
      assigneeUserId: task.assigneeUserId || currentUserId(),
    };
    let response: Response;
    try {
      response = await apiClient.put(`${API_BASE_URL}/Tasks/${id}`, payload);
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
    handleResponse(response, 'Failed to update task.');
    return response.json();
  },

  async deleteTask(id: number): Promise<void> {
    let response: Response;
    try {
      response = await apiClient.delete(`${API_BASE_URL}/Tasks/${id}`);
    } catch {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }
    handleResponse(response, 'Failed to delete task.');
  },
};
