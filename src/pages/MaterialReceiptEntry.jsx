// src/pages/MaterialReceiptEntry.jsx
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
import { useNavigate } from 'react-router-dom';
import MaterialDropdown from '../components/reusable/TypeAheadDrop';
import { useAuth } from '../AuthContext';
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';

const MaterialReceiptEntry = () => {
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [enteredBy, setEnteredBy] = useState('');
  const [grnNumber, setGrnNumber] = useState('');
  const [vendorDc, setVendorDc] = useState('');
  const [vendorInvoice, setVendorInvoice] = useState('');
  const [existingGRN, setExistingGRN] = useState(null);
  const [isExistingGRN, setIsExistingGRN] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errors, setErrors] = useState({
    vendorDc: false,
    vendorInvoice: false,
    receivedQty: [],
    receivedBy: []
  });
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [poRes, usersRes, locRes, grnRes] = await Promise.all([
          axios.get(`${API_URL}/api/mat-entry/all`),
          axios.get(`${API_URL}/api/masters/users`),
          axios.get(`${API_URL}/api/masters/sites`),
          axios.get(`${API_URL}/api/mat-entry/next-grn-number`),
        ]);

        setPoList(poRes.data);
        setUsers(usersRes.data.map(u => u.name));
        setGrnNumber(grnRes.data.nextGRN);
        const activeLocations = locRes.data.filter(s => s.status === 'Active').map(s => s.siteName);
        console.log(activeLocations)
        setLocations(activeLocations);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Before this function inside MaterialReceiptEntry component
  const handlePOChange = async (e) => {
    const poNumber = e.target.value;
    const selected = poList.find(po => po.poNumber === poNumber);

    if (selected) {
      let grnData = null;

      try {
        const res = await axios.get(`${API_URL}/api/mat-entry/existing/${encodeURIComponent(poNumber)}`);
        grnData = res.data;

      } catch (err) {
        console.warn('No existing GRN found for this PO:', poNumber);
      }

      const isExisting = !!grnData;
      const existingLineItems = grnData?.lineItems || [];

      const poWithFields = {
        ...selected,
        poitems: selected.poitems.map(item => {
          const matched = existingLineItems.find(li => li.materialName === item.materialName);
          const alreadyReceived = matched ? Number(matched.receivedQty || 0) : 0;

          return {
            ...item,
            rateInr: Number(item.rate) || 0,
            amount: item.amount || 0,
            receivedQty: '',
            alreadyReceivedQty: alreadyReceived,
            receivedBy: matched?.receivedBy || '',
            receivingLocation: matched?.receivingLocation || '',
            directToSite: matched?.directToSite || 'No',
          };
        }),
      };

      setSelectedPO(poWithFields);
      setExistingGRN(grnData?._id || null);
      setIsExistingGRN(isExisting);

      if (isExisting && grnData?.grnNumber) {
        setGrnNumber(grnData.grnNumber); // Reuse same GRN number
      } else {
        // ✅ Fetch a fresh GRN number again if no existing GRN
        const nextGrnRes = await axios.get(`${API_URL}/api/mat-entry/next-grn-number`);
        setGrnNumber(nextGrnRes.data.nextGRN);
      }

      setVendorDc(grnData?.vendorDC || '');
      setVendorInvoice(grnData?.vendorInvoice || '');
    }
  };


  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...selectedPO.poitems];

    // Handle MaterialDropdown values which might be objects
    if (field === 'receivingLocation' && value && typeof value === 'object') {
      updatedItems[index][field] = value;
    } else if (field === 'receivedBy' && value && typeof value === 'object') {
      updatedItems[index][field] = value.value;
    } else {
      updatedItems[index][field] = value;
    }

    setSelectedPO({ ...selectedPO, poitems: updatedItems });
  };
  const handleSave = async () => {
    if (!selectedPO) return;
    const newErrors = {
      vendorDc: !vendorDc.trim(),
      vendorInvoice: !vendorInvoice.trim(),
      receivedQty: [],
      receivedBy: []
    };

    let hasError = false;

    selectedPO.poitems.forEach((item, idx) => {
      const qtyError = !(item.receivedQty > 0);
      const userError = !item.receivedBy;

      newErrors.receivedQty[idx] = qtyError;
      newErrors.receivedBy[idx] = userError;

      if (qtyError || userError) {
        hasError = true;
      }
    });

    if (newErrors.vendorDc || newErrors.vendorInvoice) hasError = true;

    setErrors(newErrors);

    if (hasError) {
      
      setDialog({
        open: true,
        type: 'warning',
        title: 'Check Fields',
        message: `Please fill all required fields correctly.`
      });
      return;
    }

    const payload = {
      grnNumber,
      poNumber: selectedPO.poNumber,
      vendorName: selectedPO.vendorName,
      suggestedPO: selectedPO?.suggestedPO,
      requestNo: selectedPO?.requestNo,
      vendorAddress: selectedPO.vendorAddress,
      vendorDC: vendorDc,
      vendorInvoice: vendorInvoice,
      dateOfPO: selectedPO.dateofPO,
      lineItems: selectedPO.poitems.map(item => ({
        ...item,
        receivedQty: Number(item.receivedQty || 0),
        receivingLocation: selectedPO.siteName,
        receivedBy: item.receivedBy || '',
      })),
      materialReceiptEnteredBy: user.name,
    };

    try {
      // Always insert new GRN (even for existing PO), but use same GRN number
      await axios.post(`${API_URL}/api/material-receipt`, payload);
      
      setDialog({
        open: true,
        type: 'success',
        title: 'Receipt Created successfully!',
        message: `Receipt Created successfull for PO: ${selectedPO.poNumber}.`
      });
      
    } catch (err) {
      console.error('Error saving GRN:', err);
      
      setDialog({
        open: true,
        type: 'error',
        title: 'Receipt Request Failed',
        message: `Something went Wrong, Please Check your Internet Connection.`,
      });
    }
  };

  return (
    <Container>
      {poList.length === 0 && (
        <Typography color="error" variant="body1" sx={{ mt: 2 }}>
          All POs are fully received. No pending POs available.
        </Typography>
      )}

      <Box>
        <Paper sx={{ p: 4, bgcolor: colors.headerBgcolor, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Material Receipt Entry (Full PO)
          </Typography>

          <TextField
            select
            label="Select Pending PO"
            fullWidth
            size="small"
            value={selectedPO?.poNumber || ''}
            onChange={handlePOChange}
            helperText="Only POs with unreceived items are shown"
            margin="normal"
          >
            {poList.map(po => (
              <MenuItem key={po._id} value={po.poNumber}>
                {po.poNumber}
              </MenuItem>
            ))}
          </TextField>
        </Paper>

        {/* Content header */}

        {selectedPO && (
          <>
            <Paper sx={{ my: 2, p: 4, borderRadius: 3, bgcolor: colors.contentBgcolor }}>
              <Grid item xs={6}>
                <TextField
                  label="GRN Number"
                  value={grnNumber}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Vendor Name"
                    value={selectedPO.vendorName || ''}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Date of PO"
                    value={dayjs(selectedPO.dateofPO).format('YYYY-MM-DD') || ''}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
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
                <Grid item xs={6}>
                  <TextField
                    label="Vendor DC"
                    value={vendorDc}
                    onChange={e => setVendorDc(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: isExistingGRN }}
                    required
                    error={errors.vendorDc}
                    helperText={errors.vendorDc ? 'Vendor DC is required' : ''}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Vendor Invoice"
                    value={vendorInvoice}
                    onChange={e => setVendorInvoice(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: isExistingGRN }}
                    required
                    error={errors.vendorInvoice}
                    helperText={errors.vendorInvoice ? 'Vendor Invoice is required' : ''}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Line Items */}
            <Box mt={3} sx={{ border: '0.5px solid gray', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Material Name</TableCell>
                    <TableCell>UoM</TableCell>
                    <TableCell>PO Qty</TableCell>
                    <TableCell>Received Qty</TableCell>
                    <TableCell>Received By</TableCell>
                    <TableCell>Direct to Site</TableCell>
                    <TableCell>Receiving Location</TableCell>
                    <TableCell>Delivery Location as per PO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPO.poitems?.map((item, i) => {
                    const remainingQty = item.poQty - (item.alreadyReceivedQty || 0);
                    return (
                      <TableRow key={i}>
                        <TableCell>{item.sNo || i + 1}</TableCell>
                        <TableCell>{item.materialName || ''}</TableCell>
                        <TableCell>{item.uom || ''}</TableCell>
                        <TableCell>
                          {item.poQty}
                          {item.alreadyReceivedQty > 0 && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              (Received: {item.alreadyReceivedQty})
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            inputProps={{ min: 0, max: remainingQty }}
                            value={item.receivedQty || ''}
                            onChange={e => {
                              let val = Number(e.target.value);
                              if (val > remainingQty) val = remainingQty;
                              if (val < 0) val = 0;
                              handleLineItemChange(i, 'receivedQty', val);
                            }}
                            fullWidth
                            size="small"
                            error={errors.receivedQty[i]}
                            helperText={
                              errors.receivedQty[i]
                                ? 'Required'
                                : `Remaining: ${remainingQty}`
                            }
                          />

                        </TableCell>
                        <TableCell>
                          {errors.receivedBy[i] && (
                            <Typography variant="caption" color="error">
                              Required
                            </Typography>
                          )}
                          <MaterialDropdown
                            value={item.receivedBy ? { label: item.receivedBy, value: item.receivedBy } : null}
                            onSearch={async (search) => {
                              return users
                                .filter(user => user.toLowerCase().includes(search.toLowerCase()))
                                .map(user => ({ label: user, value: user }));
                            }}
                            onChange={(selected) => handleLineItemChange(i, 'receivedBy', selected?.value || '')}
                            placeholder="Select user..."
                            loadInitialData={true}
                            minCharsToSearch={0}
                            initialOptions={users.map(user => ({ label: user, value: user }))}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <TextField
                            select
                            value={item.directToSite || 'No'}
                            onChange={e => handleLineItemChange(i, 'directToSite', e.target.value)}
                            fullWidth
                            size="small"
                          >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                          </TextField>
                        </TableCell>

                        <TableCell>
                          {item.directToSite === 'No' ? (
                            <MaterialDropdown
                              value={item.receivingLocation ? { label: item.receivingLocation, value: item.receivingLocation } 
                              : { label: selectedPO.siteName, value: selectedPO.siteName }}
                              onSearch={async (search) => {
                                return locations
                                  .filter(loc => loc.toLowerCase().includes(search.toLowerCase()))
                                  .map(loc => ({ label: loc, value: loc }));
                              }}
                              onChange={(selected) => handleLineItemChange(i, 'receivingLocation', selected?.value || '')}
                              placeholder="Select location..."
                              loadInitialData={true}
                              minCharsToSearch={0}
                              initialOptions={locations.map(loc => ({ label: loc, value: loc }))}
                            />
                          ) : (
                            selectedPO.siteName || ''
                          )}
                        </TableCell>

                        <TableCell>{item.deliveryLocation || ''}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <Grid item xs={6} sx={{ my: 2 }}>
              <TextField
                variant='filled'
                label="Material Receipt Entered By"
                value={user.name}
                inputProps={{ readOnly: true }}
              />
            </Grid>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save Receipt
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

export default MaterialReceiptEntry;
