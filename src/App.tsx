import { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import AppHeader from './components/app-header/AppHeader';
import TaskList from './components/task-list/TaskList';
import TaskForm from './components/task-form/TaskForm';
import { TaskItem } from './types/TaskItem';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <>
      <CssBaseline />
      <AppHeader onNewTask={handleNewTask} />

      <Box component="main" sx={{ p: 3 }}>
        <TaskList key={refreshKey} onTaskSelect={handleTaskSelect} />
      </Box>

      {showForm && (
        <TaskForm
          task={selectedTask}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

export default App;
