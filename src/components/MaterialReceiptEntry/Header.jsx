// src/components/GRN/HeaderGRNFull.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';
import dayjs from 'dayjs';

const HeaderGRNFull = ({ onHeaderDataChange }) => {
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState('');
  const [headerData, setHeaderData] = useState({
    grnNumber: '',
    poNumber: '',
    vendorName: '',
    vendorAddress: '',
    dateOfPO: '',
  });

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/mat-entry/all`);
        setPoList(res.data);
      } catch (err) {
        console.error('Failed to fetch full PO data', err);
      }
    };

    fetchPOs();
  }, []);

  const handlePOChange = (e) => {
    const selected = poList.find(po => po.poNumber === e.target.value);
    setSelectedPO(selected);

    const updated = {
      grnNumber: '', // can later auto-generate or input manually
      poNumber: selected.poNumber,
      vendorName: selected.vendorName || '',
      vendorAddress: selected.vendorAddress,
      dateOfPO: selected.dateofPO || '',
    };

    setHeaderData(updated);
    if (onHeaderDataChange) onHeaderDataChange(updated);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Material Receipt Entry (Full PO)
      </Typography>

      <TextField
        select
        label="Select PO"
        fullWidth
        size="small"
        value={headerData.poNumber}
        onChange={handlePOChange}
        helperText="Choose a PO to load details"
        margin="normal"
      >
        {poList.map((po) => (
          <MenuItem key={po._id} value={po.poNumber}>
            {po.poNumber}
          </MenuItem>
        ))}
      </TextField>

      {headerData.poNumber && (
        <>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Vendor Name"
                value={headerData.vendorName}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date of PO"
                value={dayjs(headerData.dateOfPO).format('YYYY-MM-DD')}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Vendor Address"
                value={headerData.vendorAddress}
                fullWidth
                size="small"
                multiline
                rows={2}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
};

export default HeaderGRNFull;
