import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ArrowDownward from '@mui/icons-material/ArrowDownward'; // 🔧 Add this line

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
  Edit,
  Category
} from '@mui/icons-material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import API_URL from '../../config';
import { Autocomplete } from '@mui/material';

const MaterialCategoryMaster = () => {
  const theme = useTheme();
  const [form, setForm] = useState({
    materialCategory: '',
    materialSubCategory:'',
    materialCode: ''
  });
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'materialCategory', direction: 'asc' });
  const rowsPerPage = 8;

  const categoryOptions = [
  ...new Set(categories.map((item) => item.materialCategory))
];

  const allSubCategories = [
    ...new Set(categories.map((item) => item.materialSubCategory))
  ];

  const usedSubCategories = categories
    .filter(item => item.materialCategory === form.materialCategory)
    .map(item => item.materialSubCategory);

  const subCategoryOptions = allSubCategories.filter(sc => !usedSubCategories.includes(sc));


  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/mat-cat`);
      setCategories(res.data.data);
      setFilteredCategories(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const results = categories.filter(cat =>
      cat.materialCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.materialCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(results);
    setPage(1);
  }, [searchTerm, categories]);

  const handleGenerate = async (category, subcategory) => {
    setForm(prev => ({
      ...prev,
      materialCategory: category,
      materialSubCategory: subcategory
    }));

    // Don't regenerate code while editing
    if (editId) return;

    try {
      // 🔍 Check for duplicate before generating code
      const duplicateCheck = await axios.get(`${API_URL}/api/masters/mat-cat`);
      const exists = duplicateCheck.data.data.find(
        cat =>
          cat.materialCategory.toLowerCase() === category.toLowerCase() &&
          cat.materialSubCategory.toLowerCase() === subcategory.toLowerCase()
      );

      if (exists) {
        setError('This category and subcategory combination already exists');
        setForm(prev => ({ ...prev, materialCode: 'Already exists' }));
        return;
      }

      // ✅ Generate only if no duplicate
      const res = await axios.get(
        `${API_URL}/api/masters/mat-cat/next-code/${category}/${subcategory}`
      );
      const newCode = res.data.newCode;
      setForm(prev => ({ ...prev, materialCode: newCode }));
    } catch (err) {
      setError('Error generating material code');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!form.materialCategory) throw new Error('Category is required');

      if (editId) {
        await axios.put(`${API_URL}/api/masters/mat-cat/update/${editId}`, {
          materialCategory: form.materialCategory,
          materialSubCategory: form.materialSubCategory,
          materialCode: form.materialCode
        });

        setSuccess('Category updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/mat-cat/create`, {
          materialCategory: form.materialCategory,
          materialSubCategory: form.materialSubCategory,
          materialCode: form.materialCode
        });

        setSuccess('Category created successfully!');
      }

      setForm({
        materialCategory: '',
        materialSubCategory: '',
        materialCode: ''
      });
      setEditId(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({
      materialCategory: cat.materialCategory,
      materialSubCategory: cat.materialSubCategory,
      materialCode: cat.materialCode
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedCategories = sortedCategories.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
            🏷️ Material Categories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage material categories and their codes
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditId(null);
            setForm({
              materialCategory: '',
              materialCode: ''
            });
          }}
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
              onClick={loadCategories}
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
          {editId ? (
            <>
              <Edit sx={{ mr: 1, color: 'primary.main' }} />
              Edit Category
            </>
          ) : (
            <>
              <Add sx={{ mr: 1, color: 'primary.main' }} />
              Create New Category
            </>
          )}
        </Typography>

        <Stack spacing={3}>
          <Autocomplete
              freeSolo
              options={categoryOptions}
              value={form.materialCategory}
              onChange={(event, newValue) => {
                setForm(prev => ({ ...prev, materialCategory: newValue || '' }));
                if (form.materialSubCategory) {
                  handleGenerate(newValue || '', form.materialSubCategory);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setForm(prev => ({ ...prev, materialCategory: newInputValue }));
                if (form.materialSubCategory) {
                  handleGenerate(newInputValue, form.materialSubCategory);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material Category"
                  required
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
              )}
              fullWidth
            />

            <Autocomplete
              freeSolo
              options={subCategoryOptions}
              value={form.materialSubCategory}
              onChange={(event, newValue) => {
                setForm(prev => ({ ...prev, materialSubCategory: newValue || '' }));
                if (form.materialCategory) {
                  handleGenerate(form.materialCategory, newValue || '');
                }
              }}
              onInputChange={(event, newInputValue) => {
                setForm(prev => ({ ...prev, materialSubCategory: newInputValue }));
                if (form.materialCategory) {
                  handleGenerate(form.materialCategory, newInputValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Material Sub Category"
                  required
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    maxHeight: 200, // scroll height
                    overflowY: 'auto'
                  }
                }
              }}
              fullWidth
            />

            <TextField
              label="Material Code"
              value={form.materialCode}
              fullWidth
              disabled
              variant="outlined"
              error={form.materialCode === 'Already exists'}
              helperText={form.materialCode === 'Already exists' ? 'This category-subcategory combination already exists' : ''}
              InputProps={{
                startAdornment: <Category sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />

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
              startIcon={editId ? <Edit /> : <Add />}
              onClick={handleSubmit}
              disabled={loading || form.materialCode === 'Already exists'}
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
              {editId ? 'Update Category' : 'Create Category'}
            </Button>
            {editId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setEditId(null);
                  setForm({
                    materialCategory: '',
                    materialSubCategory: '',
                    materialCode: ''
                  });
                }}
                disabled={loading}
                sx={{ borderRadius: 3, px: 4, py: 1 }}
              >
                Cancel
              </Button>
            )}
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
                    onClick={() => handleSort('materialCategory')}
                    endIcon={
                      sortConfig.key === 'materialCategory' ? (
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
                    onClick={() => handleSort('materialCategory')}
                    endIcon={
                      sortConfig.key === 'materialCategory' ? (
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
                <TableCell sx={{ width: '30%' }}>
                  <Button
                    onClick={() => handleSort('materialCode')}
                    endIcon={
                      sortConfig.key === 'materialCode' ? (
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
                    Code
                  </Button>
                </TableCell>
                <TableCell sx={{ width: '15%' }}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCategories.map((cat, idx) => (
                <TableRow
                  key={cat._id}
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
                        {cat.materialCategory}
                      </Typography>
                    </Stack>
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
                        {cat.materialSubCategory}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ width: '30%' }}>
                    <Chip
                      label={cat.materialCode}
                      size="medium"
                      sx={{
                        borderRadius: 2,
                        maxWidth: '100%',
                        background: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.info.main, 0.2)
                          : alpha(theme.palette.info.light, 0.3)
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ width: '15%' }}>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
          Showing {paginatedCategories.length} of {filteredCategories.length} categories
        </Typography>
        <Pagination
          count={Math.ceil(filteredCategories.length / rowsPerPage)}
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

export default MaterialCategoryMaster;