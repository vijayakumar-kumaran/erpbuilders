import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Alert,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Refresh, 
  Search, 
  FilterAlt,
  CheckCircle,
  Straighten,
  Description as DescriptionIcon,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import API_URL from '../../config';

const UomMaster = () => {
  const theme = useTheme();
  const [uoms, setUoms] = useState([]);
  const [filteredUoms, setFilteredUoms] = useState([]);
  const [form, setForm] = useState({
    uom: '',
    description: '',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'uom', direction: 'asc' });
  const rowsPerPage = 8;

  const statusOptions = ['Active', 'Inactive'];
  const statusColors = {
    Active: 'success',
    Inactive: 'error'
  };

  const fetchUoms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/uom`);
      setUoms(res.data);
      setFilteredUoms(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch UoMs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUoms();
  }, []);

  useEffect(() => {
    const results = uoms.filter(uom =>
      uom.uom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (uom.status && uom.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUoms(results);
    setPage(1);
  }, [searchTerm, uoms]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!form.uom || !form.description) {
        throw new Error('UoM and Description are required');
      }

      const payload = {
        uom: form.uom,
        description: form.description,
        status: form.status
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/masters/uom/update/${form._id}`, payload);
        setSuccess('UoM updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/uom/create`, payload);
        setSuccess('UoM created successfully!');
      }

      resetForm();
      fetchUoms();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const editUom = (uom) => {
    setForm({
      _id: uom._id,
      uom: uom.uom,
      description: uom.description,
      status: uom.status || 'Active'
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({
      _id: '',
      uom: '',
      description: '',
      status: 'Active'
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUoms = [...filteredUoms].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedUoms = sortedUoms.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ 
      p: 4, 
      maxWidth: 1400, 
      mx: 'auto',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        background: theme.palette.mode === 'dark'
          ? 'rgba(30, 30, 30, 0.7)'
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[3]
      }}>
        <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
          <Typography variant="h3" fontWeight="bold" sx={{ 
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            📏 UoM Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage all units of measurement in the system
          </Typography>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={resetForm}
            sx={{
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            New UoM
          </Button>
        </motion.div>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
            {success}
          </Alert>
        </motion.div>
      )}

      {/* Search and Filter Bar */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 4, 
        borderRadius: 3,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search UoMs..."
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3
              }
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterAlt />}
            sx={{ borderRadius: 3 }}
          >
            Filters
          </Button>
          <Tooltip title="Refresh">
            <IconButton 
              onClick={fetchUoms}
              sx={{ 
                borderRadius: 2,
                background: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* UoM Form Section */}
      {(isEditing || !isEditing) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={0} sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme.shadows[2]
          }}>
            <Typography variant="h5" fontWeight="medium" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 3
            }}>
              {isEditing ? (
                <>
                  <Edit sx={{ mr: 1, color: 'primary.main' }} />
                  Edit UoM
                </>
              ) : (
                <>
                  <Add sx={{ mr: 1, color: 'primary.main' }} />
                  Create New UoM
                </>
              )}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="UoM"
                  name="uom"
                  value={form.uom}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    label="Status"
                    variant="outlined"
                    sx={{
                      borderRadius: 3
                    }}
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ 
                            mr: 1, 
                            fontSize: '1rem', 
                            color: theme.palette[statusColors[status]].main 
                          }} />
                          {status}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <motion.div whileHover={{ scale: 1.03 }}>
                    <Button
                      variant="contained"
                      startIcon={isEditing ? <Edit /> : <Add />}
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1,
                        background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      {isEditing ? 'Update UoM' : 'Create UoM'}
                    </Button>
                  </motion.div>
                  {isEditing && (
                    <motion.div whileHover={{ scale: 1.03 }}>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={resetForm}
                        disabled={loading}
                        sx={{ borderRadius: 3, px: 4, py: 1 }}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      )}

      {/* UoMs Table Section */}
      <Paper elevation={0} sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.shadows[2]
      }}>
        <TableContainer>
          <Table sx={{
            '& .MuiTableCell-root': {
              padding: '12px 16px',
              verticalAlign: 'middle'
            },
            '& .MuiTableCell-head': {
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }
          }}>
            <TableHead>
              <TableRow sx={{ 
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.dark, 0.2)
                  : alpha(theme.palette.primary.light, 0.2)
              }}>
                <TableCell sx={{ width: '30%' }}>
                  <Button 
                    onClick={() => handleSort('uom')}
                    endIcon={
                      sortConfig.key === 'uom' ? (
                        sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      ) : null
                    }
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      padding: 0,
                      justifyContent: 'flex-start',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    UoM
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <Button 
                    onClick={() => handleSort('description')}
                    endIcon={
                      sortConfig.key === 'description' ? (
                        sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      ) : null
                    }
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      padding: 0,
                      justifyContent: 'flex-start',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    Description
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <Button 
                    onClick={() => handleSort('status')}
                    endIcon={
                      sortConfig.key === 'status' ? (
                        sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                      ) : null
                    }
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      padding: 0,
                      justifyContent: 'flex-start',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    Status
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUoms.map((uom) => (
                <TableRow 
                  key={uom._id}
                  hover 
                  sx={{ 
                    '&:last-child td': { borderBottom: 0 },
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[1]
                    }
                  }}
                >
                  <TableCell sx={{ width: '30%' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36,
                        background: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.secondary.main, 0.2)
                          : alpha(theme.palette.secondary.main, 0.1)
                      }}>
                        {uom.uom.charAt(0)}
                      </Avatar>
                      <Typography fontWeight="medium">
                        {uom.uom}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ width: '50%' }}>
                    <Typography variant="body2">
                      {uom.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '10%' }}>
                    <Chip 
                      label={uom.status || 'Active'} 
                      size="small"
                      color={statusColors[uom.status] || 'success'}
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '10%' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => editUom(uom)}
                        sx={{
                          background: alpha(theme.palette.info.main, 0.1),
                          '&:hover': {
                            background: alpha(theme.palette.info.main, 0.2)
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUoms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}>
                      <Straighten sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography variant="h6">No UoMs found</Typography>
                      <Typography variant="body2">
                        {searchTerm ? 'Try a different search term' : 'Create your first UoM'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mt: 3,
        p: 2,
        borderRadius: 3,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)'
      }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedUoms.length} of {filteredUoms.length} UoMs
        </Typography>
        <Pagination
          count={Math.ceil(filteredUoms.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          shape="rounded"
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default UomMaster;