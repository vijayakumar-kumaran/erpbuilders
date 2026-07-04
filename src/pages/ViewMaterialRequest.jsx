import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import MaterialDropdown from '../components/reusable/TypeAheadDrop';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'
import colors from '../theme/color';

const MaterialRequestEditor = () => {
  const [requestNos, setRequestNos] = useState([]);
  const [selectedRequestNo, setSelectedRequestNo] = useState('');
  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);
  const [workStages, setWorkStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);


  useEffect(() => {
    axios
      .get(`${API_URL}/api/mat-request/all-request-nos`)
      .then(res => setRequestNos(res.data))
      .catch(err => console.error(err));

    axios
      .get(`${API_URL}/api/masters/stages`)
      .then(res => setWorkStages(res.data))
      .catch(err => console.error('Failed to fetch work stages', err));

    axios
      .get(`${API_URL}/api/masters/materials/all`)
      .then(res => setMaterials(res.data))
      .catch(err => console.error('Failed to fetch materials', err));
  }, []);

  useEffect(() => {
    if (!selectedRequestNo) return;
    axios
      .get(`${API_URL}/api/mat-request/by-requestNo/${encodeURIComponent(selectedRequestNo)}`)
      .then(res => {
        setHeader(res.data.header);
        setItems(res.data.items);
      })
      .catch(err => console.error(err));
  }, [selectedRequestNo]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleMaterialChange = (index, selectedName) => {
    const selected = materials.find(m => m.materialName === selectedName);
    if (selected) {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        materialName: selected.materialName,
        materialCode: selected.materialCode,
        materialCategory: selected.materialCategory,
        materialSubCategory: selected.materialSubCategory,
        uom: selected.uom,
      };
      setItems(updated);
    }
  };

  const handleSave = () => {
     const newErrors = items.map(item => {
    const errors = {};
    if (!item.workStage) errors.workStage = true;
    if (!item.materialName) errors.materialName = true;
    if (!item.qty || Number(item.qty) <= 0) errors.qty = true;
    if (!item.requiredByDate) errors.requiredByDate = true;
    return errors;
  });

  const hasErrors = newErrors.some(err => Object.keys(err).length > 0);
  setValidationErrors(newErrors);

  if (hasErrors) {
    alert('Please fill all required fields correctly.');
    return;
  }

    axios
      .put(`${API_URL}/api/mat-request/update/${encodeURIComponent(selectedRequestNo)}`, { items })
      .then(() => alert('Updated successfully!'))
      .catch(() => alert('Update failed.'));
  };


  return (
    <Box sx={{ p:3, margin: 'auto', fontFamily: 'sans-serif' }}>
      <Paper sx={{p:4, bgcolor:colors.headerBgcolor, borderRadius:3}}>
        <Typography variant="h5" fontWeight="700" mb={3}>
          📝 Edit Material Request
        </Typography>

        <FormControl fullWidth sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel id="request-no-label">Select Request No</InputLabel>
          <Select
            labelId="request-no-label"
            value={selectedRequestNo}
            label="Select Request No"
            onChange={e => setSelectedRequestNo(e.target.value)}
          >
            <MenuItem value="">
              <em>-- Select --</em>
            </MenuItem>
            {requestNos.map(rn => (
              <MenuItem key={rn} value={rn}>
                {rn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {/* Content Header */}
      {header && (
        <Paper sx={{my:2, p:4, bgcolor:colors.contentBgcolor,borderRadius:3 }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            📄 Header Information
          </Typography>
          <Typography><strong>Date of Request:</strong> {header.dateOfRequest}</Typography>
          <Typography><strong>Requested By:</strong> {header.requestedBy}</Typography>
          <Typography><strong>Request Source:</strong> {header.requestSource}</Typography>
          <Typography><strong>Site:</strong> {header.site}</Typography>
          <Typography><strong>Status:</strong> {header.status}</Typography>
        </Paper>
      )}

      {items.length > 0 && (
        <>
          <Box sx={{ p:2, border:'0.5px solid gray', borderRadius:2}}>
          <Typography variant="h6" mb={2} >
            📦 Items
          </Typography>
          <Divider sx={{mb:2}}/>
          <TableContainer  sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1000, minHeight:200 }} size="small" aria-label="material request items table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f2f2f2' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Work Stage</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Material Name</TableCell>
                  
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SubCategory</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>

                  <TableCell sx={{ fontWeight: 'bold' }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Required Date</TableCell>
                </TableRow>

              </TableHead>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    {/* Work Stage dropdown */}
                    <TableCell>
                      <FormControl fullWidth error={!!validationErrors[i]?.workStage}>
                        <MaterialDropdown
                          value={{ label: item.workStage, value: item.workStage }}
                          onChange={(selected) => handleItemChange(index, 'workStage', selected.label)}
                          onSearch={async (query) => {
                            try {
                              const res = await axios.get(`${API_URL}/api/masters/stages`);
                              return res.data
                                .filter(ws => ws.name.toLowerCase().includes(query.toLowerCase()))
                                .map(ws => ({ label: ws.name, value: ws.name }));
                            } catch (err) {
                              console.error('Work Stage fetch failed:', err);
                              return [];
                            }
                          }}
                          loadInitialData={true}

                        />
                      </FormControl>
                    </TableCell>

                    {/* Material Name dropdown with autofill */}
                    <TableCell>
                      <FormControl fullWidth>

                        <MaterialDropdown
                          placeholder="Select Material"
                          value={item.materialName ? { label: item.materialName, value: item.materialName } : null}
                          onChange={(selected) => handleMaterialChange(i, selected.label)}
                          onSearch={async (query) => {
                            if (query.length < 0) return [];
                            try {
                              const res = await axios.get(`${API_URL}/api/masters/materials/drop`, {
                                params: { search: query }
                              });
                              return res.data; // Expected: [{ label, value }]
                            } catch (err) {
                              console.error('Material search failed:', err);
                              return [];
                            }
                          }}
                          loadInitialData={true}
                          error={!!validationErrors[i]?.materialName}
                          helperText={validationErrors[i]?.materialName ? 'Material Name is Required' : ''}
                        />
                      </FormControl>

                    </TableCell>
                    
                    {/* materialCategory */}
                    <TableCell>
                      {item.materialCategory || ''}
                    </TableCell>

                    {/* materialSubCategory */}
                    <TableCell>
                      {item.materialSubCategory || ''}
                    </TableCell>

                    {/* materialCode */}
                    <TableCell>
                      {item.materialCode || ''}
                    </TableCell>

                    {/* uom */}
                    <TableCell>
                      {item.uom || ''}
                    </TableCell>

                    {/* qty */}
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                         error={!!validationErrors[i]?.qty}
                          helperText={validationErrors[i]?.qty ? 'Qty must be > 0' : ''}
                        value={item.qty || ''}
                        onChange={e => handleItemChange(i, 'qty', e.target.value)}
                      />
                    </TableCell>

                    {/* requiredByDate */}
                    <TableCell>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={item.requiredByDate ? dayjs(item.requiredByDate) : null}
                          onChange={(newValue) => {
                            if (newValue?.isValid?.()) {
                              handleItemChange(i, 'requiredByDate', newValue.format('YYYY-MM-DD'));
                            }
                          }}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                        />
                      </LocalizationProvider>

                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
          </Box>

          <Box mt={3}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              💾 Update
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MaterialRequestEditor;
