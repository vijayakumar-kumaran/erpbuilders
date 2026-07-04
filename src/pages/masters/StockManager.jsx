
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Grid, MenuItem } from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

export default function StockManager() {
  const [form, setForm] = useState({
    materialCategory: '', materialName: '', materialDescription: '',
    uom: '', reorderLevel: '', reorderQuantity: ''
  });
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/api/masters/add-material`, form);
      alert('Material created');
      loadMaterials();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const loadData = async () => {
    const [cats, u] = await Promise.all([
      axios.get(`${API_URL}/api/masters/mat-cat`),
      axios.get(`${API_URL}/api/masters/uom`)
    ]);
    setCategories(cats.data);
    setUoms(u.data);
  };

  const loadMaterials = async () => {
    const res = await axios.get(`${API_URL}/api/masters/materials`);
    setMaterials(res.data);
  };

  useEffect(() => {
    loadData();
    loadMaterials();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h5">Material Master</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField select fullWidth label="Material Category" name="materialCategory" value={form.materialCategory} onChange={handleChange}>
            {categories.map(c => <MenuItem key={c._id} value={c.materialCategory}>{c.materialCategory}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6}><TextField required fullWidth label="Material Name" name="materialName" value={form.materialName} onChange={handleChange} /></Grid>
        <Grid item xs={12}><TextField required fullWidth label="Material Description" name="materialDescription" value={form.materialDescription} onChange={handleChange} /></Grid>
        <Grid item xs={6}>
          <TextField select fullWidth label="UoM" name="uom" value={form.uom} onChange={handleChange}>
            {uoms.map(u => <MenuItem key={u._id} value={u.uom}>{u.uom}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={3}><TextField fullWidth type="number" label="Reorder Level" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} /></Grid>
        <Grid item xs={3}><TextField fullWidth type="number" label="Reorder Quantity" name="reorderQuantity" value={form.reorderQuantity} onChange={handleChange} /></Grid>
        <Grid item xs={12}><Button variant="contained" onClick={handleSubmit}>Create</Button></Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6">Materials (max 15)</Typography>
        <ul>
          {materials.map(m => (
            <li key={m._id}>{m.materialCategory} - {m.materialName} ({m.uom})</li>
          ))}
        </ul>
      </Box>
    </Box>
  );
}