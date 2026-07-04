// src/pages/POStatusReport.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Select,
  InputLabel, FormControl, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert,
  Card, CardContent, Divider, IconButton, Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dayjs from 'dayjs';
import axios from 'axios';
import API_URL from '../../config'
import colors from '../../theme/color';

const POStatusReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [results, setResults] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    if (fromDate && toDate) {
      if (dayjs(fromDate).isAfter(dayjs(toDate))) {
        setDateError('"From" date must be less than or equal to "To" date.');
        setResults([]);
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [fromDate, toDate]);

  const handleSubmit = async () => {
    setError('');
    setResults([]);
    setSubmitted(true);

    if (!fromDate || !toDate || !category) {
      setError('All fields are required.');
      return;
    }

    if (dayjs(fromDate).isAfter(dayjs(toDate))) {
      setError('From date should not be after To date.');
      return;
    }

    const formattedFrom = dayjs(fromDate).format('YYYY-MM-DD');
    const formattedTo = dayjs(toDate).format('YYYY-MM-DD');

    try {
      const endpoint =
        category === 'Additional Input to Generate PO'
          ? `${API_URL}/api/report/po-status/additional-input?from=${formattedFrom}&to=${formattedTo}`
          : `${API_URL}/api/report/po-status/purchase-order?from=${formattedFrom}&to=${formattedTo}`;

      const response = await axios.get(endpoint);
      setResults(response.data.length === 0 ? [] : response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Error fetching report data.');
    }
  };

  const toggleCard = (idx) => {
    setExpandedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <Box p={4} sx={{ backgroundColor: '#f4f6f8' }}>
      <Paper sx={{p:4, bgcolor:colors.headerBgcolor, borderRadius:4, }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom >
        PO Status Report
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => {
              setFromDate(newValue);
              setSubmitted(false);
            }}
            renderInput={(params) => <TextField {...params} size="small" variant="outlined" />}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => {
              setToDate(newValue);
              setSubmitted(false);
            }}
            renderInput={(params) => <TextField {...params} size="small" variant="outlined" />}
          />
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubmitted(false);
              }}
              label="Select Category"
            >
              <MenuItem value="Additional Input to Generate PO">Additional Input to Generate PO</MenuItem>
              <MenuItem value="Purchase Order">Purchase Order</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSubmit} sx={{ height: '40px' }}>
            Submit
          </Button>
        </Box>
      </LocalizationProvider>
      </Paper>

      {(error || dateError) && <Alert severity="error" sx={{ mb: 2 }}>{error || dateError}</Alert>}
      {submitted && results.length === 0 && !(error || dateError) && (
        <Alert severity="info" sx={{ mb: 2 }}>No Record Found</Alert>
      )}

      {submitted && results.length > 0 &&
        results.map((entry, idx) => {
          const isExpanded = expandedCards[idx] || false;
          return (
            <Card key={idx} sx={{ my: 3, p: 2, boxShadow: 6, borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary">
                    PO Number:{' '}
                    {category === 'Purchase Order'
                      ? (entry.poNumber || 'N/A')
                      : (entry.items?.[0]?.poNumber || 'N/A')}
                    {' '}({entry.status || 'Pending'})
                  </Typography>
                  <IconButton onClick={() => toggleCard(idx)} color="primary">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                <Collapse in={isExpanded}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1"><strong>Suggested PO:</strong> {entry.suggestedPO}</Typography>
                  <Typography variant="body1"><strong>Request No:</strong> {entry.requestNo}</Typography>
                  <Typography variant="body1"><strong>Date of PO:</strong> {entry.dateOfPO || entry.dateofPO}</Typography>
                  <Typography variant="body1"><strong>Requested By:</strong> {entry.requestedBy}</Typography>
                  <Typography variant="body1"><strong>Request Source:</strong> {entry.requestSource}</Typography>
                  <Typography variant="body1"><strong>Site Name:</strong> {entry.siteName}</Typography>
                  <Typography variant="body1"><strong>Vendor:</strong> {entry.vendorName}</Typography>

                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>S.No</TableCell>
                          <TableCell>Material Name</TableCell>
                          <TableCell>Material Code</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Sub-Category</TableCell>
                          <TableCell>UOM</TableCell>
                          <TableCell>Requested Qty</TableCell>
                          <TableCell>Suggested Qty</TableCell>
                          <TableCell>Proposed Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(entry.items || entry.poitems || []).map((item, i) => (
                          <TableRow key={i} hover>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{item.materialName}</TableCell>
                            <TableCell>{item.materialCode}</TableCell>
                            <TableCell>{item.materialCategory}</TableCell>
                            <TableCell>{item.materialSubCategory}</TableCell>
                            <TableCell>{item.uom}</TableCell>
                            <TableCell>{item.qtyRequested || item.poQty}</TableCell>
                            <TableCell>{item.suggestedQty || '-'}</TableCell>
                            <TableCell>{item.proposedQty || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
    </Box>
  );
};

export default POStatusReport;
