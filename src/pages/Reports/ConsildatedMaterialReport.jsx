import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API_URL from '../../config';

const ConsolidatedReport = () => {
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/report/con-material/generate-consolidated-material-report`, {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
      });

      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch consolidated report', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={4}>
        <Typography variant="h5" mb={3}>Consolidated Material Report</Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={3} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Report Table */}
        {reportData.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Material Code</strong></TableCell>
                  <TableCell><strong>Material Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Sub-Category</strong></TableCell>
                  <TableCell><strong>UOM</strong></TableCell>
                  <TableCell><strong>Opening</strong></TableCell>
                  <TableCell><strong>Received</strong></TableCell>
                  <TableCell><strong>Transfer In</strong></TableCell>
                  <TableCell><strong>Returned</strong></TableCell>
                  <TableCell><strong>Issued</strong></TableCell>
                  <TableCell><strong>Transfer Out</strong></TableCell>
                  <TableCell><strong>Closing</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.materialCode}</TableCell>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{item.materialCategory}</TableCell>
                    <TableCell>{item.materialSubCategory || '-'}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    <TableCell>{item.openingStock}</TableCell>
                    <TableCell>{item.receivedQty}</TableCell>
                    <TableCell>{item.transferInQty}</TableCell>
                    <TableCell>{item.returnQty}</TableCell>
                    <TableCell>{item.issueQty}</TableCell>
                    <TableCell>{item.transferOutQty}</TableCell>
                    <TableCell><strong>{item.closingStock}</strong></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {reportData.length === 0 && !isLoading && (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No report data available. Please generate a report.
            </Typography>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ConsolidatedReport;