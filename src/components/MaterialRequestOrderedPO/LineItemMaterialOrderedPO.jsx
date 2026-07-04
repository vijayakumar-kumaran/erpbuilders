import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import {
  TextField, Typography, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormHelperText,
} from '@mui/material';
import dayjs from 'dayjs';
import API_URL from '../../config';

const LineItemMaterialOrderedPO = forwardRef(({ formData, setFormData }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [materialCodesHash, setMaterialCodesHash] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const requestInProgress = useRef(false);
  const currentDate = dayjs().format('YYYY-MM-DD');

  // Initialize validation errors
  useEffect(() => {
    setValidationErrors(formData.items.map(item => ({
      proposedQty: false,
      remarks: false
    })));
  }, [formData.items]);

  // 🔁 Memoize material codes to avoid unnecessary re-renders
  const materialCodes = useMemo(() => {
    return [...new Set(
      formData.items
        .map(item => item.materialCode?.trim().toUpperCase())
        .filter(Boolean)
    )];
  }, [formData.items]);

  useEffect(() => {
    const fetchTotalAvailableQty = async () => {
      if (!materialCodes.length || requestInProgress.current) return;

      const newHash = materialCodes.slice().sort().join(',');
      if (newHash === materialCodesHash) return; // ✅ Already fetched

      setMaterialCodesHash(newHash); // 🆕 Set hash
      requestInProgress.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${API_URL}/api/closing/totalbymaterial`, {
          materialCodes,
          date: currentDate,
        }, {
          validateStatus: status => status === 200,
        });

        const stockMap = {};
        response.data.forEach(item => {
          stockMap[item.materialCode.trim().toUpperCase()] = item.totalAvailable;
        });

        const updatedItems = formData.items.map(item => {
          const code = item.materialCode?.trim().toUpperCase();
          const totalAvailable = stockMap[code] || 0;
          const requestedQty = parseFloat(item.qty);
          const suggestedQty = requestedQty ? requestedQty - totalAvailable : 0;

          return {
            ...item,
            qtyAvailable: totalAvailable,
            suggestedQty,
            stockStatus: totalAvailable > 0 ? 'Available' : 'Not Available',
          };
        });

        setFormData(prev => ({ ...prev, items: updatedItems }));
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch stock data.');
      } finally {
        setLoading(false);
        requestInProgress.current = false;
      }
    };

    fetchTotalAvailableQty();
  }, [materialCodes, currentDate, materialCodesHash, setFormData]);

  const handleChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === 'qtyAvailable') return;

    if (field === 'proposedQty') {
      const numValue = parseFloat(value || 0);
      updatedItems[index][field] = numValue > 0 ? numValue : '';
      
      // Clear error when field is changed
      setValidationErrors(prev => {
        const newErrors = [...prev];
        newErrors[index] = {...newErrors[index], proposedQty: false};
        return newErrors;
      });
    } else {
      updatedItems[index][field] = value;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

 const validateProposedQuantities = () => {
  const newErrors = formData.items.map(item => ({
    proposedQty: !item.proposedQty || isNaN(item.proposedQty) || item.proposedQty <= 0,
    remarks: false
  }));

  setValidationErrors(newErrors);

  return !newErrors.some(error => error.proposedQty);
};

  useImperativeHandle(ref, () => ({
    validateProposedQuantities
  }));

  return (
    <Paper elevation={6} sx={{ p: 2, borderRadius: 2, bgcolor: '#fefefe' }}>
      <Typography variant="h6" gutterBottom>
        Material Line Items
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>S.No.</TableCell>
              <TableCell>Material Name</TableCell>
              <TableCell align="center">UoM</TableCell>
              <TableCell align="center">Qty Requested</TableCell>
              <TableCell>Required By</TableCell>
              <TableCell align="right">Qty Available</TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell align="center">Suggested Qty</TableCell>
              <TableCell align="right">Proposed Qty *</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {formData.items?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.sNo}.</TableCell>
                <TableCell>{item.materialName}</TableCell>
                <TableCell align="center">{item.uom}</TableCell>
                <TableCell align="center">{item.qty}</TableCell>
                <TableCell>
                  {item.requiredByDate ? dayjs(item.requiredByDate).format('DD-MM-YYYY') : ''}
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={item.qtyAvailable || 0}
                    InputProps={{ readOnly: true, style: { textAlign: 'right' } }}
                    variant="outlined"
                    fullWidth
                  />
                </TableCell>
                <TableCell>{item.stockStatus}</TableCell>
                <TableCell align="center">{item.suggestedQty || 0}</TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={item.proposedQty || ''}
                    onChange={(e) => handleChange(index, 'proposedQty', e.target.value)}
                    inputProps={{
                      min: 0,
                      max: item.qty,
                      style: { textAlign: 'right' }
                    }}
                    variant="outlined"
                    fullWidth
                    error={validationErrors[index]?.proposedQty}
                    helperText={validationErrors[index]?.proposedQty ? "Required and must be greater than 0" : ""}
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={item.remarks || ''}
                    onChange={(e) => handleChange(index, 'remarks', e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
)
export default LineItemMaterialOrderedPO;
