import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

interface ApiLimitDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const ApiLimitDialog: React.FC<ApiLimitDialogProps> = ({ open, onClose, message }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>API Limit Reached</DialogTitle>
      <DialogContent>{'Too many requests to the stock API. Please try again later.'}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiLimitDialog;