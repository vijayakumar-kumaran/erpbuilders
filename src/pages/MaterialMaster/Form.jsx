// src/pages/materials/MaterialForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

const MaterialForm = ({ open, onClose, selectedMaterial, onSaveComplete }) => {
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
          console.error('Code fetch error:', err);
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
        await axios.put(
          `${API_URL}/api/masters/materials/${selectedMaterial._id}`,
          formData
        );
        setSuccess('Material updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/add-material`, formData);
        setSuccess('Material saved successfully!');
      }

      setTimeout(() => {
        onSaveComplete();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save material.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedMaterial ? 'Edit Material' : 'Add New Material'}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="materialCategory"
                label="Material Category"
                fullWidth
                required
                value={formData.materialCategory}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="materialSubCategory"
                label="Material Subcategory"
                fullWidth
                required
                value={formData.materialSubCategory}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="materialName"
                label="Material Name"
                fullWidth
                required
                value={formData.materialName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="materialCode"
                label="Material Code"
                fullWidth
                value={formData.materialCode}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="materialDescription"
                label="Material Description"
                fullWidth
                multiline
                rows={3}
                value={formData.materialDescription}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="uom"
                label="Unit of Measurement (UOM)"
                fullWidth
                required
                value={formData.uom}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="reorderLevel"
                label="Reorder Level"
                type="number"
                fullWidth
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="reorderQuantity"
                label="Reorder Quantity"
                type="number"
                fullWidth
                value={formData.reorderQuantity}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!formData.materialCode}
        >
          {selectedMaterial ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialForm;