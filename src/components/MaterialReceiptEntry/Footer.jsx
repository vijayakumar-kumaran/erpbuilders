import React, { useEffect, useState } from 'react';
import { Box, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

const FooterGRN = ({ enteredBy, setEnteredBy }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(`${API_URL}/api/masters/users`);
      setUsers(res.data.map(u => u.name));
    };

    fetchUsers();
  }, []);

  return (
    <Box mt={3}>
      <TextField
        label="Matl Receipt Entered By"
        select
        fullWidth
        value={enteredBy}
        onChange={(e) => setEnteredBy(e.target.value)}
      >
        {users.map(user => (
          <MenuItem key={user} value={user}>{user}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default FooterGRN;
