import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';

const WorkStageForm = ({ open, onClose, selectedStage, onSaveComplete }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    name: '',
    uom: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedStage) {
      setFormData(selectedStage);
    } else {
      setFormData({
        category: '',
        subCategory: '',
        name: '',
        uom: '',
        description: ''
      });
    }
  }, [selectedStage]);
  useEffect(() => {
    if (!open) {
      setError('');
      setSuccess('');
      resetForm();
    }
  }, [open]);

  const resetForm = ()=>{
    setFormData({
        category: '',
        subCategory: '',
        name: '',
        uom: '',
        description: ''
      });
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (selectedStage && selectedStage._id) {
        await axios.put(`${API_URL}/api/masters/stages/${selectedStage._id}`, formData);
        setSuccess('Stage updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/stages/create`, formData);
        setSuccess('Stage saved successfully!');
      }
      onSaveComplete();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    }
  };
  const isFormValid = formData.name.trim() && formData.category.trim() && formData.subCategory.trim() && formData.uom.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          py: 2, px: 3
        }}
      >
        <Typography variant="h6">
          {selectedStage ? '✏️ Edit Work Stage' : '➕ Add Work Stage'}
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 4, background: alpha(theme.palette.background.paper, 0.95) }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField name="category" label="Category" fullWidth required value={formData.category} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="subCategory" label="Subcategory" fullWidth required value={formData.subCategory} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="name" label="Stage Name" fullWidth required value={formData.name} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="uom" label="Unit of Measure (UOM)" fullWidth required value={formData.uom} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="description" label="Description" fullWidth multiline rows={3} value={formData.description} onChange={handleChange} variant="outlined" />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2, background: alpha(theme.palette.background.paper, 0.9) }}>
        <Button onClick={onClose} color="error" variant="outlined" startIcon={<Cancel />} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          startIcon={<Save />}
          disabled={!isFormValid}
          sx={{ textTransform: 'none' }}
        >
          {selectedStage ? 'Update' : 'Save'}
        </Button>

      </DialogActions>
    </Dialog>
  );
};

export default WorkStageForm;