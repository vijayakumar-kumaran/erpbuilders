import React from 'react';
import { 
  Grid,
  TextField,
  Paper,
  Typography 
} from '@mui/material';
import { useAuth } from '../../AuthContext';

export default function FooterMaterialOrderedPO({ formData, setFormData }) {
  const { user } = useAuth();

  return (
    <Paper elevation={1} sx={{ p: 0, borderRadius: 0, bgcolor: '#fefefe' }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight={600}
        fontSize="0.95rem"
        gutterBottom
        sx={{ pl: 2, mt: 1 }}
      >
        Approval and Entry Details
      </Typography>
      <Grid container spacing={2} p={2}>
        <Grid item xs={12} md={3}>
          <TextField
            variant='filled'
            fullWidth
            label="Entered By"
            value={user?.name || ''}
            InputProps={{
              readOnly: true,
            }}
            sx={{ maxWidth: 300 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}