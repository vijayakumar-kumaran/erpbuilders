import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  MenuItem,
  InputLabel,
  FormControl,
  Select
} from '@mui/material';

const SourceDialog = ({
  open,
  onClose,
  isEditing,
  form,
  statusOptions,
  onChange,
  onSubmit,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Source' : 'Create New Source'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} mt={1}>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
            <TextField
              label="Source Name"
              name="sourceName"
              value={form.sourceName}
              onChange={onChange}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={onChange}
                label="Status"
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={onChange}
            multiline
            rows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={loading}
        >
          {isEditing ? 'Update Source' : 'Create Source'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SourceDialog;