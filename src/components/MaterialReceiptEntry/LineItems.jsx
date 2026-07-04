// src/components/MaterialReceiptEntry/LineItems.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

const LineItemsGRN = ({ poNumber, onChange }) => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!poNumber) return; // prevent empty fetch

      try {
        console.log('Fetching line items for PO:', poNumber);
        const res = await axios.get(`${API_URL}/api/mat-entry/${poNumber}`);
        const poItems = res.data?.items || [];

        setItems(poItems);
        onChange(poItems);
      } catch (err) {
        console.error('Error fetching PO line items:', err);
        setItems([]);
        onChange([]);
      }

      try {
        const userRes = await axios.get(`${API_URL}/api/masters/users`);
        setUsers(userRes.data.map(u => u.name));
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      try {
        const locRes = await axios.get(`${API_URL}/api/masters/sites`);
        const active = locRes.data
          .filter(s => s.status === 'Active')
          .map(s => s.siteName);
        setLocations(active);
      } catch (err) {
        console.error('Error fetching sites:', err);
      }
    };

    fetchData();
  }, [poNumber]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
    onChange(updated);
  };

  return (
    <Box mt={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>S.No</TableCell>
            <TableCell>Material Name</TableCell>
            <TableCell>UoM</TableCell>
            <TableCell>PO Qty</TableCell>
            <TableCell>Received Qty</TableCell>
            <TableCell>Received By</TableCell>
            <TableCell>Receiving Location</TableCell>
            <TableCell>Direct to Site</TableCell>
            <TableCell>Delivery Location as per PO</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{item.materialName || ''}</TableCell>
              <TableCell>{item.uom || ''}</TableCell>
              <TableCell>{item.poQty || ''}</TableCell>

              <TableCell>
                <TextField
                  value={item.receivedQty || ''}
                  onChange={(e) => handleChange(i, 'receivedQty', e.target.value)}
                  fullWidth
                />
              </TableCell>

              <TableCell>
                <TextField
                  select
                  value={item.receivedBy || ''}
                  onChange={(e) => handleChange(i, 'receivedBy', e.target.value)}
                  fullWidth
                >
                  {users.map(name => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </TextField>
              </TableCell>

              <TableCell>
                <TextField
                  select
                  value={item.receivingLocation || ''}
                  onChange={(e) => handleChange(i, 'receivingLocation', e.target.value)}
                  fullWidth
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </TextField>
              </TableCell>

              <TableCell>
                <TextField
                  select
                  value={item.directToSite || ''}
                  onChange={(e) => handleChange(i, 'directToSite', e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </TableCell>

              <TableCell>{item.deliveryLocation || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default LineItemsGRN;
