import React, { useState } from 'react';
import {
  Paper, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

const VendorRateList = ({ data, onEdit, onAdd }) => {
  const [searchVendor, setSearchVendor] = useState('');

  const filteredData = data.filter(d =>
    d.vendorName.toLowerCase().includes(searchVendor.toLowerCase())
  );

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search Vendor Name"
              variant="outlined"
              size="medium"
              fullWidth
              value={searchVendor}
              onChange={e => setSearchVendor(e.target.value)}
              sx={{ bgcolor: 'background.paper' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} textAlign={{ xs: 'left', sm: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              size="large"
            >
              Add Vendor Rate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Vendor Code</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Vendor Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>End Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'primary.contrastText' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ fontStyle: 'italic' }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onEdit(row._id)}
                >
                  <TableCell>{row.vendorCode}</TableCell>
                  <TableCell>{row.vendorName}</TableCell>
                  <TableCell>{row.startDate ? dayjs(row.startDate).format('YYYY-MM-DD') : '-'}</TableCell>
                  <TableCell>{row.endDate ? dayjs(row.endDate).format('YYYY-MM-DD') : '-'}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(row._id);
                      }}
                      size="small"
                      color="primary"
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default VendorRateList;