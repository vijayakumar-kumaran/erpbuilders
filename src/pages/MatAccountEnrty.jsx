// src/pages/MaterialAccountEntry.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import dayjs from 'dayjs';
import SearchableDropdown from '../components/reusable/SearchableDropdown';
import { useNavigate } from 'react-router-dom';
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';
import { useAuth } from '../AuthContext';
const MaterialAccountEntry = () => {
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [accountants, setAccountants] = useState([]);
  const [enteredBy, setEnteredBy] = useState('');
  const [vendorDC, setVendorDC] = useState('');
  const [vendorInvoice, setVendorInvoice] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const navigate = useNavigate()
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  const {user} = useAuth();
  const [invoiceAmountErrors, setInvoiceAmountErrors] = useState([]);

  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [poRes, accountantsRes] = await Promise.all([
          axios.get(`${API_URL}/api/mat-acc-entry/all`),
          axios.get(`${API_URL}/api/masters/users`),
        ]);
        setPoList(poRes.data);
        setAccountants(accountantsRes.data.map(a => a.name));
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Handle PO selection change
 const handlePOChange = (eOrPO) => {
` ` // Extract PO number depending on the input type
  let poNumber = '';
  if (typeof eOrPO === 'string') {
    poNumber = eOrPO;
  } else if (eOrPO && eOrPO.target) {
    poNumber = eOrPO.target.value;
  } else if (eOrPO && eOrPO.value) {
    poNumber = eOrPO.value;
  }

  const selected = poList.find(po => po.poNumber === poNumber);
    if (selected) {
      // Normalize line items
      const poWithReceivedFields = {
        ...selected,
        lineItems: (selected.lineItems || selected.poitems || []).map(item => ({
          ...item,
          poRate: item.rateInr || item.poRate || 0,
          poAmount: item.amount || item.poAmount || 0,
          receivedQty: item.receivedQty || item.poQty || 0,
          invoiceAmount: item.invoiceAmount || '',
          crNoteRaised: 'No',
          crNote: ''
        }))
      };
      setSelectedPO(poWithReceivedFields);
      setGstNumber(selected.gst || selected.vendorGst || '');
      setVendorDC(selected.vendorDC || '');
      setVendorInvoice(selected.vendorInvoice || '');
    }
  };


  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...selectedPO.lineItems];
    updatedItems[index][field] = value;
    setSelectedPO({...selectedPO, lineItems: updatedItems});
  };

  // Save handler
  const handleSave = async () => {

// Validate invoice amounts
const emptyInvoiceIndexes = selectedPO.lineItems
  .map((item, index) => ({ value: item.invoiceAmount, index }))
  .filter(entry => entry.value === '' || entry.value === null || entry.value === undefined);

if (emptyInvoiceIndexes.length > 0) {
  const updatedErrors = selectedPO.lineItems.map((_, i) =>
    emptyInvoiceIndexes.some(entry => entry.index === i)
  );

  setInvoiceAmountErrors(updatedErrors);

  setDialog({
    open: true,
    type: 'warning',
    title: 'Invoice Amount Required',
    message: `Please fill Invoice Amount for all items. You can enter 0 if you don't have an amount.`,
  });

  return;
} else {
  setInvoiceAmountErrors([]); // clear errors if all are filled
}
  if (!selectedPO) return;

  // ✅ Validation
  if (accountantVerification !== 'Yes') {
     setDialog({
        open: true,
        type: 'warning',
        title: 'Verify the Accountant Box',
        message: `Please verify with the accountant by selecting "Yes" for Accountant Verification.`
      });
    return;
  }
  if (user?.role !== 'Accountant') {
    setDialog({
      open: true,
      type: 'error',
      title: 'Permission Denied',
      message: `Only users with 'Accountant' role can submit this form.`,
    });
    return;
  }

  const payload = {
    poNumber: selectedPO.poNumber,
    vendorName: selectedPO.vendorName,
    vendorAddress: selectedPO.vendorAddress,
    vendorGst: gstNumber,
    dateOfPO: selectedPO.dateOfPO,
    vendorDc: vendorDC,
    vendorInvoice: vendorInvoice,
    accountantVerification: accountantVerification,
    accountantName: user?.name,
    lineItems: selectedPO.lineItems.map(item => ({
      ...item,
      crNoteRaised: item.creditNoteRaised || item.crNoteRaised,
      crNote: item.creditNoteNumber || item.crNote
    })),
    materialReceiptEnteredBy: enteredBy,
  };

  try {
    await axios.post(`${API_URL}/api/mat-acc-entry/save`, payload);
    setDialog({
      open: true,
      type: 'success',
      title: 'Receipt Account saved successfully!',
      message: `Account Entry created for: ${selectedPO.poNumber}`
    });
    
  } catch (err) {
    console.error('Error saving data:', err);
    setDialog({
      open: true,
      type: 'error',
      title: 'Account Entry Failed',
      message: `${err.message}: Please Check your Internet Connection.`,
    });
  }
};

  const [accountantVerification, setAccountantVerification] = useState('No');
  const [accountantName, setAccountantName] = useState('');

  return (
    <Container>
      <Box sx={{ p: 3}}>
        <Paper sx={{p:4, bgcolor:colors.headerBgcolor, borderRadius:3 }}>
        {/* Header */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Material Receipt Accounting Entry
        </Typography>         
            {/* new component */}
          <SearchableDropdown 
            options={poList.map(po => ({ label: po.poNumber, value: po.poNumber }))}
            label="Select PO"
            onChange={handlePOChange}
          />      
        </Paper>

        {selectedPO && (
          <>
           <Paper sx={{ p: 3, my: 2, bgcolor: colors.headerBgcolor, borderRadius: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Vendor Name"
                  value={selectedPO.vendorName || ''}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Date of PO"
                  value={dayjs(selectedPO.dateofPO).format('YYYY-MM-DD') || ''}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  sx={{minWidth:300}}
                  label="GST Number"
                  value={gstNumber || 'N/A'}
                  onChange={(e) => setGstNumber(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{readOnly:true}}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Vendor Address"
                  value={selectedPO.vendorAddress || ''}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  InputProps={{ readOnly: true }}
                  
                />
              </Grid>
              {/* Vendor DC on its own line */}
              <Grid item xs={12}>
                <TextField
                  label="Vendor DC"
                  value={vendorDC}
                  onChange={(e) => setVendorDC(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  sx={{bgcolor:'white'}}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Vendor Invoice"
                  value={vendorInvoice}
                  onChange={(e) => setVendorInvoice(e.target.value)}
                  fullWidth
                  size="small"
                  required
                  sx={{bgcolor:'white'}}
                />
              </Grid>

              
            </Grid>
          </Paper>

            {/* Line Items */}
            <Box mt={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>No of Tranasctions</TableCell>
                    <TableCell>Material Name</TableCell>
                    <TableCell>UoM</TableCell>
                    <TableCell>PO Qty</TableCell>
                    <TableCell>PO Rate</TableCell>
                    <TableCell>PO Amount</TableCell>
                    <TableCell>Received Qty</TableCell>
                    <TableCell>Invoice Amount</TableCell>
                    <TableCell>Cr. Note Raised</TableCell>
                    <TableCell>Cr. Note #</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPO.lineItems?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.sNo || i + 1}</TableCell>
                      <TableCell>{selectedPO.transactionCount  || ''}</TableCell>
                      <TableCell>{item.materialName || ''}</TableCell>
                      <TableCell>{item.uom || ''}</TableCell>
                      <TableCell>{item.poQty || 0}</TableCell>
                      <TableCell>{item.poRate || 0}</TableCell>
                      <TableCell>{item.poAmount || 0}</TableCell>
                      <TableCell>{item.receivedQty || ''}</TableCell>

                      <TableCell>
                        <TextField
                          value={item.invoiceAmount ?? 0}
                          onChange={(e) => handleLineItemChange(i, 'invoiceAmount', e.target.value)}
                          fullWidth
                          size="small"
                          required
			  error={!!invoiceAmountErrors[i]}
  			  helperText={invoiceAmountErrors[i] ? "Enter 0 if not applicable" : ''}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          select
                          value={item.crNoteRaised || item.creditNoteRaised || 'No'}
                          onChange={(e) => handleLineItemChange(i, 'crNoteRaised', e.target.value)}
                          fullWidth
                          size="small"
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </TextField>
                      </TableCell>

                      <TableCell>
                        <TextField
                          value={item.crNote || item.creditNoteNumber || ''}
                          onChange={(e) => handleLineItemChange(i, 'crNote', e.target.value)}
                          fullWidth
                          size="small"
                          disabled={(item.crNoteRaised || item.creditNoteRaised) !== 'Yes'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Footer */}
            <Box mt={3}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    
                    label="Accountant Verification "
                    select
                    fullWidth
                    value={accountantVerification}
                    onChange={(e) => setAccountantVerification(e.target.value)}
                    size="small"
                    sx={{minWidth:200}}
                    required
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                      label="Accountant Name"
                      variant='filled'
                      fullWidth
                      value={user?.name || ''}
                      InputProps={{ readOnly: true }}
                      sx={{ minWidth: 200 }}
                      required
                    />
                </Grid>
              </Grid>
            </Box>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </>
        )}
      </Box>
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

    </Container>
  );
};

export default MaterialAccountEntry;
