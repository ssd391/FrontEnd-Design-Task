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
  // const handleGoogleSuccess = (response) => {
  //   const token = response.credential;

  //   // Send token to the backend for validation
  //   fetch('http://127.0.0.1:5000/api/google-login', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ token }),
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       if (data.success) {
  //         setAuth(true);
  //         console.log(data);
  //         localStorage.setItem('username', data.username);
  //         localStorage.setItem('auth', 'true');
  //         navigate('/');
  //       } else {
  //         setError('Google Sign-In failed.');
  //       }
  //     });
  // };

  // // Google Sign-In failure handler
  // const handleGoogleFailure = (error) => {
  //   console.error('Google Sign-In Error:', error);
  //   setError('Google Sign-In failed.');
  // };

  return (
    <div className="login-page">
      <div className="signup-container">
        <h1 className="title">Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>

        <p className="small-text">Don't have an account? <a href="/create-user">Create one</a></p>

        <div className="google-login">
          <h2>Or Sign In with Google</h2>
          {/* <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onFailure={handleGoogleFailure}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;