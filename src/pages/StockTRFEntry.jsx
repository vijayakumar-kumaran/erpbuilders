// File: frontend/src/pages/StockTransferEntry.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Grid, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Select, Card
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import MaterialDropdown from '../components/reusable/TypeAheadDrop'
import { useAuth } from '../AuthContext'
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';

const StockTransferEntry = () => {
  const [dropdownData, setDropdownData] = useState({ materials: [], sites: [], users: [] });
  const [transferData, setTransferData] = useState({
    stockTransferNo: '',
    dateOfTransfer: new Date().toISOString().slice(0, 10),
    enteredBy: '',
    items: []
  });
  const navigate = useNavigate()
  const { user } = useAuth();
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [dialog, setDialog] = useState({ open: false, type: 'success' });


  useEffect(() => {
    const fetchData = async () => {
      const [matRes, userRes, serialRes] = await Promise.all([
        axios.get(`${API_URL}/api/masters/materials`),
        axios.get(`${API_URL}/api/masters/users`),
        axios.get(`${API_URL}/api/stock-trf/generate-number`)
      ]);

      setDropdownData({
        materials: matRes.data,
        users: userRes.data,
        subCategories: [...new Set(matRes.data.map(m => m.materialSubCategory))]
      });

      setTransferData(prev => ({
        ...prev,
        stockTransferNo: serialRes.data.stockTransferNo,
        items: [{
          materialName: '', materialCode: '', materialCategory: '',
          materialSubCategory: '', uom: '', transferQty: '',
          receivingSite: '', receivedBy: '', issuingSite: '',
          issuedBy: '', remarks: ''
        }]
      }));
    };
    fetchData();
  }, []);

  // Filter materials based on selected subcategory
  useEffect(() => {
    if (selectedSubCategory) {
      setFilteredMaterials(
        dropdownData.materials.filter(m => m.materialSubCategory === selectedSubCategory)
      );
    } else {
      setFilteredMaterials(dropdownData.materials);
    }
  }, [selectedSubCategory, dropdownData.materials]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...transferData.items];
    updatedItems[index][field] = value;

    // When materialName changes, update other material details too
    if (field === 'materialName') {
      const selectedMaterial = dropdownData.materials.find(
        (m) => m.materialName === value
      );
      if (selectedMaterial) {
        updatedItems[index].materialCode = selectedMaterial.materialCode || '';
        updatedItems[index].materialCategory = selectedMaterial.materialCategory || '';
        updatedItems[index].materialSubCategory = selectedMaterial.materialSubCategory || '';
        updatedItems[index].uom = selectedMaterial.uom || '';
      } else {
        updatedItems[index].materialCode = '';
        updatedItems[index].materialCategory = '';
        updatedItems[index].materialSubCategory = '';
        updatedItems[index].uom = '';
      }
    }

    // ✅ Clear specific validation error for transferQty if valid
    if (field === 'transferQty' && Number(value) > 0) {
      setValidationErrors(prevErrors => {
        const newErrors = [...prevErrors];
        if (newErrors[index]) {
          delete newErrors[index].transferQty;
        }
        return newErrors;
      });
    }


    setTransferData({ ...transferData, items: updatedItems });
  };

  const addRow = () => {
    setTransferData(prev => ({
      ...prev,
      items: [...prev.items, {
        materialName: '', materialCode: '', materialCategory: '',
        materialSubCategory: '', uom: '', transferQty: '',
        receivingSite: '', receivedBy: '', issuingSite: '',
        issuedBy: '', remarks: ''
      }]
    }));
  };
  const removeRow = (indexToRemove) => {
    setTransferData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSave = async () => {
    const errors = transferData.items.map((item) => {
      const rowErrors = {};
      if (!selectedSubCategory) rowErrors.subCategory = true;
      if (!item.materialName) rowErrors.materialName = true;
      if (!item.transferQty || Number(item.transferQty) <= 0) rowErrors.transferQty = true;
      if (!item.receivingSite) rowErrors.receivingSite = true;
      if (!item.receivedBy) rowErrors.receivedBy = true;
      if (!item.issuingSite) rowErrors.issuingSite = true;
      if (!item.issuedBy) rowErrors.issuedBy = true;
      return rowErrors;
    });

    const hasErrors = errors.some(err => Object.keys(err).length > 0);
    setValidationErrors(errors);

    if (hasErrors) {
      setDialog({
        open: true,
        type: 'warning',
        title: 'Check Required Fields',
        message: `Please fill in all required fields`
      });
      return;
    }
    try {
      await axios.post(`${API_URL}/api/stock-trf/save`, transferData);
      setDialog({
        open: true,
        type: 'success',
        title: 'Transfer Successfull',
        message: `Stock Transfered Successfull For : ${transferData.stockTransferNo}`
      });
      setTransferData({ ...transferData, items: [] });
    } catch (error) {
      console.error(error);
      setDialog({
        open: true,
        type: 'success',
        title: 'Transfer Failed',
        message: `Please Check your Internet Connection.`
      });
    }
  };

  return (
    <Box p={4}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: colors.headerBgcolor }}>
        <Typography variant="h5">Stock Transfer Entry</Typography>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <TextField
              label="Stock Trf #"
              value={transferData.stockTransferNo}
              fullWidth
              size="small"
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Date of Trf"
              value={transferData.dateOfTransfer}
              onChange={(e) => setTransferData({ ...transferData, dateOfTransfer: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box  sx={{ mt: 3 }}>
        <Grid container direction="column" spacing={2}>
          {transferData.items.map((item, index) => (
            <Grid item key={index}>
              {/* S. No. */}
              <Grid item xs={12} sm={6} md={1.5}>
                <Box sx={{mx:2, my:2}}>
                  <Typography variant="subtitle2">S. No. {index + 1}</Typography>
                  <Typography></Typography>
                </Box>
              </Grid>

              <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
                
                <Grid container spacing={5} ml={2} alignItems="center">                  

                  {/* Sub Category */}
                  <Grid item xs={12} sm={6} md={2}>
                    <MaterialDropdown
                      label="Sub Category"
                      value={selectedSubCategory ? { label: selectedSubCategory, value: selectedSubCategory } : null}
                      onChange={(selected) => setSelectedSubCategory(selected ? selected.value : '')}
                      onSearch={async (searchTerm) => {
                        const list = dropdownData.subCategories || [];
                        return list.filter(sc => !searchTerm || sc.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(sc => ({ label: sc, value: sc }));
                      }}
                      loadInitialData={true}
                      initialOptions={dropdownData.subCategories?.map(sc => ({ label: sc, value: sc })) || []}
                      error={validationErrors[index]?.subCategory}
                    />
                  </Grid>

                  {/* Material Name */}
                  <Grid item xs={12} sm={6} md={2}>
                    <MaterialDropdown
                      label="Material Name"
                      value={item.materialName ? { label: item.materialName, value: item.materialName } : null}
                      onChange={(selected) => handleItemChange(index, 'materialName', selected?.value || '')}
                      onSearch={async (searchTerm) => {
                        const list = selectedSubCategory ? filteredMaterials : dropdownData.materials || [];
                        return list.filter(m => !searchTerm || m.materialName.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(m => ({ label: m.materialName, value: m.materialName, ...m }));
                      }}
                      loadInitialData={true}
                      initialOptions={filteredMaterials.map(m => ({
                        label: m.materialName,
                        value: m.materialName,
                        ...m
                      }))}
                      error={validationErrors[index]?.materialName}
                    />
                  </Grid>

                  {/* UoM */}
                  <Grid item xs={12} sm={6} md={1.5}>
                    <Typography variant="subtitle2">UoM</Typography>
                    <Typography sx={{color: 'blue'}}>{item.uom}</Typography>
                  </Grid>

                  {/* Transfer Qty */}
                  <Grid item xs={12} sm={6} md={1.5}>
                    <TextField
                      label="Transfer Qty"
                      type="number"
                      variant="standard"
                      value={item.transferQty}
                      onChange={(e) => handleItemChange(index, 'transferQty', e.target.value)}
                      size="small"
                      fullWidth
                      error={validationErrors[index]?.transferQty}
                      helperText={validationErrors[index]?.transferQty ? 'Qty required > 0' : ''}
                    />
                  </Grid>

                  {/* Receiving Site */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <MaterialDropdown
                      label="Receiving Site"
                      value={item.receivingSite ? { label: item.receivingSite, value: item.receivingSite } : null}
                      onChange={(selected) => handleItemChange(index, 'receivingSite', selected?.label || '')}
                      onSearch={async (searchTerm) => {
                        const response = await axios.get(`${API_URL}/api/masters/sites/drop`, {
                          params: { search: searchTerm || '' }
                        });
                        return response.data;
                      }}
                      loadInitialData={true}
                      initialOptions={[]}
                      error={validationErrors[index]?.receivingSite}
                    />
                  </Grid>

                  {/* Received By */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <MaterialDropdown
                      label="Received By"
                      value={item.receivedBy ? { label: item.receivedBy, value: item.receivedBy } : null}
                      onChange={(selected) => handleItemChange(index, 'receivedBy', selected?.value || '')}
                      onSearch={async (searchTerm) => {
                        return dropdownData.users.filter(u =>
                          !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(u => ({ label: u.name, value: u.name }));
                      }}
                      loadInitialData={true}
                      initialOptions={dropdownData.users.map(u => ({ label: u.name, value: u.name }))}
                      error={validationErrors[index]?.receivedBy}
                    />
                  </Grid>

                  {/* Issuing Site */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <MaterialDropdown
                      label="Issuing Site"
                      value={item.issuingSite ? { label: item.issuingSite, value: item.issuingSite } : null}
                      onChange={(selected) => handleItemChange(index, 'issuingSite', selected?.label || '')}
                      onSearch={async (searchTerm) => {
                        const response = await axios.get(`${API_URL}/api/masters/sites/drop`, {
                          params: { search: searchTerm || '' }
                        });
                        return response.data;
                      }}
                      loadInitialData={true}
                      initialOptions={[]}
                      error={validationErrors[index]?.issuingSite}
                    />
                  </Grid>

                  {/* Issued By */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <MaterialDropdown
                      label="Issued By"
                      value={item.issuedBy ? { label: item.issuedBy, value: item.issuedBy } : null}
                      onChange={(selected) => handleItemChange(index, 'issuedBy', selected?.value || '')}
                      onSearch={async (searchTerm) => {
                        return dropdownData.users.filter(u =>
                          !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(u => ({ label: u.name, value: u.name }));
                      }}
                      loadInitialData={true}
                      initialOptions={dropdownData.users.map(u => ({ label: u.name, value: u.name }))}
                      error={validationErrors[index]?.issuedBy}
                    />
                  </Grid>

                  {/* Remarks */}
                  <Grid item xs={12} sm={6} md={2.5}>
                    <TextField
                      label="Remarks"
                      variant="standard"
                      value={item.remarks || ''}
                      onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Grid>

                    
                </Grid>
                    {/* remove btn*/}
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 1 }}>
                        <IconButton onClick={() => removeRow(index)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={2}>
          <Button variant="outlined" onClick={addRow}>Add Row</Button>
        </Box>


        <Box mt={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                variant="filled"
                value={user?.name}
                label="Entered By"
                inputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={handleSave}>Save</Button>
            </Grid>
          </Grid>
        </Box>

        <AlertDialog
          open={dialog.open}
          type={dialog.type}
          title={dialog.title}
          message={dialog.message}
          onClose={() => {
            setDialog({ ...dialog, open: false });
            if (dialog.type === 'success') {
              navigate('/');
            }
          }}
        />
      </Box>

    </Box>
  )
};

export default StockTransferEntry;
