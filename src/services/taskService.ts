import { TaskItem, CreateTaskDto, UpdateTaskDto } from '../types/TaskItem';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://localhost:7217';

export const taskService = {
  async getTasks(): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/Tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    return response.json();
  },

  async getTask(id: number): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/Tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    return response.json();
  },

  async createTask(task: CreateTaskDto): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/Tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    return response.json();
  },

  async updateTask(id: number, task: UpdateTaskDto): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/Tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return response.json();
  },

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },
};
