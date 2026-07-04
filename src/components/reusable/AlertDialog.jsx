import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import {
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber
} from '@mui/icons-material';

const iconMap = {
  success: <CheckCircleOutline sx={{ color: 'green', fontSize: 40 }} />,
  error: <ErrorOutline sx={{ color: 'red', fontSize: 40 }} />,
  warning: <WarningAmber sx={{ color: 'orange', fontSize: 40 }} />,
};

const AlertDialog = ({
  open,
  onClose,
  type = 'success', // 'success' | 'error' | 'warning'
  title,
  message,
  confirmText = 'OK',
  onConfirm,
  hideCancel = true,
  cancelText = 'Cancel'
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {iconMap[type]}
          <Typography variant="h6">
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        {!hideCancel && (
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={onConfirm || onClose}
          color={type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
