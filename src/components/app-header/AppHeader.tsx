import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AppHeaderProps {
  onNewTask: () => void;
}

function AppHeader({ onNewTask }: AppHeaderProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Task Management
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onNewTask}
        >
          New Task
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
