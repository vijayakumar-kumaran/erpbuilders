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
  Paper,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const POGroup = ({ poNumber, items, transactions }) => {
  const [open, setOpen] = React.useState(true);
  const transactionMap = {};

  // Create transaction map for this PO's items
  transactions.forEach(tx => {
    if (!transactionMap[tx.materialCode]) {
      transactionMap[tx.materialCode] = [];
    }
    transactionMap[tx.materialCode].push(tx);
  });

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: '#f5f5f5' }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={9}>
          <Typography variant="subtitle1" fontWeight="bold">
            PO: {poNumber}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small" sx={{ margin: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>UoM</TableCell>
                  <TableCell>Proposed Qty</TableCell>
                  <TableCell>Total Issued</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Issued To Site</TableCell>
                  <TableCell>Received By</TableCell>
                  <TableCell>Location/Vendor</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const {
                    materialCode,
                    materialName,
                    uom,
                    reqQty,
                    totalIssuedQty
                  } = item;

                  const txList = transactionMap[materialCode] || [];
                  const latestTx = txList[txList.length - 1] || {};

                  const balance = typeof reqQty === 'number' ? Math.max(0, reqQty - totalIssuedQty) : 'N/A';
                  const isComplete = typeof reqQty === 'number' && balance <= 0;

                  return (
                    <TableRow key={materialCode}>
                      <TableCell>{latestTx.issueDate ? new Date(latestTx.issueDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{materialName}</TableCell>
                      <TableCell>{uom}</TableCell>
                      <TableCell>{reqQty}</TableCell>
                      <TableCell>{totalIssuedQty}</TableCell>
                      <TableCell>{balance}</TableCell>
                      <TableCell>{latestTx.issuedToSite || 'N/A'}</TableCell>
                      <TableCell>{latestTx.receivedBy || 'N/A'}</TableCell>
                      <TableCell>{latestTx.stockLocation || latestTx.vendorName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={isComplete ? 'Completed' : 'Pending'}
                          color={isComplete ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const MaterialIssueSummary = ({ requestNo, items = [], transactions = [] }) => {
  if (!requestNo || !items.length) return null;

  // Filter out items with totalIssuedQty = 0
  const filteredItems = items.filter(item => item.totalIssuedQty > 0);

  // If no items left after filtering, return null
  if (filteredItems.length === 0) return null;

  // Group items by PO number (assuming each item has a poNumber property)
  const poGroups = {};
  filteredItems.forEach(item => {
    const poNumber = item.poNumber || 'No PO'; // Fallback if no PO number
    if (!poGroups[poNumber]) {
      poGroups[poNumber] = [];
    }
    poGroups[poNumber].push(item);
  });

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Existing Material Issues Summary
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Request No: {requestNo}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2, mb: 4, px:4, py:2 }}>
        <Table size="small">
          <TableBody>
            {Object.entries(poGroups).map(([poNumber, poItems]) => (
              <POGroup 
                key={poNumber}
                poNumber={poNumber}
                items={poItems}
                transactions={transactions.filter(tx => 
                  poItems.some(item => item.materialCode === tx.materialCode)
                )}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaterialIssueSummary;