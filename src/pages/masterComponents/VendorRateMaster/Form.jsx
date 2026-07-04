import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  Box,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MaterialDropdown from '../../../components/reusable/TypeAheadDrop';
import API_URL from '../../../config';

const VendorRateForm = ({ open, onClose, onSaveSuccess, editingId, data }) => {
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('Active');
  const [materialRows, setMaterialRows] = useState([
    { materialCategory: '', materialSubCategory: '', materialCode: '', materialName: '', uom: '', rate: '', sourceqty: '' },
  ]);

  useEffect(() => {
    if (editingId) {
      const vendor = data.find(d => d._id === editingId);
      if (vendor) {
        setVendorName(vendor.vendorName);
        setVendorCode(vendor.vendorCode);
        setStartDate(vendor.startDate ? dayjs(vendor.startDate) : null);
        setEndDate(vendor.endDate ? dayjs(vendor.endDate) : null);
        setStatus(vendor.status);
        setMaterialRows(vendor.materialNames || []);
      }
    } else {
      resetForm();
    }
  }, [editingId, data]);

  const resetForm = () => {
    setVendorName('');
    setVendorCode('');
    setStartDate(dayjs());
    setEndDate(null);
    setStatus('Active');
    setMaterialRows([
      { materialCategory: '', materialSubCategory: '', materialCode: '', materialName: '', uom: '', rate: '', sourceqty: '' },
    ]);
  };

  const handleVendorSelect = (selected) => {
    if (!selected) {
      setVendorName('');
      setVendorCode('');
      return;
    }
    setVendorName(selected.label);
    setVendorCode(selected.vendorCode);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialRows];
    
    if (field === 'materialName' && value) {
      const selectedMaterial = value;
      updated[index] = {
        ...updated[index],
        materialName: selectedMaterial.label,
        materialCode: selectedMaterial.materialCode,
        materialCategory: selectedMaterial.materialCategory,
        materialSubCategory: selectedMaterial.materialSubCategory,
        uom: selectedMaterial.uom
      };
    } else {
      updated[index][field] = value;
    }

    setMaterialRows(updated);
  };

  const handleAddMaterialRow = () => {
    setMaterialRows([
      ...materialRows,
      { materialCategory: '', materialSubCategory: '', materialCode: '', materialName: '', uom: '', rate: '', sourceqty: '' },
    ]);
  };

  const handleSave = async () => {
    try {
      for (const m of materialRows) {
        if (!m.materialCode || !m.materialName || !m.rate) {
          alert('Material Code, Name, and Rate are required for all rows.');
          return;
        }
      }

      const processedMaterials = materialRows.map(m => ({
        ...m,
        rate: Number(m.rate),
        sourceqty: Number(m.sourceqty),
      }));

      if (editingId) {
        await axios.put(`${API_URL}/api/masters/rate/update/${editingId}`, {
          vendorName,
          vendorCode,
          startDate,
          endDate,
          status,
          materialNames: processedMaterials,
        });
      } else {
        await axios.post(`${API_URL}/api/masters/ven-rate/create`, {
          vendorName,
          vendorCode,
          startDate,
          endDate,
          status,
          materialNames: processedMaterials,
        });
      }

      onSaveSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to save vendor rate.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="vendor-rate-modal-title"
        aria-describedby="vendor-rate-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%',
            maxWidth: 1200,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="h6" id="vendor-rate-modal-title">
              {editingId ? 'Edit Vendor Rate' : 'Add Vendor Rate'}
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Modal Content */}
          <Box
            sx={{
              p: 3,
              overflowY: 'auto',
              flexGrow: 1
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MaterialDropdown
                  label="Vendor Name"
                  placeholder="Search Vendor Name..."
                  value={vendorName ? { 
                    label: vendorName, 
                    value: vendorCode,
                    vendorCode,
                    vendorName
                  } : null}
                  onChange={handleVendorSelect}
                  onSearch={async (searchTerm) => {
                    if (!searchTerm || searchTerm.length < 2) return [];
                    const res = await axios.get(`${API_URL}/api/masters/vendors/drop`, {
                      params: { search: searchTerm }
                    });
                    return res.data;
                  }}
                  loadInitialData={false}
                  minCharsToSearch={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Vendor Code" fullWidth value={vendorCode} disabled />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  disablePast
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  disablePast
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    label="Status"
                    size="medium"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Materials
                </Typography>
                {materialRows.map((row, idx) => (
                  <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={12} md={2}>
                      <TextField label="Category" fullWidth value={row.materialCategory} disabled />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField label="Sub Category" fullWidth value={row.materialSubCategory} disabled />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <MaterialDropdown
                        label="Material Name"
                        placeholder="Search Material Name..."
                        value={row.materialName ? { 
                          label: row.materialName, 
                          value: row.materialCode,
                          materialCode: row.materialCode,
                          materialCategory: row.materialCategory,
                          materialSubCategory: row.materialSubCategory,
                          uom: row.uom
                        } : null}
                        onChange={(selected) => handleMaterialChange(idx, 'materialName', selected)}
                        onSearch={async (searchTerm) => {
                          if (!searchTerm || searchTerm.length < 2) return [];
                          const res = await axios.get(`${API_URL}/api/masters/materials/drop`, {
                            params: { search: searchTerm }
                          });
                          return res.data;
                        }}
                        loadInitialData={false}
                        minCharsToSearch={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <TextField label="Material Code" fullWidth value={row.materialCode} disabled />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <TextField label="UoM" fullWidth value={row.uom} disabled />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <TextField
                        label="Rate"
                        fullWidth
                        type="number"
                        inputProps={{ step: 0.01 }}
                        value={row.rate}
                        onChange={e => handleMaterialChange(idx, 'rate', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <TextField
                        label="Source Qty"
                        fullWidth
                        type="number"
                        value={row.sourceqty}
                        onChange={e => handleMaterialChange(idx, 'sourceqty', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      {idx === materialRows.length - 1 && (
                        <Button variant="outlined" size="small" onClick={handleAddMaterialRow}>
                          Add
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Box>

          {/* Modal Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2
            }}
          >
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={!vendorCode || materialRows.some(m => !m.materialCode || !m.rate)}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default VendorRateForm;