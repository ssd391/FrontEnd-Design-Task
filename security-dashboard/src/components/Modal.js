import React from 'react';
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a theme with Nunito as the font
const theme = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
});

const Modal = ({ show, onClose, alert }) => {
  const navigate = useNavigate();

  if (!show || !alert) {
    return null;
  }

  const handleViewGraph = () => {
    navigate(`/network/${alert.id}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={show}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 5, // Add rounded edges
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontFamily: 'Nunito, sans-serif', fontWeight: 'bold' }}>
            {alert.name} Details
          </Typography>
          {/* Close Button as Icon in Top Right */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              backgroundColor: 'black',
              color: 'white',
              borderRadius: '50%',
              p: 0.5,
              '&:hover': { backgroundColor: '#333' }, // Darker hover state
              '&:active': { backgroundColor: '#111' }, // Darkest active state
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>ID:</strong> {alert.id}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>Description:</strong> {alert.description}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>Severity:</strong> {alert.severity}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>Machine:</strong> {alert.machine}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>Occurred On:</strong> {alert.occured_on}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Nunito, sans-serif' }}>
            <strong>Program:</strong> {alert.program}
          </Typography>
        </DialogContent>
        <DialogActions>
          {/* View Graph Button */}
          <Button
            onClick={handleViewGraph}
            variant="contained"
            sx={{
              backgroundColor: 'black',
              color: 'white',
              borderRadius: 3, // Optional rounded corners for the button
              '&:hover': {
                backgroundColor: '#333', // Darker background on hover
              },
            }}
          >
            View Graph
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Modal;
