// components/VendorMaster/VendorRateModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Paper, TextField,
  MenuItem, Grid, Box
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

const VendorRateModal = ({ open, onClose, rates, vendorName, vendorCode, refresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    materialCategory: '',
    materialSubCategory: '',
    uom: '',
    rate: '',
    sourceqty: ''
  });

  // Reset form on modal close
  useEffect(() => {
    if (!open) {
      setIsAdding(false);
      setFormData({
        materialCode: '',
        materialName: '',
        materialCategory: '',
        materialSubCategory: '',
        uom: '',
        rate: '',
        sourceqty: ''
      });
    }
  }, [open]);

  useEffect(() => {
    if (open && isAdding) {
      axios.get(`${API_URL}/api/masters/materials`)
        .then(res => setMaterials(res.data))
        .catch(console.error);
    }
  }, [open, isAdding]);

  const handleMaterialChange = (name) => {
    const selected = materials.find(m => m.materialName === name);
    if (selected) {
      setFormData({
        materialCode: selected.materialCode,
        materialName: selected.materialName,
        materialCategory: selected.materialCategory,
        materialSubCategory: selected.materialSubCategory,
        uom: selected.uom,
        rate: '',
        sourceqty: ''
      });
    }
  };

  const handleFormSubmit = async () => {
    const isDuplicate = rates.some(r => r.materialName === formData.materialName);
    if (isDuplicate) {
      alert('Material already exists for this vendor.');
      return;
    }

    const newMaterial = {
      materialCode: formData.materialCode,
      materialName: formData.materialName,
      materialCategory: formData.materialCategory,
      materialSubCategory: formData.materialSubCategory,
      uom: formData.uom,
      rate: Number(formData.rate),
      sourceqty: Number(formData.sourceqty)
    };

    try {
      await axios.post(`${API_URL}/api/masters/ven-rate/add-material`, {
        vendorCode,
        vendorName,
        newMaterial
      });
      setIsAdding(false);
      setFormData({
        materialCode: '',
        materialName: '',
        materialCategory: '',
        materialSubCategory: '',
        uom: '',
        rate: '',
        sourceqty: ''
      });
      refresh(); // re-fetch rates
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add material.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f5f5f5' }}>
        {isAdding ? 'Add New Material Rate' : `Material Rates - ${vendorName}`}
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto', bgcolor: '#fafafa' }}>
        {isAdding ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Adding material to: <strong>{vendorName}</strong> ({vendorCode})
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select label="Material Name"
                value={formData.materialName}
                onChange={(e) => handleMaterialChange(e.target.value)}
              >
                {materials.map(m => (
                  <MenuItem key={m.materialCode} value={m.materialName}>
                    {m.materialName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Material Code" fullWidth disabled value={formData.materialCode} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Category" fullWidth disabled value={formData.materialCategory} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Sub Category" fullWidth disabled value={formData.materialSubCategory} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField label="UOM" fullWidth disabled value={formData.uom} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Rate" type="number" fullWidth
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Source Qty" type="number" fullWidth
                value={formData.sourceqty}
                onChange={(e) => setFormData({ ...formData, sourceqty: e.target.value })}
              />
            </Grid>
          </Grid>
        ) : (
          rates?.length > 0 ? (
            <Box mt={1}>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material Code</TableCell>
                      <TableCell>Material Name</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Source Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rates.map((rate, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{rate.materialCode}</TableCell>
                        <TableCell>{rate.materialName}</TableCell>
                        <TableCell>{rate.rate}</TableCell>
                        <TableCell>{rate.sourceqty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography>No rate details available for this vendor.</Typography>
          )
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#f5f5f5' }}>
        {isAdding ? (
          <>
            <Button variant="outlined" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleFormSubmit}>Save</Button>
          </>
        ) : (
          <>
            <Button variant="outlined" onClick={onClose}>Close</Button>
            <Button variant="contained" onClick={() => setIsAdding(true)}>Add New</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VendorRateModal;
