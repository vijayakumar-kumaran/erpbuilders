import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const TransactionHistoryTable = ({ transactions = [] }) => {
  if (!transactions.length) return null;

  // Calculate total quantity
  const totalQty = transactions.reduce((sum, t) => sum + (t.issueQty || 0), 0);

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Past Issue Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell>S.No.</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Material Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>UoM</TableCell>
              <TableCell>Issued To Site</TableCell>
              <TableCell>Received By</TableCell>
              <TableCell>Stock Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t, index) => (
              <TableRow key={index}>
                <TableCell>{index+1}</TableCell>
                <TableCell>{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                <TableCell>{t.materialName}</TableCell>
                <TableCell>{t.issueQty}</TableCell>
                <TableCell>{t.uom}</TableCell>
                <TableCell>{t.issuedToSite}</TableCell>
                <TableCell>{t.receivedBy}</TableCell>
                <TableCell>{t.stockLocation}</TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
           <TableRow>
            <TableCell colSpan={2} /> {/* Empty cells to align "Total" under Material Name */}
            <TableCell><strong>Total</strong></TableCell>
            <TableCell><strong>{totalQty}</strong></TableCell>
            <TableCell colSpan={4} />
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionHistoryTable;
