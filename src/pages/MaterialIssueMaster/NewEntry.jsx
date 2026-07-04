import React, { useState, useEffect } from 'react';
import {
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';
import axios from 'axios';
import API_URL from '../../config';
import { useAuth } from '../../AuthContext';

const NewEntryRow = ({ entry, index, onChange, onRemove, submissionAttempted  }) => {
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [stockLocations, setStockLocations] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!entry.destinationType) {
      onChange(index, 'destinationType', 'site');
    }
    if (!entry.status) {
      onChange(index, 'status', 'Accepted');
    }
    if (!entry.receivedBy) {
      onChange(index, 'receivedBy', user?.name);
    }
  }, []);

  const fetchVendors = async (searchTerm = '') => {
    try {
      const res = await axios.get(`${API_URL}/api/masters/vendors/drop`, { params: { search: searchTerm } });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      return [];
    }
  };

  const fetchStockLocations = async (searchTerm = '') => {
    try {
      const res = await axios.get(`${API_URL}/api/masters/sites/stock/q`, {
        params: { search: searchTerm }
      });
      return res.data.map(location => ({
        value: location.siteName,
        label: `${location.siteName} (${location.location})`,
        ...location
      }));
    } catch (err) {
      console.error('Failed to fetch stock locations:', err);
      return [];
    }
  };

  const handleVendorSelect = (selectedVendor) => {
    onChange(index, 'vendor', selectedVendor?.value || '');
  };

  const handleStockLocationSelect = (selectedLocation) => {
    onChange(index, 'stockLocation', selectedLocation?.label || '');
  };

  const getSelectedVendor = () => {
    return vendors.find(vendor => vendor.value === entry.vendor) || null;
  };

  const getSelectedStockLocation = () => {
    return stockLocations.find(loc => loc.label === entry.stockLocation) || null;
  };

  const isIssueQtyInvalid =
    !entry.issueQty ||
    parseFloat(entry.issueQty) <= 0 ||
    parseFloat(entry.issueQty) > entry.availableToIssue;

  const isStockLocationInvalid =
    entry.destinationType === 'site' && !entry.stockLocation;

  const isVendorInvalid =
    entry.destinationType === 'vendor' && !entry.vendor;

  useEffect(() => {
    const hasError = isIssueQtyInvalid || isStockLocationInvalid || isVendorInvalid;
    onChange(index, 'hasError', hasError);
  }, [entry.issueQty, entry.stockLocation, entry.vendor, entry.destinationType]);


  return (
    <TableRow>
      <TableCell>{entry.materialName}</TableCell>
      <TableCell>{entry.uom}</TableCell>
      <TableCell>{entry.proposedQty}</TableCell>

      <TableCell>
        <TextField
          type="number"
          value={entry.issueQty}
          onChange={(e) => onChange(index, 'issueQty', e.target.value)}
          size="small"
          inputProps={{
            min: 0,
            max: entry.availableToIssue,
            title: `Available to issue: ${entry.availableToIssue}`
          }}
          fullWidth
          error={submissionAttempted && isIssueQtyInvalid}
          helperText={
            submissionAttempted && isIssueQtyInvalid
              ? !entry.issueQty || parseFloat(entry.issueQty) <= 0
                  ? 'Issue Qty is required and must be > 0'
                  : `Exceeds available: ${entry.availableToIssue}`
              : `Available: ${entry.availableToIssue}`
          }
        />
      </TableCell>

      <TableCell>{entry.issuedToSite || ''}</TableCell>

      <TableCell>
        <Select
          value={entry.receivedBy || ''}
          onChange={(e) => onChange(index, 'receivedBy', e.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem key={user._id} value={user?.name}>
            {user?.name}
          </MenuItem>
        </Select>
      </TableCell>

      <TableCell>
        <Select
          value={entry.destinationType || 'site'}
          onChange={(e) => onChange(index, 'destinationType', e.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem value="site">Site</MenuItem>
          <MenuItem value="vendor">Vendor</MenuItem>
        </Select>
      </TableCell>

     <TableCell>
        {entry.destinationType === 'site' ? (
          <MaterialDropdown
            onSearch={fetchStockLocations}
            value={getSelectedStockLocation()}
            onChange={handleStockLocationSelect}
            placeholder="Select stock location..."
            loadInitialData={true}
            className="w-full"
            error={submissionAttempted && isStockLocationInvalid}
            helperText={submissionAttempted && isStockLocationInvalid ? 'Stock location is required' : ''}
          />
        ) : entry.destinationType === 'vendor' ? (
          <MaterialDropdown
            onSearch={fetchVendors}
            value={getSelectedVendor()}
            onChange={handleVendorSelect}
            placeholder="Select vendor..."
            loadInitialData={true}
            className="w-full"
            error={submissionAttempted && isVendorInvalid}
            helperText={submissionAttempted && isVendorInvalid ? 'Vendor is required' : ''}
          />
        ) : null}
      </TableCell>

      <TableCell>
        <Select
          value={entry.status || 'Accepted'}
          onChange={(e) => onChange(index, 'status', e.target.value)}
          size="small"
          fullWidth
        >
          <MenuItem value="Accepted">Accepted</MenuItem>
          <MenuItem value="Disputed">Disputed</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
        </Select>
      </TableCell>

      <TableCell>
        <IconButton onClick={() => onRemove(index)} size="small">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default NewEntryRow;
