import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  Link,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#ffffff'
    }
  }
});

const LoginPage = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Traditional login function
  const handleLogin = (event) => {
    event.preventDefault();

    fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setAuth(true);
          localStorage.setItem('username', data.username);
          localStorage.setItem('auth', 'true');
          navigate('/');
        } else {
          setError('Invalid username or password');
        }
      });
  };

  // Google Sign-In success handler
  const handleGoogleSuccess = (response) => {
    const token = response.credential;

    // Send token to the backend for validation
    fetch('http://127.0.0.1:5000/api/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAuth(true);
          console.log(data);
          localStorage.setItem('username', data.username);
          localStorage.setItem('auth', 'true');
          navigate('/');
        } else {
          setError('Google Sign-In failed.');
        }
      });
  };

  // Google Sign-In failure handler
  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Error:', error);
    setError('Google Sign-In failed.');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 3, mt: 8 }}>
          <Typography component="h1" variant="h5" align="center">
            Login
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link href="/create-user" variant="body2">
                {"Don't have an account? Create one"}
              </Link>
            </Box>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography align="center">Or Sign In with Google</Typography>
            <GoogleLogin onSuccess={handleGoogleSuccess} onFailure={handleGoogleFailure} />
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;