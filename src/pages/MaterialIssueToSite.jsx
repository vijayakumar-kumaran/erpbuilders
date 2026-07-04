import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import NewEntryRow from './MaterialIssueMaster/NewEntry';
import MaterialIssueSummary from './MaterialIssueMaster/MaterialIssueSummary';
import { useAuth } from '../AuthContext';
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';

const MaterialIssueToSite = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [newEntries, setNewEntries] = useState([]);
  const [requestSource, setRequestSource] = useState(null);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receivedQtys, setReceivedQtys] = useState({});
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [reqRes, siteRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/api/mis/all-material-requests`),
        axios.get(`${API_URL}/api/masters/sites`),
        axios.get(`${API_URL}/api/masters/users`)
      ]);
      setRequests(reqRes.data);
      setSites(siteRes.data);
      setUsers(userRes.data);
    };
    fetchData();
  }, []);

  const handleRequestSelect = async (requestNo) => {
    const request = requests.find(r => r.requestNo === requestNo);
    if (!request) return;

    try {
      const [issueRes, receivedRes] = await Promise.all([
        axios.get(`${API_URL}/api/mis/material-issue/${encodeURIComponent(requestNo)}`),
        axios.get(`${API_URL}/api/mis/accumulated-received/${encodeURIComponent(requestNo)}`)
      ]);
      console.log(issueRes.data)

      const { source, items, transactions } = issueRes.data;
      const receivedQtys = receivedRes.data;

      setRequestSource(source);
      setItems(items || []);
      setTransactions(transactions || []);
      setSelectedRequest(request);
      setReceivedQtys(receivedQtys);

      const issuedMap = {};
      items.forEach(i => {
        issuedMap[i.materialCode] = i.totalIssuedQty || 0;
      });

      // Filter out items where availableToIssue would be 0
      const incompleteItems = request.items.filter(item => {
        const proposedQty = item.proposedQty ?? item.qty;
        const issuedQty = issuedMap[item.materialCode] || 0;
        const receivedData = receivedQtys[item.materialCode] || {};
        const totalReceived = receivedData.totalReceived || 0;
        const availableToIssue = totalReceived - issuedQty;
        
        // Only include items where there's something to issue
        return proposedQty !== issuedQty && availableToIssue > 0;
      });

      const initialEntries = incompleteItems.map(item => {
        const proposedQty = item.proposedQty ?? item.qty;
        const receivedData = receivedQtys[item.materialCode] || {};
        const totalReceived = receivedData.totalReceived || 0;
        const alreadyIssued = issuedMap[item.materialCode] || 0;
        const availableToIssue = totalReceived - alreadyIssued;

        const issueQty = 0;
        const hasError = issueQty <= 0 || issueQty > availableToIssue;

        return {
          ...item,
          issueQty,
          reqQty: proposedQty,
          balanceQty: proposedQty - alreadyIssued,
          availableToIssue,
          issuedToSite: request.site || '',
          receivedBy: user?.name || '',
          destinationType: 'site',
          stockLocation: null,
          vendor: null,
          status: 'Accepted',
          remarks: '',
          hasError,
        };
      });

      setNewEntries(initialEntries);
    } catch (error) {
      console.error('Error fetching request details:', error);
      setDialog({
        open: true,
        type: 'error',
        title: 'Failed to load request details',
        message: `Something went Wrong, Please Check your Internet Connection.`,
      });
    }
  };

  const handleEntryChange = (index, field, value) => {
    const updated = [...newEntries];
    updated[index][field] = value;

    if (field === 'issueQty') {
      const issueQty = parseFloat(value) || 0;
      const availableToIssue = updated[index].availableToIssue || 0;
      const alreadyIssued = items.find(i => i.materialCode === updated[index].materialCode)?.totalIssuedQty || 0;

      updated[index].balanceQty = updated[index].reqQty - (alreadyIssued + issueQty);
    }

    const issueQty = parseFloat(updated[index].issueQty) || 0;
    const availableToIssue = updated[index].availableToIssue || 0;
    const isStockLocationInvalid = updated[index].destinationType === 'site' && !updated[index].stockLocation;
    const isVendorInvalid = updated[index].destinationType === 'vendor' && !updated[index].vendor;
    const isIssueQtyInvalid = issueQty <= 0 || issueQty > availableToIssue;

    updated[index].hasError = isIssueQtyInvalid || isStockLocationInvalid || isVendorInvalid;

    setNewEntries(updated);
  };

  const handleSubmit = async () => {
    setSubmissionAttempted(true);
    if (newEntries.length === 0) {
      setDialog({
        open: true,
        type: 'warning',
        title: 'No Entries to Submit',
        message: `All materials in this request are already fully issued.`
      });
      return;
    }

    const errorEntries = newEntries.filter(row => row.hasError);
    if (errorEntries.length > 0) {
      const messages = errorEntries.map((row, idx) => {
        const problems = [];
        if (!row.stockLocation && row.destinationType === 'site') problems.push('Missing stock location');
        if (!row.vendor && row.destinationType === 'vendor') problems.push('Missing vendor');
        if (!row.issueQty || row.issueQty <= 0) problems.push('Issue Qty must be Greater than 0, Before issuing materials to the site, ensure that a receipt entry has been recorded for the material.');
        if (row.issueQty > row.availableToIssue) problems.push('Issue Qty exceeds available stock');
        return `Row ${idx + 1}: ${problems.join(', ')}`;
      }).join('\n');

      setDialog({
        open: true,
        type: 'warning',
        title: 'Invalid Entries Detected',
        message: `Please fix the following errors before submitting:\n\n${messages}`
      });
      return;
    }

    try {
      const payload = {
        requestNo: selectedRequest.requestNo,
        site: selectedRequest.site,
        enteredBy: user.name,
       
        items: newEntries.map(entry => ({
          materialCode: entry.materialCode,
          materialName: entry.materialName,
          uom: entry.uom,
          reqQty: entry.reqQty,
          issueQty: entry.issueQty,
          issuedToSite: entry.issuedToSite,
          receivedBy: entry.receivedBy,
          destinationType: entry.destinationType,
          stockLocation: entry.stockLocation || null,
          vendor: entry.vendor || null,
          status: entry.status,
          remarks: entry.remarks || ''
        }))
      };
      console.log(payload)
      await axios.post(`${API_URL}/api/mis/save`, payload);
      
      setDialog({
        open: true,
        type: 'success',
        title: 'Request Created',
        message: `Materials issued successfull for : ${selectedRequest.requestNo}`
      });
     
    } catch (error) {
      console.error('Error submitting issue:', error);
      
      setDialog({
        open: true,
        type: 'error',
        title: 'Failed to submit material issue',
        message: `Something went Wrong, Please Check your Internet Connection.`
      });
    }
  };

  return (
    <Box p={4}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: colors.headerBgcolor }}>
        <Typography variant="h5" gutterBottom>Material Issue</Typography>

        <TextField
          select
          label="Select Request"
          value={selectedRequest?.requestNo || ''}
          onChange={(e) => handleRequestSelect(e.target.value)}
          fullWidth
          margin="normal"
        >
          {requests.map(req => (
            <MenuItem key={req.requestNo} value={req.requestNo}>
              {req.requestNo}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {selectedRequest && (
        <>
          <Box mt={2} mb={2}>
            <Typography>Site: {selectedRequest.site}</Typography>
            <Typography>Request No: {selectedRequest.requestNo}</Typography>
            {newEntries.length === 0 && (
                <Typography color="textSecondary">
                  All items for this request have been fully issued or have 0 available quantity to issue.
                </Typography>
              )}
          </Box>
          
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: colors.contentBgcolor }}>
            {requestSource === "MaterialIssue" && transactions.length > 0 && (
              <MaterialIssueSummary
                requestNo={selectedRequest.requestNo}
                transactions={transactions}
                items={items}
              />
            )}
          </Paper>
          {newEntries.length !== 0 && (
            <TableContainer sx={{ my: 2, border: '0.5px solid gray', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Material</TableCell>
                    <TableCell>UoM</TableCell>
                    <TableCell>Proposed Qty</TableCell>
                    <TableCell>Issue Qty</TableCell>
                    <TableCell>Issue To Site</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Stock Location / vendor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newEntries.map((entry, index) => (
                    <NewEntryRow
                      key={index}
                      index={index}
                      entry={entry}
                      sites={sites}
                      users={users}
                      onChange={handleEntryChange}
                      onRemove={() => {
                        const updated = [...newEntries];
                        updated.splice(index, 1);
                        setNewEntries(updated);
                      }}
                      submissionAttempted={submissionAttempted}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={newEntries.length === 0}
            >
              {newEntries.length === 0 ? 'No Items to Issue' : 'Submit Issue'}
            </Button>
          </Box>
        </>
      )}
      <AlertDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => {
          setDialog({ ...dialog, open: false });
          if (dialog.type === 'success') {
            navigate('/');
          }
        }}
      />
    </Box>
  );
};

export default MaterialIssueToSite;
