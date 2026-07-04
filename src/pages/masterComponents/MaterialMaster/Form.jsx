import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import { Save, Cancel, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_URL from '../../../config';

const MaterialForm = ({ open, onClose, selectedMaterial, onSaveComplete }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    materialCategory: '',
    materialSubCategory: '',
    materialCode: '',
    materialName: '',
    materialDescription: '',
    uom: '',
    reorderLevel: '',
    reorderQuantity: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
  if (!open) {
    setError('');
    setSuccess('');
  }
}, [open]);

  useEffect(() => {
    if (selectedMaterial) {
      setFormData(selectedMaterial);
    } else {
      setFormData({
        materialCategory: '',
        materialSubCategory: '',
        materialCode: '',
        materialName: '',
        materialDescription: '',
        uom: '',
        reorderLevel: '',
        reorderQuantity: ''
      });
    }
  }, [selectedMaterial]);

  useEffect(() => {
    const fetchCode = async () => {
      const { materialCategory, materialSubCategory, materialName } = formData;
      if (
        materialCategory.trim().length >= 3 &&
        materialSubCategory.trim().length >= 3 &&
        materialName.trim().length >= 3
      ) {
        try {
          const res = await axios.get(
            `${API_URL}/api/masters/materials/nextcode/${materialCategory}/${materialSubCategory}/${materialName}`
          );
          setFormData((prev) => ({ ...prev, materialCode: res.data.newCode }));
        } catch (err) {
          setFormData((prev) => ({ ...prev, materialCode: '' }));
        }
      } else {
        setFormData((prev) => ({ ...prev, materialCode: '' }));
      }
    };
    fetchCode();
  }, [formData.materialCategory, formData.materialSubCategory, formData.materialName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (selectedMaterial && selectedMaterial._id) {
        await axios.put(`${API_URL}/api/masters/materials/${selectedMaterial._id}`, formData);
        setSuccess('Material updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/add-material`, formData);
        setSuccess('Material saved successfully!');
      }
      onSaveComplete();
      onClose();

      // ✅ Reset form after submission
      setFormData({
        materialCategory: '',
        materialSubCategory: '',
        materialCode: '',
        materialName: '',
        materialDescription: '',
        uom: '',
        reorderLevel: '',
        reorderQuantity: ''
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save material.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold'
        }}
      >
        <Typography variant="h6">
          {selectedMaterial ? '✏️ Edit Material' : '➕ Add New Material'}
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 4, background: alpha(theme.palette.background.paper, 0.95) }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {/* {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>} */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField name="materialCategory" label="Material Category" fullWidth required value={formData.materialCategory} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="materialSubCategory" label="Material Subcategory" fullWidth required value={formData.materialSubCategory} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="materialName" label="Material Name" fullWidth required value={formData.materialName} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="materialCode" label="Material Code" fullWidth value={formData.materialCode} disabled variant="outlined" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="materialDescription" label="Material Description" fullWidth multiline rows={3} value={formData.materialDescription} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="uom" label="Unit of Measurement (UOM)" fullWidth required value={formData.uom} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="reorderLevel" label="Reorder Level" type="number" fullWidth value={formData.reorderLevel} onChange={handleChange} variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField name="reorderQuantity" label="Reorder Quantity" type="number" fullWidth value={formData.reorderQuantity} onChange={handleChange} variant="outlined" />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2, background: alpha(theme.palette.background.paper, 0.9) }}>
        <Button onClick={onClose} color="error" variant="outlined" startIcon={<Cancel />} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" startIcon={<Save />} disabled={!formData.materialCode} sx={{ textTransform: 'none' }}>
          {selectedMaterial ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialForm;
