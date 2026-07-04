import React, { useEffect, useState } from 'react';
import {
  Box, Typography, MenuItem, Select, InputLabel, FormControl,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Stack, Card, CardContent, Button,
  Collapse, IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess, Download } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import colors from '../../theme/color';

const MaterialIssueReport = () => {
  const [requestNumbers, setRequestNumbers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState('');
  const [reportData, setReportData] = useState([]);
  const [expandedMaterials, setExpandedMaterials] = useState({});

  useEffect(() => {
    const fetchRequestNos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/mat-request/all`);
        setRequestNumbers(res.data);
      } catch (err) {
        console.error('Error fetching request numbers:', err);
      }
    };
    fetchRequestNos();
  }, []);

  const handleRequestChange = async (e) => {
    const requestNo = e.target.value;
    setSelectedRequest(requestNo);
    fetchReport(requestNo);
  };

  const fetchReport = async (requestNo) => {
    try {
      const res = await axios.get(`${API_URL}/api/report/mat-issue-report/report/${encodeURIComponent(requestNo)}`);
      setReportData(res.data);
      const newExpandedState = {};
      res.data.forEach((_, idx) => newExpandedState[idx] = true);
      setExpandedMaterials(newExpandedState);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const exportToExcel = () => {
    const allRows = reportData.flatMap(mat =>
      mat.details.map((d, index) => ({
        SNo: index + 1,
        MaterialName: mat.materialName,
        MaterialCode: mat.materialCode,
        UOM: mat.uom,
        ReqQty: mat.reqQty,
        IssuedQty: d.issueQty,
        IssueDate: d.issueDate,
        IssuedToSite: d.issuedToSite,
        ReceivedBy: d.receivedBy,
        StockLocation: d.stockLocation,
        Status: mat.status,
        RemainingQty: mat.remainingQty
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MaterialIssueReport");
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, `Material_Issue_Report_${selectedRequest}.xlsx`);
  };

  const toggleMaterialExpand = (index) => {
    setExpandedMaterials(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const totalRequest = reportData.length;
  const completed = reportData.filter((m) => m.status === 'Completed').length;
  const pending = totalRequest - completed;

  const chartData = [
    { label: 'Total', value: totalRequest },
    { label: 'Completed', value: completed },
    { label: 'Pending', value: pending }
  ];

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)', minHeight: '100vh' }}>
      <Paper sx={{bgcolor:colors.headerBgcolor, borderRadius:4, p:4}}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          📦 Material Issue Report
        </Typography>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Request No</InputLabel>
          <Select
            value={selectedRequest}
            label="Request No"
            onChange={handleRequestChange}
            sx={{ borderRadius: 3, fontWeight: 500 }}
          >
            {requestNumbers.map((r) => (
              <MenuItem key={r.requestNo || r} value={r.requestNo || r}>
                {r.requestNo || r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      </Paper>

      {reportData.length > 0 && (
        <>
          {/* Export Button */}
          <Box sx={{ my: 2, display:'flex', justifyContent:'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportToExcel}
              sx={{
                background: 'linear-gradient(to right, #6a11cb, #2575fc)',
                borderRadius: 3,
                fontWeight: 'bold',
                px: 3
              }}
            >
              Export
            </Button>
          </Box>

          {/* 📊 Recharts Bar Chart */}
          <Box sx={{ mb: 5, backgroundColor: '#fff', p: 3, borderRadius: 4, boxShadow: 3 }}>
            <Typography variant="subtitle1" mb={2} fontWeight={600}>
              Request Overview
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#42a5f5" barSize={50} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}

      {/* Material Rows */}
      {reportData.map((material, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Box mt={4} p={3} component={Paper} elevation={4} sx={{ borderRadius: 4, background: '#ffffff' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                {material.materialName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={material.remainingQty === 0 ? 'Completed' : `Pending (${material.remainingQty})`}
                  color={material.remainingQty === 0 ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
                <IconButton onClick={() => toggleMaterialExpand(index)} size="small">
                  {expandedMaterials[index] ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Stack>
            </Stack>

            <Collapse in={expandedMaterials[index]}>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableRow>
                      <TableCell>S.No</TableCell>
                      <TableCell>Issue Date</TableCell>
                      <TableCell>Qty Issued</TableCell>
                      <TableCell>UoM</TableCell>
                      <TableCell>Issued To Site</TableCell>
                      <TableCell>Received By</TableCell>
                      <TableCell>Stock Location / Vendor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {material.details.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          {row.issueDate && !isNaN(new Date(row.issueDate)) 
                            ? new Date(row.issueDate).toLocaleDateString() 
                            : '—'}
                        </TableCell>
                        <TableCell>{row.issueQty}</TableCell>
                        <TableCell>{material.uom}</TableCell>
                        <TableCell>{row.issuedToSite}</TableCell>
                        <TableCell>{row.receivedBy}</TableCell>
                       <TableCell>
                        {row.stockLocation ? `( Site ) : ${row.stockLocation}` : `( Vendor) : ${row.vendorName}`}
                      </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell><strong>Total: {material.issueQty}</strong></TableCell>
                      <TableCell colSpan={4} />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

export default MaterialIssueReport;
