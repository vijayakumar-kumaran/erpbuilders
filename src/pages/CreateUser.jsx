// src/pages/CreateUser.jsx
import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import API_URL from '../config'
import { useNavigate } from 'react-router-dom';

const roles = ['Admin', 'Manager', 'Site Engineer', 'Site Manager', 'Procurement'];

const CreateUser = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/users/create-user`, formData);
      setMessage(res.data.message);
      setFormData({ username: '', password: '', role: '' });
      navigate('/manage-user-acc')
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'User creation failed');
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Create New User</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        
          <TextField
            required fullWidth margin="normal"
            label="User Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            required fullWidth margin="normal"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {message && <Typography sx={{ mt: 2 }} color="primary">{message}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Create User
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateUser;