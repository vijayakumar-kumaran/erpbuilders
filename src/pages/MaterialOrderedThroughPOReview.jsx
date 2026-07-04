
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  Grid,
  Chip,
  Avatar,
  useTheme,
  TextField,
  Divider
} from '@mui/material';
import {
  CheckCircleOutline,
  CancelOutlined,
  AssignmentOutlined,
  Inventory2Outlined,
  PersonOutline
} from '@mui/icons-material';
import API_URL from '../config';
import { useAuth } from '../AuthContext'
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';

const MaterialOrderedThroughPOReview = () => {
  const [requestNos, setRequestNos] = useState([]);
  const [selectedRequestNo, setSelectedRequestNo] = useState('');
  const [headerData, setHeaderData] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [approvedBy, setApprovedBy] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [dialog, setDialog] = useState({ open: false, type: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestNosResponse = await axios.get(`${API_URL}/api/po/material-request/requestNosApproval`);
        setRequestNos(requestNosResponse.data);

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchRequestData = async () => {
      if (selectedRequestNo) {
        try {
          const encodedRequestNo = encodeURIComponent(selectedRequestNo);
          const response = await axios.get(`${API_URL}/api/po/material-request/requestNosData/${encodedRequestNo}`);
          setHeaderData(response.data.header);
          setLineItems(response.data.lineItems);
        } catch (error) {
          console.error('Failed to load request data:', error);
        }
      }
    };
    fetchRequestData();
  }, [selectedRequestNo]);

  const handleStatusUpdate = async (status) => {

    try {
      await axios.post(`${API_URL}/api/po/material-request/real-status-approval`, {
        requestNo: selectedRequestNo,
        status,
        approvedBy: user.name,
      });
     if (status === 'Approved') {
      setDialog({
        open: true,
        type: 'success',
        title: 'PO Approved',
        message: `PO Request ${status} successfully!`
      });
    } else {
      setDialog({
        open: true,
        type: 'warning',
        title: 'PO Rejected',
        message: `PO Request ${status} successfully!`
      });
    }

     
    } catch (error) {
      console.error('Error updating status:', error);
      
      setDialog({
        open: true,
        type: 'error',
        title: 'Approval Request Failed',
        message: `Something went Wrong. Please Check Your Internet Connection`
      });
    }
  };

  return (
    <Box sx={{ p:3, backgroundColor: theme.palette.grey[50] }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Paper elevation={5} sx={{minWidth:"100%", p:4, maxWidth:"100%", borderRadius:3, bgcolor:colors.headerBgcolor}}>
        <Grid item xs={12}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={2}  // Add consistent spacing between grid items
            sx={{
              mb:1,  // Add margin bottom for separation
              px: 2   // Add horizontal padding for better edge alignment
            }}
          >
            <Grid item>
              <Box display="flex" alignItems="center">
                <Inventory2Outlined
                  sx={{
                    mr: 2,
                    fontSize: '2.5rem',
                    color: theme.palette.primary.main,
                    verticalAlign: 'middle'
                  }}
                />
                <Typography
                  variant="h4"
                  fontWeight="700"
                  
                >
                  PO Approval
                </Typography>
              </Box>
            </Grid>

            <Grid item>
              <Chip
                label={`Active Requests: ${requestNos.length}`}
                color="primary"
                variant="outlined"
                avatar={
                  <Avatar
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText
                    }}
                  >
                    {requestNos.length}
                  </Avatar>
                }
                sx={{
                  fontSize: '1rem',
                  padding: 1.5,
                  borderRadius: 2,
                  height: '100%'  // Ensure consistent height
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Select Request */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor:colors.headerBgcolor,
              color:"black",
              mb: 4 
            }}
          >
            <Grid
              container
              spacing={3}  // Increased spacing for better visual separation
              alignItems="center"
            >
              <Grid item xs={12} md="auto">  {/* Responsive width */}
                <Typography
                  variant="h6"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.text.primary,
                    whiteSpace: 'nowrap'  // Prevent text wrapping
                  }}
                >
                  <AssignmentOutlined
                    sx={{
                      mr: 1.5,
                      fontSize: '1.5rem',
                      verticalAlign: 'middle'
                    }}
                  />
                  Select Request
                </Typography>
              </Grid>
              <Grid item xs={12} md>  {/* Takes remaining space on medium+ screens */}
                <FormControl fullWidth variant="outlined">
                  <InputLabel shrink={true} id="request-select-label">
                    Request Number
                  </InputLabel>
                  <Select
                    labelId="request-select-label"
                    value={selectedRequestNo}
                    onChange={(e) => setSelectedRequestNo(e.target.value)}
                    label="Request Number"
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          borderRadius: 2,
                          marginTop: 1,
                          bgcolor:colors.headerBgcolor,
                          color:"black",
                          fontWeight: 500,
                          
                        }
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.grey[300]
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography variant="body1" color="text.secondary">
                        Select a request
                      </Typography>
                    </MenuItem>
                    {requestNos.map((reqNo) => (
                      <MenuItem key={reqNo} value={reqNo}>
                        <Typography variant="subtitle1" fontWeight="500">
                          {reqNo}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        </Paper>

        {/* Request Details */}
        {headerData && (
          <>
            <Grid item xs={12} >
              <Paper sx={{ p: 3, borderRadius: 4, bgcolor: colors.headerBgcolor, boxShadow: theme.shadows[4] }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <AssignmentOutlined sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                  Request Details
                </Typography>
                <Grid container spacing={2} sx={{ bgcolor: colors.headerBgcolor }}>
                  {[{ label: 'Date of Request', value: headerData.dateOfRequest },
                  { label: 'Requested By', value: headerData.requestedBy },
                  { label: 'Request Source', value: headerData.requestSource },
                  { label: 'Site Location', value: headerData.site },
                  { label: 'Suggested PO#', value: headerData.suggestedPO },
                  { label: 'Authorization', value: headerData.authorizedApproval }].map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>{item.label}</Typography>
                        <Typography variant="body1" fontWeight="600">{item.value || 'N/A'}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Line Items (Not Scrollable) */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 4, boxShadow: theme.shadows[4] }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Inventory2Outlined sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                  Line Items
                </Typography>
                <Table sx={{ minWidth: '100%' }}>
                  <TableHead>
                    <TableRow>
                      {['S.No', 'Material', 'UoM', 'Qty Requested', 'Required By', 'Qty Available', 'Suggested', 'Proposed', 'Remarks'].map((header, index) => (
                        <TableCell key={index} sx={{ fontWeight: 'bold' }}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.sNo}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.uom}</TableCell>
                        <TableCell>{item.qtyRequested}</TableCell>
                        <TableCell>{item.requiredByDate}</TableCell>
                        <TableCell>{item.qtyAvailable}</TableCell>
                        <TableCell>{item.suggestedQty}</TableCell>
                        <TableCell>{item.proposedQty}</TableCell>
                        <TableCell>{item.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Approval Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 4, boxShadow: theme.shadows[4] }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <TextField
                        variant='filled'
                        label="Approved Manager"
                        value={user.name}
                        InputProps={{ readOnly: true }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleOutline />}
                        onClick={() => handleStatusUpdate('Approved')}
                      >
                        Approve Request
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelOutlined />}
                        onClick={() => handleStatusUpdate('Rejected')}
                      >
                        Reject Request
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      <AlertDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => {
          setDialog({ ...dialog, open: false });
          if (dialog.type !== 'error') {
            navigate('/');
          }
        }}
      />
    </Box>
  );
};

export default MaterialOrderedThroughPOReview;
