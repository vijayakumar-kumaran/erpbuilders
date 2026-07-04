import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Divider,
    LinearProgress,
    IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Close, Edit, Add } from '@mui/icons-material';

const roleOptions = [
    'Admin', 'Site Engineer', 'Site Manager',
    'Operation Head', 'Marketing Head', 'Project Manager', 'Purchase Manager',
    'Finance Manager', 'Engineering Head', 'HR', 'Accountant', 'Buyer', 'Store keeper'
];

const statusOptions = ['Active', 'Inactive', 'On Leave'];

const UserForm = ({
    open,
    handleClose,
    form,
    handleChange,
    handleSubmit,
    isEditing,
    loading
}) => {
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                        {isEditing ? <Edit color="primary" sx={{ mr: 1 }} /> : <Add color="primary" sx={{ mr: 1 }} />}
                        <Typography variant="h6" fontWeight="600" color="primary">
                            {isEditing ? 'Edit User' : 'Create New User'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {loading && <LinearProgress />}
                <form autoComplete="off">
                    <Grid container spacing={3} sx={{ pt: 1 }}>
                        {/* Basic Info */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Full Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                autoFocus
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                fullWidth
                                required
                                autoComplete="off"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                type="password"
                                fullWidth
                                required={!isEditing}
                                autoComplete="new-password"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl
                                fullWidth
                                required
                                sx={{
                                    minWidth: { xs: '100%', sm: 200 }, // 100% on mobile, min 200px on sm and up
                                    flexGrow: 1,
                                }}
                            >
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    label="Role"
                                >
                                    {roleOptions.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Escalation Manager"
                                name="escalationManager"
                                value={form.escalationManager}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select name="status" value={form.status} onChange={handleChange} label="Status">
                                    {statusOptions.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Divider */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Dates */}
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="Start Date"
                                value={form.startDate}
                                onChange={(date) => handleChange({ target: { name: 'startDate', value: date } })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="End Date"
                                value={form.endDate}
                                onChange={(date) => handleChange({ target: { name: 'endDate', value: date } })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>

                        {/* Divider */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Description */}
                        {/* <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Additional information or notes"
                inputProps={{ maxLength: 300 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Max 300 characters
              </Typography>
            </Grid> */}
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} variant="outlined" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{ ml: 2 }}
                >
                    {isEditing ? 'Update User' : 'Create User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;