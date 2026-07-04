import React, { useState } from 'react';
import {
  Box, Typography, Grid, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Chip,
  Collapse, IconButton, TablePagination, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API_URL from '../../config';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const EnhancedConsolidatedReport = () => {
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'month'));
  const [toDate, setToDate] = useState(dayjs());
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const [expandedSite, setExpandedSite] = useState(null);
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/report/con-site/enhanced-consolidated-report`, {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
      });
      setReportData(res.data.report);
    } catch (err) {
      console.error('Failed to fetch enhanced report', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleMaterialExpand = (materialKey) => {
    setExpandedMaterial(expandedMaterial === materialKey ? null : materialKey);
  };

  const toggleSiteExpand = (site) => {
    setExpandedSite(expandedSite === site ? null : site);
  };

  const filteredTransactions = () => {
    if (!reportData) return [];
    
    let transactions = [...reportData.transactions];
    
    if (selectedSite !== 'all') {
      transactions = transactions.filter(t => 
        t.fromSite === selectedSite || t.toSite === selectedSite
      );
    }
    
    if (selectedMaterial !== 'all') {
      const [name, code] = selectedMaterial.split('-');
      transactions = transactions.filter(t => 
        t.materialName === name && t.materialCode === code
      );
    }
    
    return transactions;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={4}>
        <Typography variant="h4" mb={3} fontWeight="bold">
          Consolidated Material Site Report (Experimental)
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3} display="flex" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ height: '56px' }}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Generating comprehensive report...
            </Typography>
          </Box>
        )}

        {reportData && !isLoading && (
          <>
            <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
              <Chip 
                label={`Report generated: ${new Date().toLocaleString()}`}
                color="success"
                variant="outlined"
                size="medium"
              />
              
              <Box display="flex" gap={2}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Site</InputLabel>
                  <Select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    label="Filter by Site"
                  >
                    <MenuItem value="all">All Sites</MenuItem>
                    {reportData.sites.map((site, index) => (
                      <MenuItem key={index} value={site}>{site}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Material</InputLabel>
                  <Select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    label="Filter by Material"
                  >
                    <MenuItem value="all">All Materials</MenuItem>
                    {reportData.materials.map((material, index) => (
                      <MenuItem 
                        key={index} 
                        value={`${material.name}-${material.code}`}
                      >
                        {material.name} ({material.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Summary Section */}
            <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Material Movement Summary
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell align="right">Opening</TableCell>
                      <TableCell align="right">Received</TableCell>
                      <TableCell align="right">Issued</TableCell>
                      <TableCell align="right">Returned</TableCell>
                      <TableCell align="right">Transfers In</TableCell>
                      <TableCell align="right">Transfers Out</TableCell>
                      <TableCell align="right">Closing</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.materials.map((material, matIdx) => {
                      const materialKey = `${material.name}-${material.code}`;
                      const isExpanded = expandedMaterial === materialKey;
                      
                      return (
                        <React.Fragment key={matIdx}>
                          <TableRow hover>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => toggleMaterialExpand(materialKey)}
                              >
                                {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                              {material.name} ({material.code})
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.openingQty || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.receivedQty || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.issuedQty || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.returnedQty || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.transferIn.reduce((tSum, t) => tSum + t.quantity, 0) || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right">
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.transferOut.reduce((tSum, t) => tSum + t.quantity, 0) || 0), 0)
                              }
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {reportData.sites.reduce((sum, site) => 
                                sum + (reportData.data[site][materialKey]?.closingQty || 0), 0)
                              }
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell colSpan={9} sx={{ p: 0, borderBottom: isExpanded ? null : 0 }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Detailed Movement by Site
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Site</TableCell>
                                        <TableCell align="right">Opening</TableCell>
                                        <TableCell align="right">Received</TableCell>
                                        <TableCell align="right">Issued</TableCell>
                                        <TableCell align="right">Returned</TableCell>
                                        <TableCell align="right">Transfers In</TableCell>
                                        <TableCell align="right">Transfers Out</TableCell>
                                        <TableCell align="right">Closing</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {reportData.sites.map((site, siteIdx) => {
                                        const siteData = reportData.data[site][materialKey];
                                        const isSiteExpanded = expandedSite === `${materialKey}-${site}`;
                                        
                                        return (
                                          <React.Fragment key={siteIdx}>
                                            <TableRow hover>
                                              <TableCell sx={{ pl: 6 }}>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => toggleSiteExpand(`${materialKey}-${site}`)}
                                                >
                                                  {isSiteExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                </IconButton>
                                                {site}
                                              </TableCell>
                                              <TableCell align="right">{siteData?.openingQty || 0}</TableCell>
                                              <TableCell align="right">{siteData?.receivedQty || 0}</TableCell>
                                              <TableCell align="right">{siteData?.issuedQty || 0}</TableCell>
                                              <TableCell align="right">{siteData?.returnedQty || 0}</TableCell>
                                              <TableCell align="right">
                                                {siteData?.transferIn.reduce((sum, t) => sum + t.quantity, 0) || 0}
                                              </TableCell>
                                              <TableCell align="right">
                                                {siteData?.transferOut.reduce((sum, t) => sum + t.quantity, 0) || 0}
                                              </TableCell>
                                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {siteData?.closingQty || 0}
                                              </TableCell>
                                            </TableRow>
                                            
                                            <TableRow>
                                              <TableCell colSpan={8} sx={{ p: 0, borderBottom: isSiteExpanded ? null : 0 }}>
                                                <Collapse in={isSiteExpanded} timeout="auto" unmountOnExit>
                                                  <Box sx={{ margin: 1, ml: 8 }}>
                                                    <Grid container spacing={2}>
                                                      <Grid item xs={6}>
                                                        <Typography variant="subtitle2">Transfers In</Typography>
                                                        <Table size="small">
                                                          <TableHead>
                                                            <TableRow>
                                                              <TableCell>From Site</TableCell>
                                                              <TableCell>Date</TableCell>
                                                              <TableCell align="right">Qty</TableCell>
                                                              
                                                            </TableRow>
                                                          </TableHead>
                                                          <TableBody>
                                                            {siteData?.transferIn.map((transfer, tIdx) => (
                                                              <TableRow key={`in-${tIdx}`}>
                                                                <TableCell>{transfer.fromSite}</TableCell>
                                                                <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                                                                <TableCell align="right">{transfer.quantity}</TableCell>
                                                                
                                                              </TableRow>
                                                            ))}
                                                          </TableBody>
                                                        </Table>
                                                      </Grid>
                                                      
                                                      <Grid item xs={6}>
                                                        <Typography variant="subtitle2">Transfers Out</Typography>
                                                        <Table size="small">
                                                          <TableHead>
                                                            <TableRow>
                                                              <TableCell>To Site</TableCell>
                                                              <TableCell>Date</TableCell>
                                                              <TableCell align="right">Qty</TableCell>
                                                              <TableCell>Doc No.</TableCell>
                                                            </TableRow>
                                                          </TableHead>
                                                          <TableBody>
                                                            {siteData?.transferOut.map((transfer, tIdx) => (
                                                              <TableRow key={`out-${tIdx}`}>
                                                                <TableCell>{transfer.toSite}</TableCell>
                                                                <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                                                                <TableCell align="right">{transfer.quantity}</TableCell>
                                                                <TableCell>{transfer.documentNo}</TableCell>
                                                              </TableRow>
                                                            ))}
                                                          </TableBody>
                                                        </Table>
                                                      </Grid>
                                                    </Grid>
                                                  </Box>
                                                </Collapse>
                                              </TableCell>
                                            </TableRow>
                                          </React.Fragment>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Transaction Details */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Transaction Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Doc No.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions()
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>
                            {transaction.materialName} ({transaction.materialCode})
                          </TableCell>
                          <TableCell>{transaction.fromSite}</TableCell>
                          <TableCell>{transaction.toSite}</TableCell>
                          <TableCell align="right">{transaction.quantity}</TableCell>
                          <TableCell>{transaction.documentNo}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredTransactions().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default EnhancedConsolidatedReport;