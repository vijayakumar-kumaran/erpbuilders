// File: frontend/components/MaterialRequestPO.jsx

import React, { useState, useEffect } from 'react';
import {
  TextField, Typography, Button, TableContainer, Paper, Table,
  TableHead, TableRow, TableCell, TableBody, MenuItem, Select, Snackbar,
  FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';

const MaterialRequestPO = () => {
  const [requestNo, setRequestNo] = useState('');
  const [requestNumbers, setRequestNumbers] = useState([]);
  const [header, setHeader] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [enteredBy, setEnteredBy] = useState('');
  const [approval, setApproval] = useState('No');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [reqBy, setReqby] = useState('')
  const [reqSource, setReqSource] = useState('')
  const [siteName, setSiteName] = useState('')
  const navigate = useNavigate();

  // Fetch dropdowns and request numbers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, reqNosRes] = await Promise.all([
          axios.get(`${API_URL}/api/masters/users`),
          axios.get(`${API_URL}/api/po/reqnos`)
        ]);

        setUsers(usersRes.data || []);
        setRequestNumbers(reqNosRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dropdowns or request numbers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFetch = async () => {
    if (!requestNo.trim()) {
      setError('Please select a request number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/po/by-requestNo/${encodeURIComponent(requestNo.trim())}`);
      console.log("main", res)
      if (res.data) {
        const { header, items } = res.data;
        console.log("header",header)
        console.log("items", items)
        setHeader(header);
        setItems(
          items.map((item) => ({
            ...item,
            requiredByDate: dayjs(item.requiredByDate),
          }))
        );
        //
        setReqby(header.requestedBy)
        setReqSource(header.requestSource)
        setSiteName(header.site)
        //setEnteredBy(header.enteredBy);
        //setApproval(request.approval || 'No');
      } else {
        setError('Request not found');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError(err.response?.data?.error || 'Failed to fetch request');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/po/update/${header._id}`, {
        ...header,
        approval,
        enteredBy,
        itemDetails: items.map(item => ({
          ...item,
          requiredByDate: item.requiredByDate.format('YYYY-MM-DD')
        }))
      });

      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (list, value, nameField = 'name') => {
    const item = list.find(u => u._id === value || u.id === value);
    return item ? item[nameField] : value;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>Material Request PO</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <FormControl fullWidth>
            <InputLabel>Select Request No</InputLabel>
            <Select
              value={requestNo}
              onChange={(e) => setRequestNo(e.target.value)}
              disabled={loading}
              renderValue={(value) => value || 'Select Request No'}
            >
              {requestNumbers.map(req => (
                <MenuItem key={req._id || req.id} value={req.requestNo}>
                  {req.requestNo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleFetch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Fetch'}
          </Button>
        </div>

        {header && (
          <>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <TextField
                label="Request Date"
                value={new Date(header.dateOfRequest).toLocaleDateString()}
                fullWidth
                disabled
              />
              <FormControl fullWidth>
                <InputLabel>Requested By</InputLabel>
                <Select
                  value={enteredBy}
                  onChange={(e) => setRequestSource(e.target.value)}
                  renderValue={(value) => getDisplayName(users, value)}
                >
                  {users.map(user => (
                    <MenuItem key={user._id || user.id} value={user._id || user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Approval</InputLabel>
                <Select
                  value={approval}
                  onChange={(e) => setApproval(e.target.value)}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </div>

            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Required By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <DatePicker
                          value={item.requiredByDate}
                          onChange={(date) => handleItemChange(index, 'requiredByDate', date)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button variant="contained" color="primary" onClick={handleUpdate} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Update Request'}
            </Button>
          </>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="Request updated successfully"
        />
      </div>
    </LocalizationProvider>
  );
};

export default MaterialRequestPO;
