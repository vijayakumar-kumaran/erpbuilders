import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Typography,
  Chip,
  Box,
  Pagination
} from '@mui/material';
import {
  Search,
  FilterAlt,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Edit,
  Delete,
  LocationOn,
  Category,
  Groups
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

const SiteSearchAndTable = ({
  searchTerm,
  setSearchTerm,
  fetchSites,
  paginatedSites,
  filteredSites,
  handleSort,
  sortConfig,
  page,
  setPage,
  rowsPerPage,
  statusColors,
  editSite,
  handleDeleteClick,
  formatDate
}) => {
  const theme = useTheme();

  return (
    <>
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
            placeholder="Search sites..."
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button variant="outlined" startIcon={<FilterAlt />} sx={{ borderRadius: 3 }}>
            Filters
          </Button>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchSites}
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

      {/* Sites Table */}
      <Paper elevation={0} sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: theme.shadows[2]
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.dark, 0.2)
                  : alpha(theme.palette.primary.light, 0.2)
              }}>
                {['Site Name', 'Location', 'Dates', 'Nature', 'Project Group', 'Status', 'Actions'].map((header, idx) => (
                  <TableCell key={header} sx={{ width: idx === 2 ? '10%' : '15%' }}>
                    {['Dates', 'Actions'].includes(header) ? header : (
                      <Button
                        onClick={() => handleSort(header.toLowerCase().replace(/\s/g, ''))}
                        endIcon={
                          sortConfig.key === header.toLowerCase().replace(/\s/g, '') ? (
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
                        {header}
                      </Button>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSites.map((site) => (
                <TableRow key={site._id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar>{site.siteName.charAt(0)}</Avatar>
                      <Typography fontWeight="medium" noWrap>{site.siteName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>{site.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip label={formatDate(site.startDate)} size="small" variant="outlined" />
                      <Chip label={formatDate(site.endDate)} size="small" variant="outlined" />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={site.nature}
                      size="small"
                      icon={<Category fontSize="small" />}
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    {site.projectGroup ? (
                      <Chip
                        label={site.projectGroup}
                        size="small"
                        icon={<Groups fontSize="small" />}
                        sx={{ borderRadius: 2 }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={site.status}
                      size="small"
                      color={statusColors[site.status]}
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => editSite(site)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(site)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography variant="h6">No sites found</Typography>
                      <Typography variant="body2">
                        {searchTerm ? 'Try a different search term' : 'Create your first site'}
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
          Showing {paginatedSites.length} of {filteredSites.length} sites
        </Typography>
        <Pagination
          count={Math.ceil(filteredSites.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          shape="rounded"
          color="primary"
          sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
        />
      </Box>
    </>
  );
};

export default SiteSearchAndTable;