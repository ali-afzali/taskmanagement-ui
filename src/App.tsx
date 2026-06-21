import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './components/app-header/AppHeader';
import TaskList from './components/task-list/TaskList';
import TaskForm from './components/task-form/TaskForm';
import LoginPage from './components/login/LoginPage';
import { authenticationService } from './services/authenticationService';
import {
  getAuthToken,
  removeAuthToken,
  getAuthUsername,
  removeAuthUsername,
  removeAuthUserId,
} from './utils/storage';
import { TaskItem } from './types/TaskItem';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [username, setUsername] = useState(() => getAuthUsername() ?? '');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUsername(getAuthUsername() ?? '');
  };

  const handleLogout = async () => {
    await authenticationService.logout();
    removeAuthToken();
    removeAuthUsername();
    removeAuthUserId();
    setIsAuthenticated(false);
    setUsername('');
  };

  const handleTaskSelect = (task: TaskItem) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedTask(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedTask(undefined);
  };

  const handleNewTask = () => {
    setSelectedTask(undefined);
    setShowForm(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <CssBaseline />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <AppHeader onNewTask={handleNewTask} onLogout={handleLogout} username={username} />

      <Box component="main" sx={{ p: 3 }}>
        <TaskList key={refreshKey} onTaskSelect={handleTaskSelect} />
      </Box>

      {showForm && <TaskForm task={selectedTask} onSave={handleSave} onCancel={handleCancel} />}
    </>
  );
}

export default App;
