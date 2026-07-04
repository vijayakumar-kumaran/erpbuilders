// src/pages/materials/MaterialList.jsx
import React, { useEffect, useState } from 'react';
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
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';
import MaterialForm from './Form';

const MaterialList = ({ onEdit }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openForm, setOpenForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

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
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedMaterials = React.useMemo(() => {
    if (!sortConfig.key) return materials;

    return [...materials].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [materials, sortConfig]);

  const filteredMaterials = React.useMemo(() => {
    return sortedMaterials.filter((mat) => {
      const matchesSearch = Object.values(mat).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCategory = categoryFilter
        ? mat.materialCategory === categoryFilter
        : true;
      const matchesSubcategory = subcategoryFilter
        ? mat.materialSubCategory === subcategoryFilter
        : true;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [sortedMaterials, searchTerm, categoryFilter, subcategoryFilter]);

  const categories = [...new Set(materials.map((mat) => mat.materialCategory))];
  const subcategories = [
    ...new Set(materials.map((mat) => mat.materialSubCategory)),
  ];

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSubcategoryFilter('');
  };

  const handleEditClick = (material) => {
    setSelectedMaterial(material);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedMaterial(null);
  };

  const handleSaveComplete = () => {
    handleFormClose();
    // You might want to add a refresh mechanism here
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" gutterBottom>
          Material Master
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Material
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
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
              <MenuItem value="">All Subcategories</MenuItem>
              {subcategories.map((sub) => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Reset filters">
            <IconButton onClick={resetFilters}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell
                sx={{ color: 'common.white', cursor: 'pointer' }}
                onClick={() => handleSort('materialCode')}
              >
                Code
                {sortConfig.key === 'materialCode' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
              <TableCell
                sx={{ color: 'common.white', cursor: 'pointer' }}
                onClick={() => handleSort('materialName')}
              >
                Name
                {sortConfig.key === 'materialName' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
              <TableCell
                sx={{ color: 'common.white', cursor: 'pointer' }}
                onClick={() => handleSort('materialCategory')}
              >
                Category
                {sortConfig.key === 'materialCategory' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
              <TableCell
                sx={{ color: 'common.white', cursor: 'pointer' }}
                onClick={() => handleSort('materialSubCategory')}
              >
                Subcategory
                {sortConfig.key === 'materialSubCategory' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
              <TableCell
                sx={{ color: 'common.white', cursor: 'pointer' }}
                onClick={() => handleSort('uom')}
              >
                UOM
                {sortConfig.key === 'uom' && (
                  <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
              <TableCell sx={{ color: 'common.white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((mat) => (
                <TableRow key={mat._id} hover>
                  <TableCell>{mat.materialCode}</TableCell>
                  <TableCell>{mat.materialName}</TableCell>
                  <TableCell>{mat.materialCategory}</TableCell>
                  <TableCell>{mat.materialSubCategory}</TableCell>
                  <TableCell>{mat.uom}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(mat)}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No materials found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MaterialForm
        open={openForm}
        onClose={handleFormClose}
        selectedMaterial={selectedMaterial}
        onSaveComplete={handleSaveComplete}
      />
    </Box>
  );
};

export default MaterialList;