import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Alert,
  Typography,
  IconButton,
  MenuItem,
  useTheme,
  alpha,
  Divider,
  Tooltip
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';

const VendorForm = ({ open, onClose, selectedVendor, onSaveComplete }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    vendorCode: '', vendorName: '', gstRegistered: '', gstNo: '',
    address1: '', address2: '', contact1: '', contact2: '',
    phone1: '', phone2: '', bankName: '', ifsc: '',
    bankLocation: '', email: '', website: '', paymentTerm: '',
    status: 'Active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setError('');
      setSuccess('');
      resetForm();
    }
  }, [open]);

  const resetForm = ()=>{
    setFormData({
        vendorCode: '', vendorName: '', gstRegistered: '', gstNo: '',
        address1: '', address2: '', contact1: '', contact2: '',
        phone1: '', phone2: '', bankName: '', ifsc: '',
        bankLocation: '', email: '', website: '', paymentTerm: '',
        status: 'Active'
      });
  }

  useEffect(() => {
    if (selectedVendor) {
      setFormData(selectedVendor);
    } else {
      setFormData({
        vendorCode: '', vendorName: '', gstRegistered: '', gstNo: '',
        address1: '', address2: '', contact1: '', contact2: '',
        phone1: '', phone2: '', bankName: '', ifsc: '',
        bankLocation: '', email: '', website: '', paymentTerm: '',
        status: 'Active'
      });
    }
  }, [selectedVendor]);

  useEffect(() => {
    const fetchVendorCode = async () => {
      if (selectedVendor?._id) return;
      if (formData.vendorName.trim().length >= 3) {
        try {
          const res = await axios.get(`${API_URL}/api/masters/vendor/code`, {
            params: { vendorName: formData.vendorName }
          });
          setFormData((prev) => ({ ...prev, vendorCode: res.data.vendorCode }));
        } catch (err) {
          setFormData((prev) => ({ ...prev, vendorCode: '' }));
        }
      } else {
        setFormData((prev) => ({ ...prev, vendorCode: '' }));
      }
    };
    fetchVendorCode();
  }, [formData.vendorName, selectedVendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'gstRegistered' && value === 'No' ? { gstNo: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = {};
      if (formData.gstRegistered === 'Yes' && !formData.gstNo.trim()) {
        errors.gstNo = 'GST Number is required';
      }

      setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (selectedVendor && selectedVendor._id) {
        await axios.put(`${API_URL}/api/masters/vendor/update/${selectedVendor._id}`, formData);
        setSuccess('Vendor updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/vendor/create`, formData);
        setSuccess('Vendor saved successfully!');
      }
      onSaveComplete();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          py: 2, px: 3
        }}
      >
        <Typography variant="h6">
          {selectedVendor ? '✏️ Edit Vendor' : '➕ Add Vendor'}
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="vendorCode" label="Vendor Code" fullWidth value={formData.vendorCode} disabled required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="vendorName" label="Vendor Name" required fullWidth value={formData.vendorName} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField sx={{minWidth: 225}} select name="gstRegistered" label="GST Registered" required fullWidth value={formData.gstRegistered} onChange={handleChange}>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          {formData.gstRegistered === 'Yes' && (
            <Grid item xs={12} sm={6}>
              <TextField
                name="gstNo"
                label="GST Number"
                fullWidth
                required
                value={formData.gstNo}
                onChange={handleChange}
                error={!!validationErrors.gstNo}
                helperText={validationErrors.gstNo}
              />
          </Grid>
          )}
          <Grid item xs={12}><TextField name="address1" label="Address 1" required fullWidth value={formData.address1} onChange={handleChange} /></Grid>
          <Grid item xs={12}><TextField name="address2" label="Address 2" fullWidth value={formData.address2} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="contact1" label="Contact 1" required fullWidth value={formData.contact1} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="contact2" label="Contact 2" fullWidth value={formData.contact2} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="phone1" label="Phone 1" required fullWidth value={formData.phone1} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="phone2" label="Phone 2" fullWidth value={formData.phone2} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="bankName" label="Bank Name" fullWidth value={formData.bankName} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="ifsc" label="IFSC" inputProps={{ maxLength: 15 }} fullWidth value={formData.ifsc} onChange={handleChange} /></Grid>
          <Grid item xs={12}><TextField name="bankLocation" label="Bank Location" fullWidth value={formData.bankLocation} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="email" label="Email" fullWidth value={formData.email} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="website" label="Website" fullWidth value={formData.website} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField name="paymentTerm" label="Payment Term" fullWidth value={formData.paymentTerm} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}>
            <TextField select name="status" label="Status" required fullWidth value={formData.status} onChange={handleChange}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 4, py: 2, background: alpha(theme.palette.background.paper, 0.9) }}>
        <Button onClick={onClose} color="error" variant="outlined" startIcon={<Cancel />} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" startIcon={<Save />} sx={{ textTransform: 'none' }}>
          {selectedVendor ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorForm;