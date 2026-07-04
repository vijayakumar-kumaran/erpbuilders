import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton,
  Paper, TableContainer, TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs';

const OpeningStockList = ({ stockList, onAddNew, onEdit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Opening Stock Records</Typography>
        <Button 
          variant="contained" 
          onClick={onAddNew}
          sx={{ mb: 2 }}
        >
          Add New
        </Button>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Material Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Site Name</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{dayjs(row.date).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>{row.materialName}</TableCell>
                    <TableCell>{row.materialCode}</TableCell>
                    <TableCell>{row.site}</TableCell>
                    <TableCell>{row.openingQty}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => onEdit(row)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {stockList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={stockList.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[15]}
        />
      </Paper>
    </Box>
  );
};

export default OpeningStockList;