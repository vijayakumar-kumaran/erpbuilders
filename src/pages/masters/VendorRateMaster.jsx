import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import VendorRateList from '../masterComponents/VendorRateMaster/List';
import VendorRateForm from '../masterComponents/VendorRateMaster/Form';
import API_URL from '../../config';

const VendorRateMaster = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVendorRateData();
  }, []);

  const fetchVendorRateData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/masters/rateall`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (id = null) => {
    setEditingId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSaveSuccess = () => {
    fetchVendorRateData();
    handleClose();
  };

  return (
    <Box p={4} maxWidth="lg" mx="auto">
      <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">
        Vendor Rate Master
      </Typography>

      <VendorRateList 
        data={data} 
        onEdit={handleOpen} 
        onAdd={() => handleOpen(null)} 
      />

      <VendorRateForm 
        open={open} 
        onClose={handleClose} 
        onSaveSuccess={handleSaveSuccess}
        editingId={editingId}
        data={data}
      />
    </Box>
  );
};

export default VendorRateMaster;