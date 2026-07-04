import React, { useState, useEffect } from 'react';
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
  Divider,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import { 
  Add, 
  Refresh,
  Search, 
  Category,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import API_URL from '../../config';
import { Autocomplete } from '@mui/material';


const WorkStageCategoryMaster = () => {
  const theme = useTheme();

  const [form, setForm] = useState({ category: '', subCategory: '' });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);

  const rowsPerPage = 8;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/wsc`);
      setData(res.data);
      setFilteredData(res.data);
      setError(null);

      // Unique categories
      const categories = [...new Set(res.data.map(item => item.category))];
      setCategoryOptions(categories);

      // Subcategory based on current form.category
      const allSubCategories = res.data.map(item => item.subCategory);
      const used = res.data
        .filter(item => item.category === form.category)
        .map(item => item.subCategory);

      const filteredSubCategories = [...new Set(allSubCategories)].filter(
        sc => !used.includes(sc)
      );
      setSubCategoryOptions(filteredSubCategories);
    } catch (err) {
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      const used = data
        .filter(item => item.category === value)
        .map(item => item.subCategory);

      const allSubCategories = data.map(item => item.subCategory);

      const filteredSubCategories = [...new Set(allSubCategories)].filter(
        sc => !used.includes(sc)
      );

      setSubCategoryOptions(filteredSubCategories);

      setForm(prev => ({ ...prev, category: value, subCategory: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!form.category || !form.subCategory) throw new Error('Both fields are required');

      await axios.post(`${API_URL}/api/masters/wsc/create`, form);
      setSuccess('Category/Subcategory created successfully!');
      setForm({ category: '', subCategory: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const results = data.filter(item =>
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(results);
    setPage(1);
  }, [searchTerm, data]);
  

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
        <div>
          <Typography variant="h3" fontWeight="bold" sx={{ 
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            � Category Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage work stage categories and subcategories
          </Typography>
        </div>
        
        <Button 
          variant="contained" 
          startIcon={<Add />}
          sx={{
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          New Category
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
     

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
            placeholder="Search categories..."
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
          <Tooltip title="Refresh">
            <IconButton 
              onClick={loadData}
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

      {/* Category Form Section */}
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
          <Add sx={{ mr: 1, color: 'primary.main' }} />
          Create New Category
        </Typography>

        <Stack spacing={3}>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
           <Autocomplete
              freeSolo
              options={categoryOptions}
              value={form.category}
              onInputChange={(event, newInputValue) => {
                setForm(prev => ({ ...prev, category: newInputValue, subCategory: '' }));

                const used = data
                  .filter(item => item.category === newInputValue)
                  .map(item => item.subCategory);

                const allSubCategories = data.map(item => item.subCategory);

                const filteredSubCategories = [...new Set(allSubCategories)].filter(
                  sc => !used.includes(sc)
                );

                setSubCategoryOptions(filteredSubCategories);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    width: { xs: '100%', sm: '250px', md: '300px' }, // responsive widths
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                  ListboxProps={{
                    style: {
                      maxHeight: 200,
                      overflow: 'auto',
                    }
                  }}
                />
              )}
            />

           <Autocomplete
            freeSolo
            options={subCategoryOptions}
            value={form.subCategory}
            onInputChange={(event, newInputValue) => {
              setForm(prev => ({ ...prev, subCategory: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sub Category"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                   width: { xs: '100%', sm: '250px', md: '300px' }, // responsive widths
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
                ListboxProps={{
                  style: {
                    maxHeight: 200,
                    overflow: 'auto',
                  }
                }}
              />
            )}
          />
          </Stack>

           {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
            {success}
          </Alert>
        )}
          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
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
              Create Category
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Categories Table Section */}
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
                <TableCell sx={{ width: '10%' }}>
                  #
                </TableCell>
                <TableCell sx={{ width: '45%' }}>
                  <Button 
                    onClick={() => handleSort('category')}
                    endIcon={
                      sortConfig.key === 'category' ? (
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
                    Category
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '45%' }}>
                  <Button 
                    onClick={() => handleSort('subCategory')}
                    endIcon={
                      sortConfig.key === 'subCategory' ? (
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
                    Sub Category
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, idx) => (
                <TableRow 
                  key={item._id}
                  hover 
                  sx={{ 
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': {
                      boxShadow: theme.shadows[1]
                    }
                  }}
                >
                  <TableCell sx={{ width: '10%' }}>
                    <Typography color="text.secondary">
                      {(page - 1) * rowsPerPage + idx + 1}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '45%' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ 
                        width: 36, 
                        height: 36,
                        background: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.success.main, 0.2)
                          : alpha(theme.palette.success.light, 0.3)
                      }}>
                        <Category fontSize="small" />
                      </Avatar>
                      <Typography fontWeight="medium">
                        {item.category}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ width: '45%' }}>
                    <Chip 
                      label={item.subCategory} 
                      size="medium" 
                      icon={<Category fontSize="small" />}
                      sx={{ 
                        borderRadius: 2,
                        maxWidth: '100%',
                        background: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.info.main, 0.2)
                          : alpha(theme.palette.info.light, 0.3)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: 'text.secondary'
                    }}>
                      <Category sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography variant="h6">No categories found</Typography>
                      <Typography variant="body2">
                        {searchTerm ? 'Try a different search term' : 'Create your first category'}
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
          Showing {paginatedData.length} of {filteredData.length} categories
        </Typography>
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
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

export default WorkStageCategoryMaster;