import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Alert,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
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
  alpha
} from '@mui/material';
import {
  Add,
  Edit,
  Refresh,
  Search,
  FilterAlt,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import SourceDialog from '../masterComponents/source/SourceDialog'; // adjust path if needed
import API_URL from '../../config';

const RequestSource = () => {
  const theme = useTheme();
  const [sources, setSources] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  const [form, setForm] = useState({
    sourceName: '',
    description: '',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sourceName', direction: 'asc' });
  const rowsPerPage = 8;

  const statusOptions = ['Active', 'Inactive'];
  const statusColors = { Active: 'success', Inactive: 'error' };
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/sources`);
      setSources(res.data);
      setFilteredSources(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sources: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  useEffect(() => {
    const results = sources.filter(source =>
      source.sourceName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSources(results);
    setPage(1);
  }, [searchTerm, sources]);

  const handleSubmit = async () => {
    setSuccess(null);
    setLoading(true);
    try {
      if (!form.sourceName) throw new Error('Source Name is required');
      const payload = { sourceName: form.sourceName, description: form.description, status: form.status };
      setError(null);
      if (isEditing) {
        await axios.put(`${API_URL}/api/masters/sources/${form._id}`, payload);
        setSuccess('Source updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/sources`, payload);
        setSuccess('Source created successfully!');
      }
      resetForm();
      fetchSources();
      setOpenDialog(false);
    } catch (err) {
      if (err.response?.data?.message === 'Duplicate Entry Found') {
        setErrorDialogMessage('Duplicate Entry Found.');
      } else {
        setErrorDialogMessage('An error occurred. Please try again.');
      }
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const editSource = (source) => {
    setForm({ _id: source._id, sourceName: source.sourceName, description: source.description, status: source.status || 'Active' });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setForm({ _id: '', sourceName: '', description: '', status: 'Active' });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedSources = [...filteredSources].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedSources = sortedSources.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
            📄 Source Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage all request sources in the system
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
            New Source
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
            placeholder="Search sources..."
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
              onClick={fetchSources}
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
      
      {/* Sources Table Section */}
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
                    onClick={() => handleSort('sourceName')}
                    endIcon={
                      sortConfig.key === 'sourceName' ? (
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
                    Source Name
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '45%' }}>
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
                <TableCell sx={{ width: '15%' }}>
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
              {paginatedSources.map((source) => (
                <TableRow 
                  key={source._id}
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
                        {source.sourceName.charAt(0)}
                      </Avatar>
                      <Typography fontWeight="medium" noWrap>
                        {source.sourceName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ width: '45%' }}>
                    <Typography variant="body2" noWrap>
                      {source.description || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '15%' }}>
                    <Chip 
                      label={source.status || 'Active'} 
                      size="small"
                      color={statusColors[source.status] || 'success'}
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '10%' }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => editSource(source)}
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
                     </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}>
                      <Typography sx={{ fontSize: 48, mb: 1, opacity: 0.5 }}>📄</Typography>
                      <Typography variant="h6">No sources found</Typography>
                      <Typography variant="body2">
                        {searchTerm ? 'Try a different search term' : 'Create your first source'}
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
          Showing {paginatedSources.length} of {filteredSources.length} sources
        </Typography>
        <Pagination
          count={Math.ceil(filteredSources.length / rowsPerPage)}
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
     <SourceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        statusOptions={statusOptions}
      />

      <Dialog
  open={errorDialogOpen}
  onClose={() => setErrorDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: 3,
      backgroundColor: '#fff5f5',
      border: '1px solid #f44336',
      boxShadow: 8,
    },
  }}
>
  <DialogTitle
    sx={{
      color: '#f44336',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    ⚠️ Error
  </DialogTitle>

  <DialogContent>
    <Typography sx={{ color: '#b71c1c', fontSize: '1rem' }}>
      {errorDialogMessage}
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setErrorDialogOpen(false)}
      sx={{
        color: '#f44336',
        borderColor: '#f44336',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: '#fddede',
          borderColor: '#f44336',
        },
      }}
      variant="outlined"
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default RequestSource;