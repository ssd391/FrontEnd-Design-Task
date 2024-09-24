import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const ProcessingPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(fetchFileStatuses, 5000); // Polling every 5 seconds
    return () => clearInterval(interval); // Clean up the interval on unmount

    // Initial fetch
    fetchFileStatuses();
  }, []);

  async function fetchFileStatuses() {
    try {
      // Simulating API call with dummy data
      const dummyData = [
        { filename: 'data1.csv', status: 'completed' },
        { filename: 'data2.csv', status: 'processing' },
        { filename: 'data3.csv', status: 'completed' },
        { filename: 'data4.csv', status: 'processing' },
      ];
      setFiles(dummyData);
    } catch (error) {
      console.error('Error fetching file statuses:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <IconButton onClick={() => navigate('/')} color="primary">
          <HomeIcon sx={{ color: 'black' }} />
        </IconButton>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        Processing Page
      </Typography>
      <Paper elevation={3} sx={{ borderRadius: '15px', overflow: 'hidden' }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: 'black' }} />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>File Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'black' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row" sx={{ color: 'black' }}>
                      {file.filename}
                    </TableCell>
                    <TableCell align="right">
                      {file.status === 'processing' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <HourglassEmptyIcon sx={{ mr: 1, color: 'orange' }} />
                          <Typography sx={{ color: 'orange' }}>Processing</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <CheckCircleIcon sx={{ mr: 1, color: 'green' }} />
                          <Typography sx={{ color: 'green' }}>Completed</Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ProcessingPage;