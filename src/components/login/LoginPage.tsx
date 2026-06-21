import React from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useLoginViewModel } from './LoginViewModel';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { username, password, loading, error, errorType, setUsername, setPassword, handleSubmit } =
    useLoginViewModel(onLoginSuccess);

  const alertSeverity = errorType === 'network' ? 'warning' : 'error';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
          Task Management
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {error && (
            <Alert
              severity={alertSeverity}
              icon={errorType === 'network' ? <WifiOffIcon fontSize="inherit" /> : undefined}
            >
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
            autoFocus
            fullWidth
            error={errorType === 'auth'}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            fullWidth
            error={errorType === 'auth'}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            fullWidth
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
