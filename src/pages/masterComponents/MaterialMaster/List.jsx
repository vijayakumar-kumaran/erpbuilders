import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  Pagination,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  FilterAlt,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../../config';

const MaterialList = ({ 
  openForm,
  setOpenForm,
  selectedMaterial,
  setSelectedMaterial,
  refreshListTrigger
}) => {
  const theme = useTheme();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/masters/materials`);
        setMaterials(res.data);
      } catch (err) {
        console.error('Failed to fetch materials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [refreshListTrigger]); 

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMaterials = useMemo(() => {
    if (!sortConfig.key) return materials;
    return [...materials].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [materials, sortConfig]);

  const filteredMaterials = useMemo(() => {
    return sortedMaterials.filter((mat) => {
      const matchesSearch = Object.values(mat).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCategory = categoryFilter ? mat.materialCategory === categoryFilter : true;
      const matchesSubcategory = subcategoryFilter ? mat.materialSubCategory === subcategoryFilter : true;
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [sortedMaterials, searchTerm, categoryFilter, subcategoryFilter]);

  const paginatedMaterials = filteredMaterials.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const categories = [...new Set(materials.map((mat) => mat.materialCategory))];
  const subcategories = [...new Set(materials.map((mat) => mat.materialSubCategory))];

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSubcategoryFilter('');
  };

  const handleEditClick = (material) => {
    setSelectedMaterial(material);
    setOpenForm(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              label="Subcategory"
            >
              <MenuItem value="">All</MenuItem>
              {subcategories.map((sub) => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Reset Filters">
            <IconButton onClick={resetFilters}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('name')}>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>UOM</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMaterials.map((mat) => (
                  <TableRow key={mat._id} hover>
                    <TableCell>{mat.materialName}</TableCell>
                    <TableCell>{mat.materialCode}</TableCell>
                    <TableCell><Chip label={mat.materialCategory} size="small" /></TableCell>
                    <TableCell><Chip label={mat.materialSubCategory} size="small" color="info" /></TableCell>
                    <TableCell>{mat.uom}</TableCell>
                    <TableCell>{mat.description}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(mat)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No materials found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={Math.ceil(filteredMaterials.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default MaterialList;