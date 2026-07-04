// src/components/MaterialAdditionalInput/lineAdditionalInputPO.jsx

import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

import axios from 'axios';
import { Box, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, MenuItem } from '@mui/material';
import API_URL from '../../config';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';

const LineAdditionalInputPO = forwardRef(({ selectedPO, headerData, onLineItemsChange }, ref) => {

  const [lineItems, setLineItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorRates, setVendorRates] = useState({});
  const [vendorCodes, setVendorCodes] = useState({});
  const [vendorPOMap, setVendorPOMap] = useState({});
  const [sites, setSites] = useState([]);
  const [nextPoNumberBase, setNextPoNumberBase] = useState('PO-0001/25-26');
  const [validationErrors, setValidationErrors] = useState([]);

  // Fetch Vendor Master & Rate Cards
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/masters/rateall`);
        const vendorMap = {};
        const ratesMap = {};
        const vendorList = res.data.map(vendor => {
          vendorMap[vendor.vendorName] = vendor.vendorCode;

          ratesMap[vendor.vendorName] = vendor.materialNames.reduce((acc, material) => {
            acc[material.materialCode] = {
              ...material,
              rate: material.rate,
              uom: material.uom
            };
            return acc;
          }, {});
          return vendor.vendorName;
        });

        setVendors(vendorList);
        setVendorCodes(vendorMap);
        setVendorRates(ratesMap);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      }
    };

    fetchVendors();
  }, []);

  // Fetch Sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/masters/sites`);
        const active = res.data.filter(site => site.status === 'Active').map(s => s.siteName);
        setSites(active);
      } catch (err) {
        console.error('Error fetching sites:', err);
      }
    };

    fetchSites();
  }, []);

  // Fetch Base PO Number
  useEffect(() => {
    const fetchPoBase = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/mat-add-input/next-po-number`);
        setNextPoNumberBase(res.data.nextPoNumber);
      } catch (err) {
        console.error('Error fetching base PO number:', err);
        setNextPoNumberBase('PO-0001/25-26');
      }
    };

    fetchPoBase();
  }, []);

  // Fetch PO Line Items
  useEffect(() => {
    if (!selectedPO || !headerData.siteName) return; // Wait for both to be available
    const fetchLineItems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/mat-add-input/items/${encodeURIComponent(selectedPO)}`);
        const initial = res.data.items.map(item => ({
          ...item,
          vendorName: '',
          vendorCode: '',
          rate: '',
          uom: item.uom || '',
          amount: 0,
          deliveryLocation:  headerData.siteName || '',
          poNumber: '',
        }));
        console.log('Default site from headerData:', headerData.siteName);

        console.log('Default site from selectedPO:', selectedPO?.site);

        setLineItems(initial);
        onLineItemsChange?.(initial);
        setVendorPOMap({});
      } catch (err) {
        console.error('Error fetching line items:', err);
      }
    };

    fetchLineItems();
  }, [selectedPO, onLineItemsChange, headerData.siteName]);

  // Generate Next PO Number for unique vendor count
  const getNextPoNumber = (vendorName) => {
    const [prefix, suffix] = nextPoNumberBase.split('/');
    const baseNum = parseInt(prefix.replace('PO-', '')) || 1;
    const existingCount = Object.keys(vendorPOMap).length;
    const newCount = existingCount + 1;
    return `PO-${(baseNum + newCount - 1).toString().padStart(4, '0')}/${suffix}`;
  };

  // Vendor dropdown search
 const vendorSearch = useCallback(async (search = '') => {
    // Use cached vendors if available
    const vendorsToSearch = vendors.length > 0 ? vendors : 
      (await axios.get(`${API_URL}/api/masters/rateall`)).data.map(v => v.vendorName);

    // Filter based on search term (case insensitive)
    const filtered = vendorsToSearch
      .filter(v => v.toLowerCase().includes(search.toLowerCase()))
      .map(v => ({
        label: v,
        value: v,
        vendorName: v,
        vendorCode: vendorCodes[v] || ''
      }));

    return filtered;
  }, [vendors, vendorCodes]);

  // Vendor selection logic
  const handleVendorChange = (index, vendorName) => {
    setLineItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.vendorName = vendorName;
      item.vendorCode = vendorCodes[vendorName] || '';

      const rates = vendorRates[vendorName] || {};
      const matchedMaterial = rates[item.materialCode];
      if (matchedMaterial) {
        item.rate = matchedMaterial.rate;
        item.uom = matchedMaterial.uom;
        item.amount = matchedMaterial.rate * (parseFloat(item.proposedQty) || 0);
      } else {
        item.rate = 0;
        item.amount = 0;
      }

      const newVendorPOMap = { ...vendorPOMap };
      if (!newVendorPOMap[vendorName]) {
        newVendorPOMap[vendorName] = getNextPoNumber(vendorName);
      }
      item.poNumber = newVendorPOMap[vendorName];

      setVendorPOMap(newVendorPOMap);
      onLineItemsChange?.(updated);
      return updated;
    });
  };

  const handleRateChange = (index, value) => {
    const rate = parseFloat(value) || 0;
    setLineItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.rate = rate;
      item.amount = rate * (parseFloat(item.proposedQty) || 0);
      onLineItemsChange?.(updated);
      return updated;
    });
  };

  const handleAmountChange = (index, value) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index].amount = parseFloat(value) || 0;
      onLineItemsChange?.(updated);
      return updated;
    });
  };

  const validateFields = () => {
    const errors = lineItems.map((item) => ({
      vendor: item.vendorName.trim() === '',
      rate: item.rate === '' || item.rate === null || isNaN(Number(item.rate)),
      amount: item.amount === '' || item.amount === null || isNaN(Number(item.amount)),
    }));

    setValidationErrors(errors);
    return errors.every(err => !err.vendor && !err.rate && !err.amount);
  };

  useImperativeHandle(ref, () => ({
    validateFields
  }));

  return (
    <Box>
      <Typography variant="h6">Line Items</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>S.No</TableCell>
            <TableCell>Material</TableCell>
            <TableCell>UoM</TableCell>
            <TableCell>Suggested Qty</TableCell>
            <TableCell>Proposed Qty</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Delivery Location</TableCell>
            <TableCell>PO #</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.materialName}</TableCell>
              <TableCell>{item.uom}</TableCell>
              <TableCell>{item.suggestedQty}</TableCell>
              <TableCell>{item.proposedQty || ''}</TableCell>
              <TableCell style={{ minWidth: 200 }}>
                  <MaterialDropdown
                    value={item.vendorName ? { 
                      label: item.vendorName, 
                      value: item.vendorName,
                      vendorName: item.vendorName,
                      vendorCode: item.vendorCode
                    } : null}
                    onChange={(selected) => handleVendorChange(index, selected?.vendorName || '')}
                    onSearch={vendorSearch}
                    placeholder="Search or select vendor..."
                    loadInitialData={true}
                    minCharsToSearch={0} // Show data immediately
                    initialOptions={vendors.map(v => ({
                      label: v,
                      value: v,
                      vendorName: v,
                      vendorCode: vendorCodes[v] || ''
                    }))}
                    
                  />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.rate !== undefined && item.rate !== null ? item.rate : 0}

                  onChange={(e) => handleRateChange(index, e.target.value)}
                  fullWidth
                  error={validationErrors[index]?.rate}
                  helperText={validationErrors[index]?.rate ? 'Enter valid rate (0 allowed)' : ''}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  fullWidth
                  error={validationErrors[index]?.amount}
                  helperText={validationErrors[index]?.amount ? 'Enter valid amount (0 allowed)' : ''}
                />
              </TableCell>
              <TableCell>
                {item.deliveryLocation || ''}

              </TableCell>
              <TableCell>
                <TextField
                  value={item.poNumber}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
)

export default LineAdditionalInputPO;
