// src/pages/MaterialAdditionalInputPO.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

import HeaderAdditionalInputPO from '../components/MaterialAdditionalInput/headerAdditionalInputPO';
import LineAdditionalInputPO from '../components/MaterialAdditionalInput/lineAdditionalInputPO';
import FooterAdditionalInputPO from '../components/MaterialAdditionalInput/footerAdditionalInputPO';
import { Box, Dialog, Alert, DialogTitle,DialogContentText, DialogContent, DialogActions, Button } from '@mui/material';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../components/reusable/AlertDialog';

const MaterialAdditionalInputPO = () => {
  const [selectedPO, setSelectedPO] = useState('');
  const [headerData, setHeaderData] = useState({});
  const [lineItems, setLineItems] = useState([]);
  const [enteredBy, setEnteredBy] = useState('');
  const navigate = useNavigate();
  const lineRef = useRef();
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  
  const handleSave = async (user) => {
    setEnteredBy(user);
    const hasMissingVendor = lineItems.some(item => !item.vendorName || item.vendorName.trim() === '');
     
    if (hasMissingVendor) {
       setDialog({
        open: true,
        type: 'warning',
        title: 'Missing Vendor Information',
        message: `One or more line items are missing vendor details. Please review and try again.`
      });
      return;
    }

    const isValid = lineRef.current?.validateFields();
      if (!isValid) {
        return;
      }

    if (!selectedPO) {
      alert('Please select a PO before saving.');
      return;
    }

    if (!user) {
      alert('Please select the user who entered the PO details.');
      return;
    }
    const requestNo = headerData.requestNo || '';
    const payload = {
      poNumber: selectedPO,
      header: headerData,
      requestNo, // <-- Include this
      lineItems: lineItems,
      enteredBy: user,
      dateOfPO: headerData.dateOfPO || '',
      siteName: headerData.siteName || '',
      suggestedPO: selectedPO,
      dateOfRequest: headerData.dateOfRequest || '',
      requestedBy: headerData.requestedBy || '',
      requestSource: headerData.requestSource || '',
      poEnteredBy: user,
      items: lineItems,
      status: 'POstage',
    };

    try {
      const res = await axios.post(`${API_URL}/api/mat-add-input/save`, payload);
      
      setDialog({
        open: true,
        type: 'success',
        title: 'Data Saved',
        message: `Additional Input Data saved successfully!: ${selectedPO}`
      });
    } catch (error) {
      console.error('Error saving PO data:', error);
      
      setDialog({
        open: true,
        type: 'error',
        title: 'Failed to save PO data',
        message: `Something went Wrong. Please Check your Internet Connection.`
      });
    }
  };

  return (
    <Box p={2}>
      <HeaderAdditionalInputPO
        onSelectedPOChange={setSelectedPO}
        onHeaderDataChange={setHeaderData}
        
      />
      {selectedPO &&(
        <>
        <Box sx={{ my: 3, border:'0.5px solid gray', p:2, borderRadius:3 }}> 
          <LineAdditionalInputPO
            ref={lineRef}
            selectedPO={selectedPO}
            onLineItemsChange={setLineItems}
            headerData={headerData}
          />
        </Box>
        <FooterAdditionalInputPO
          onSave={handleSave}
        />
      </>
      )}

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
  );
};

export default MaterialAdditionalInputPO;
