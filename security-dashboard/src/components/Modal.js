import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Modal = ({ show, onClose, alert }) => {
  const navigate = useNavigate();

  if (!show || !alert) {
    return null;
  }

  const handleViewGraph = () => {
    // Navigate to the network page with the specific alert ID
    navigate(`/network/${alert.id}`);
  };

  return (
    <Dialog open={show} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{alert.name} Details</DialogTitle>
      <DialogContent>
        <p><strong>ID:</strong> {alert.id}</p>
        <p><strong>Description:</strong> {alert.description}</p>
        <p><strong>Severity:</strong> {alert.severity}</p>
        <p><strong>Machine:</strong> {alert.machine}</p>
      </DialogContent>
      <DialogActions>
        {/* Close Button */}
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        {/* View Graph Button */}
        <Button onClick={handleViewGraph} color="primary" variant="contained">
          View Graph
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
