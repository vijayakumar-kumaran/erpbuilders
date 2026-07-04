import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  alpha,
  Pagination,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { Edit as EditIcon, Search } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';
import VendorRateModal from './VendorRateModal';

const VendorList = ({ onEdit }) => {
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 8;

  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedRates, setSelectedRates] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const [selectedVendorCode, setSelectedVendorCode] = useState('');

  const handleViewRates = async (vendorCode, vendorName) => {
    setRateLoading(true);
    setSelectedVendorName(vendorName);
    setSelectedVendorCode(vendorCode);

    try {
      const res = await axios.get(`${API_URL}/api/masters/rateall/${vendorCode}`);
      setSelectedRates(res.data || []);
    } catch (error) {
      console.error('Error fetching vendor rates:', error);
      setSelectedRates([]); // fallback to empty
    } finally {
      setRateLoading(false);
      setRateModalOpen(true); // ✅ Always open modal
    }
  };




  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/masters/vendors`);
      setVendors(res.data);
    } catch (err) {
      console.error('Vendor fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filtered = vendors.filter(vendor =>
    Object.values(vendor).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Vendor List</Typography>
        <TextField
          size="small"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ width: 300, background: 'white', borderRadius: 2 }}
        />
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          boxShadow: theme.shadows[2]
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell>Vendor Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>GST</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Rates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((v) => (
                  <TableRow key={v._id} hover>
                    <TableCell>{v.vendorCode}</TableCell>
                    <TableCell>{v.vendorName}</TableCell>
                    <TableCell>{v.gstRegistered}</TableCell>
                    <TableCell>{v.phone1}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleViewRates(v.vendorCode, v.vendorName)}
                      >
                        View All
                      </Button>

                    </TableCell>

                    <TableCell>
                      <Chip
                        label={v.status}
                        size="small"
                        color={v.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(v)}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No vendors found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginated.length} of {filtered.length} vendors
        </Typography>
        <Pagination
          count={Math.ceil(filtered.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          shape="rounded"
          color="primary"
        />
      </Box>
      <VendorRateModal
        open={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        rates={selectedRates}
        vendorName={selectedVendorName}
        vendorCode={selectedVendorCode}
        refresh={() => handleViewRates(selectedVendorCode, selectedVendorName)}
      />

    </Box>
  );
};

export default VendorList;