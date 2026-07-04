import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  MenuItem,
  TextField,
  Paper,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';
import colors from '../../theme/color';
export default function HeaderMaterialOrderedPO({ formData, setFormData }) {
  const [requestNos, setRequestNos] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/po/material-request/requestNos`).then((res) => {
      setRequestNos(res.data);
    });
  }, []);

  const handleChange = (e) => {
    const selectedRequestNo = e.target.value;
    setFormData((prev) => ({ ...prev, requestNo: selectedRequestNo }));

    axios
      .get(`${API_URL}/api/po/material-request/byRequestNo/${encodeURIComponent(selectedRequestNo)}`)
      .then((res) => {
        const data = res.data;

        if (data.status === 'Pending') {
          alert('Material PO Order already created');
          setFormData({}); // Clear form
          return;
        }

        setFormData((prev) => ({
          ...prev,
          ...data,
          suggestedPO: `SPL${selectedRequestNo}`,
        }));
      })
      .catch((err) => {
        console.error('Error fetching request details:', err);
        alert('Error fetching request details.');
      });
  };

  return (
    <Paper elevation={2}  sx={{ p: 4, borderRadius: 2, bgcolor: colors.headerBgcolor }}>
      <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={600}>
            📝 List of Material to be Ordered through PO
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <TextField
              label="Request No #"
              select
              fullWidth
              value={formData.requestNo || ''}
              onChange={handleChange}
              size="small"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: 'bold' },
              }}
            >
              {requestNos.map((no) => (
                <MenuItem key={no} value={no}>
                  {no}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Suggested PO Listing #"
              value={formData.suggestedPO || ''}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
              variant="outlined"
              placeholder="Auto Generate"
              InputLabelProps={{
                shrink: true,
                sx: { fontWeight: 'bold' },
              }}
            />
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Conditionally render read-only fields */}
      {formData.requestNo && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ReadOnlyField label="Date Of Request" value={formData.dateOfRequest} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ReadOnlyField label="Requested By" value={formData.requestedBy} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ReadOnlyField label="Request Source" value={formData.requestSource} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ReadOnlyField label="Site Name" value={formData.site} />
          </Grid>
        </Grid>
      )}
    </Paper>
    
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" fontSize="1rem" gutterBottom>
        {label}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          backgroundColor: '#f4f6f8',
          borderRadius: 2,
          border: '1px solid #d0d7de',
          fontSize: '1rem',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {value || '—'}
      </Paper>
    </Box>
  );
}