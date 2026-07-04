// File: src/components/PurchaseOrder/lineItemPO.jsx
import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const LineItemPO = ({ items }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Items</Typography>
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Material Name</TableCell>
              <TableCell>UoM</TableCell>
              <TableCell>Req Qty</TableCell>
              <TableCell>Proposed Qty</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Delivery Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.sNo}</TableCell>
                <TableCell>{item.materialName}</TableCell>
                <TableCell>{item.uom}</TableCell>
                <TableCell>{item.qtyRequested}</TableCell>
                <TableCell>{item.proposedQty}</TableCell>
                <TableCell>{item.rate}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.deliveryLocation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default LineItemPO;