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
  InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Refresh, Search } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../../config';

const WorkStageList = ({ onEdit }) => {
  const theme = useTheme();
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 8;

  const fetchStages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/stages`);
      setStages(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const filteredStages = stages.filter(stage =>
    Object.values(stage).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedStages = filteredStages.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Work Stages List</Typography>
        <TextField
          size="small"
          placeholder="Search stages..."
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
                <TableCell>Category</TableCell>
                <TableCell>Subcategory</TableCell>
                <TableCell>Stage Name</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStages.length > 0 ? (
                paginatedStages.map((s) => (
                  <TableRow key={s._id} hover>
                    <TableCell>{s.category}</TableCell>
                    <TableCell>{s.subCategory}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <Chip label={s.uom} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {s.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(s)}>
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No stages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedStages.length} of {filteredStages.length} stages
        </Typography>
        <Pagination
          count={Math.ceil(filteredStages.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default WorkStageList;