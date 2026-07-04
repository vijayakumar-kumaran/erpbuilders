import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Card,
  CardContent,
  Button,
  Collapse,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';
import API_URL from '../../config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import colors from '../../theme/color';

const MaterialIssueReportByDate = () => {
  const [reportData, setReportData] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day'));
  const [toDate, setToDate] = useState(dayjs());
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchReportData = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from: fromDate.format('YYYY-MM-DD'),
        to: toDate.format('YYYY-MM-DD')
      });

      const response = await axios.get(`${API_URL}/api/report/mat-issue-report/by-date?${params}`);
      setReportData(response.data.data || []);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch report data:', {
        error: err.response?.data || err.message,
        config: err.config
      });
      setError(err.response?.data?.error || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    if (!fromDate || !toDate) return;

    if (fromDate.isAfter(toDate)) {
      setError('From date cannot be after To date');
      return;
    }

    setError(null);
    fetchReportData();
  };

  const exportToExcel = () => {
    const allRows = reportData.flatMap(request => 
      request.items.map((item, idx) => ({
        'S.No': idx + 1,
        'Request No': request.requestNo,
        'Site': request.site,
        'Issue Date': dayjs(item.dateOfIssue).format('DD-MM-YYYY'),
        'Material Name': item.materialName,
        'Material Code': item.materialCode,
        'Category': item.materialCategory,
        'UOM': item.uom,
        'Req Qty': item.reqQty,
        'Issued Qty': item.issueQty,
        'Issued To Site': item.issuedToSite,
        'Received By': item.receivedBy,
        'Status': item.status,
        'Stock Location': item.stockLocation,
        'Vendor': item.vendorName,
        'Remarks': item.remarks
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MaterialIssues');
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Material_Issues_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  const toggleExpandRequest = (requestNo) => {
    setExpandedRequest(expandedRequest === requestNo ? null : requestNo);
  };

  return (
    <Box p={3}>
      

      <Paper sx={{ p: 4, bgcolor: colors.headerBgcolor, borderRadius: 3 }}>
         <Typography variant="h4" fontWeight={600} gutterBottom>
          Material Issue Report By Date
        </Typography>
      
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} my={3} alignItems="center">
          
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
            maxDate={toDate || dayjs()}
            format="DD-MM-YYYY"
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={setToDate}
            minDate={fromDate}
            maxDate={dayjs()}
            format="DD-MM-YYYY"
            
          />
          <Button
            variant="contained"
            onClick={handleDateChange}
            disabled={loading}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
       
     
        {reportData.length === 0 && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No material issues found for the selected date range.
          </Alert>
        )}
      

      {reportData.length > 0 && (

        
        <Box sx={{display:'flex', justifyContent:'flex-end'}}>
          <Button
            variant="contained"
            onClick={exportToExcel}
            disabled={reportData.length === 0 || loading}
            sx={{ minWidth: 180, minHeight:40, mb: 3, my:2 }}
          >
            Export to Excel
          </Button>
        </Box>
        )}
      {stats && (
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <StatCard title="Total Requests" value={stats.totalRequests} color="#e3f2fd" />
          <StatCard title="Total Items" value={stats.totalItems} color="#e8f5e9" />
          <StatCard
            title="Date Range"
            value={`${dayjs(stats.dateRange.from).format('DD-MM-YYYY')} to ${dayjs(stats.dateRange.to).format('DD-MM-YYYY')}`}
            color="#fff3e0"
          />
        </Stack>
      )}

      {reportData.map((request) => (
        <RequestCard
          key={request.requestNo}
          request={request}
          expanded={expandedRequest === request.requestNo}
          onToggle={toggleExpandRequest}
        />
      ))}
    </Box>
  );
};

// Sub-component: StatCard
const StatCard = ({ title, value, color }) => (
  <Card sx={{ flex: 1, minWidth: 200, bgcolor: color }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </CardContent>
  </Card>
);

// Sub-component: RequestCard
const RequestCard = ({ request, expanded, onToggle }) => (
  <Card sx={{ mb: 2, boxShadow: 3 }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">
          <Tooltip title={`Site: ${request.site}`}>
            <span>Request: {request.requestNo}</span>
          </Tooltip>
          <Chip 
            label={dayjs(request.dateOfIssue).format('DD-MM-YYYY')} 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${request.totalItems} items`} size="small" variant="outlined" />
          <Chip label={`${request.totalQty} total qty`} size="small" variant="outlined" />
          <IconButton onClick={() => onToggle(request.requestNo)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Issued To</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {request.items.map((item, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <div>{item.materialName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {item.stockLocation}
                    </div>
                  </TableCell>
                  <TableCell>{item.materialCode}</TableCell>
                  <TableCell>
                    <div>{item.materialCategory}</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {item.materialSubCategory}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>Req: {item.reqQty}</div>
                    <div>Issued: {item.issueQty}</div>
                  </TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>
                    <div>{item.issuedToSite}</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {item.receivedBy}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status} 
                      size="small" 
                      color={item.status === 'Completed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </CardContent>
  </Card>
);

export default MaterialIssueReportByDate;
