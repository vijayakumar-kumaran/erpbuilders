// File: src/components/PurchaseOrder/headerPO.jsx
import React, { useEffect, useState } from 'react';
import { TextField, Box, Typography, MenuItem, Alert, Paper } from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';
import colors from '../../theme/color';

const HeaderPO = ({
  poNumber,
  setPoNumber,
  setHeaderData,
  setItems,
  setVendor,
  setShowDetails,
  setVendorName, // ✅ Added
}) => {
  const [poOptions, setPoOptions] = useState([]);
  const [alert, setAlert] = useState('');
  const [vendorName, setVendorNameLocal] = useState(''); // ✅ Local state to show in UI

  useEffect(() => {
    const fetchPONumbers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/purchase-order/material/unique-po-numbers`);
        setPoOptions(res.data);
      } catch (error) {
        console.error('Error fetching PO Numbers:', error);
      }
    };
    fetchPONumbers();
  }, []);

  const handlePOSelection = async (selectedPo) => {
  try {
    const encodedPo = encodeURIComponent(selectedPo);
    const res = await axios.get(`${API_URL}/api/purchase-order/material/po-details/${encodedPo}`);

    const anyCompleted = res.data.items.some(item => item.status === 'Completed');

    if (anyCompleted) {
      setAlert('Purchase Order Already Generated');
      setShowDetails(false);
    } else {
      setPoNumber(selectedPo);
      setHeaderData(res.data);
      setHeaderData({
        requestNo: res.data.requestNo,
        suggestedPO: res.data.suggestedPO,
        dateOfPO: res.data.dateOfPO,
        siteName: res.data.siteName
        // add any other required fields here
      });

      setItems(res.data.items);

      const vendorNameFetched = res.data.items[0].vendorName;
      setVendorNameLocal(vendorNameFetched);
      if (setVendorName) setVendorName(vendorNameFetched);

      const vendorCode = res.data.items[0].vendorCode;

      if (vendorNameFetched !== 'N/A') {
        const vendorRes = await axios.get(`${API_URL}/api/purchase-order/vendor/${vendorCode}`);
        setVendor(vendorRes.data);
        console.log(vendorRes.data);
      } else {
        setVendor(null); // Or {} depending on how your UI handles no vendor
      }

      setAlert('');
      setShowDetails(true);
    }
  } catch (err) {
    console.error('Error fetching PO data:', err);
    setAlert('Error fetching PO data');
    setShowDetails(false);
  }
};


  return (
    <Paper sx={{ p: 4, bgcolor:colors.headerBgcolor, borderRadius:3 }}>
      <Typography variant="h5" fontWeight={700}>Purchase Order</Typography>

      <TextField
        select
        label="Purchase Order #"
        value={poNumber}
        onChange={(e) => handlePOSelection(e.target.value)}
        fullWidth
        margin="normal"
      >
        {poOptions.map((option, index) => (
          <MenuItem key={index} value={option}>{option}</MenuItem>
        ))}
      </TextField>

      {/* ✅ Display vendor name */}
      {vendorName && (
        <Typography variant="body1" sx={{ mt: 1 }}>
          Vendor: {vendorName}
        </Typography>
        
      )}

      {alert && <Alert severity="warning" sx={{ mt: 2 }}>{alert}</Alert>}
    </Paper>
  );
};

export default HeaderPO;
