import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField,
  Button, MenuItem, Select, InputLabel, FormControl, Box, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  LocationOn, DateRange, Category, Groups, Description as DescriptionIcon,
  Add, Edit, CheckCircle
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SiteDialog = ({
  open,
  onClose,
  isEditing,
  form,
  handleChange,
  handleSubmit,
  setForm,
  natureOptions,
  statusOptions,
  statusColors,
  loading,
  duplicateDialogOpen,
  setDuplicateDialogOpen,
  duplicateMessage,
}) => {
  const theme = useTheme();

  const handleFormSubmit = async () => {
    try {
      await handleSubmit();
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.toLowerCase().includes('already exists')
      ) {
        setDuplicateDialogOpen(true);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Site' : 'Create New Site'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            {/* Site Name and Location */}
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <TextField
                label="Site Name"
                name="siteName"
                value={form.siteName}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Stack>

            {/* Dates */}
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <DatePicker
                label="Start Date"
                value={form.startDate}
                onChange={(date) => setForm({ ...form, startDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(date) => setForm({ ...form, endDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }
                }}
              />
            </Stack>

            {/* Nature and Group */}
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <FormControl fullWidth>
                <InputLabel>Nature</InputLabel>
                <Select
                  name="nature"
                  value={form.nature}
                  onChange={handleChange}
                  label="Nature"
                >
                  {natureOptions.map((nature) => (
                    <MenuItem key={nature} value={nature}>
                      <Category sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                      {nature}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Project Group"
                name="projectGroup"
                value={form.projectGroup}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Groups sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Stack>

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={form.status}
                onChange={handleChange}
                label="Status"
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle
                        sx={{
                          mr: 1,
                          fontSize: '1rem',
                          color: theme.palette[statusColors[status]]?.main || 'grey'
                        }}
                      />
                      {status}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              InputProps={{
                startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            startIcon={isEditing ? <Edit /> : <Add />}
            disabled={loading}
          >
            {isEditing ? 'Update Site' : 'Create Site'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog
        open={duplicateDialogOpen}
        onClose={() => setDuplicateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Duplicate Site Name</DialogTitle>
        <DialogContent>
          <Typography color="error">{duplicateMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SiteDialog;