import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Input,
  IconButton,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HomeIcon from '@mui/icons-material/Home';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        navigate('/processing');
      } else {
        const data = await response.json();
        if (data.error === 'This file has already been uploaded. Please try a different file.') {
          setErrorMessage(data.error);
        } else {
          setErrorMessage('Error uploading file.');
        }
      }
    } catch (error) {
      setErrorMessage('Error uploading file.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton onClick={() => navigate('/')} color="primary">
          <HomeIcon />
        </IconButton>
      </Box>
      <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload CSV
        </Typography>
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ 
              bgcolor: 'black', 
              color: 'white',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            Select File
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          {file && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file}
          sx={{ 
            bgcolor: 'black', 
            color: 'white',
            borderRadius: '8px',
            '&:hover': {
              bgcolor: '#333'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              color: '#666'
            }
          }}
        >
          Upload
        </Button>
      </Paper>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        message={errorMessage}
      />
    </Container>
  );
};

export default UploadPage;