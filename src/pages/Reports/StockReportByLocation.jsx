import React, { useState } from 'react';
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
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';
import colors from '../../theme/color';

const ReportGenerator = () => {
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());
  const [selectedSite, setSelectedSite] = useState(null); // Store the entire selected site object
  const [reportData, setReportData] = useState([]);
  console.log(selectedSite)
  const handleGenerateReport = async () => {
    try {
      if (!selectedSite) return;
     
      const res = await axios.post(`${API_URL}/api/report/bysite/generate-material-report`, {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        site: selectedSite.label, // Use the siteName from the selected site
      });
      console.log(res.data);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={4}>
        <Paper sx={{p:4, bgcolor:colors.headerBgcolor, borderRadius:4, }}>
        <Typography variant="h5" mb={3} fontWeight={700}>Generate Reports</Typography>

       
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

            {/* Site Dropdown */}
            <Grid item xs={12} sm={3}>
              
              <MaterialDropdown
                placeholder="Search site..."
                value={selectedSite ? { 
                  label: `${selectedSite.siteName} - (${selectedSite.location})`,
                  value: selectedSite._id 
                } : null}
                onSearch={async (searchTerm) => {
                  try {
                    const res = await axios.get(`${API_URL}/api/masters/sites/drop`, {
                      params: { search: searchTerm }
                    });
                    return res.data.map(site => ({
                      label: `${site.siteName} - ${site.location}`,
                      value: site._id,  // Make sure to use _id as the value
                      key: site._id,    // Add explicit key using _id
                      ...site
                    }));
                  } catch (err) {
                    console.error('Error fetching sites:', err);
                    return [];
                  }
                }}
                onChange={(selected) => {
                  setSelectedSite(selected || null);
                }}
                loadInitialData={true}
                minCharsToSearch={0}
              />
             </Grid>

            <Grid item xs={12} sm={3} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                fullWidth
                disabled={!selectedSite}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Report Table */}
        {reportData.length > 0 && (
          <TableContainer sx={{my:3, border:'0.5px solid gray', borderRadius:4}}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Material Name</strong></TableCell>
                  <TableCell><strong>Opening Stock</strong></TableCell>
                  <TableCell><strong>Received Qty</strong></TableCell>
                  <TableCell><strong>Transfer In</strong></TableCell>
                  <TableCell><strong>Returned From Others</strong></TableCell>
                  <TableCell><strong>Returned Qty</strong></TableCell>
                  <TableCell><strong>Issued Qty</strong></TableCell>
                  <TableCell><strong>Transfer Out</strong></TableCell>
                  <TableCell><strong>Closing Stock</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.materialName}</TableCell>
                    <TableCell>{item.openingStock}</TableCell>
                    <TableCell>{item.receivedQty}</TableCell>
                    <TableCell>{item.transferInQty}</TableCell>
                    <TableCell>{item.returnFromOtherSiteQty}</TableCell>
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
      </Box>
    </LocalizationProvider>
  );
};

export default ReportGenerator;