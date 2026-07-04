// security/Forbidden.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Forbidden = () => (
  <Box textAlign="center" mt={10}>
    <Typography variant="h3" color="error">403</Typography>
    <Typography variant="h5">Access Denied</Typography>
    <Typography variant="body1">You don’t have permission to view this page.</Typography>
  </Box>
);

export default Forbidden;
