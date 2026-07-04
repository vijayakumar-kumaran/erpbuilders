import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Alert, LinearProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import SiteDialog from '../masterComponents/sites/SiteDialog';
import SiteSearchAndTable from '../masterComponents/sites/SiteSearchAndTable';
import API_URL from '../../config';

const SiteMaster = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [form, setForm] = useState({
    siteName: '',
    location: '',
    startDate: dayjs(),
    endDate: null,
    nature: '',
    projectGroup: '',
    description: '',
    status: 'Active'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'siteName', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  const rowsPerPage = 8;
  const statusOptions = ['Active', 'Inactive'];
  const natureOptions = ['Construction', 'Stock', 'Others'];
  const statusColors = { Active: 'success', Inactive: 'error' };

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/sites`);
      setSites(res.data);
      setFilteredSites(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    const results = sites.filter(site =>
      site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.nature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSites(results);
    setPage(1);
  }, [searchTerm, sites]);

  const handleSubmit = async () => {
  setLoading(true);
  setSuccess(null);

  const payload = {
    ...form,
    startDate: form.startDate.format('DD-MM-YYYY'),
    endDate: form.endDate ? form.endDate.format('DD-MM-YYYY') : ''
  };

  if (!form.siteName || !form.location || !form.startDate) {
    setLoading(false);
    throw new Error('Required fields are missing');
  }

  try {
    if (isEditing) {
      await axios.put(`${API_URL}/api/masters/sites/update/${form._id}`, payload);
      setSuccess('Site updated successfully!');
    } else {
      const { _id, ...newPayload } = payload;
      await axios.post(`${API_URL}/api/masters/sites/create`, newPayload);
      setSuccess('Site created successfully!');
    }

    resetForm();
    fetchSites();
    setOpenDialog(false);
  } catch (err) {
    const errorMessage = err.response?.data?.message?.toLowerCase();
    if (err.response?.status === 400 && errorMessage?.includes('already exists')) {
  setDuplicateMessage(err.response.data.message);
  setDuplicateDialogOpen(true);
}
else {
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};


  const resetForm = () => {
    setForm({
      _id: '',
      siteName: '',
      location: '',
      startDate: dayjs(),
      endDate: null,
      nature: '',
      projectGroup: '',
      description: '',
      status: 'Active'
    });
    setIsEditing(false);
  };

  const editSite = (site) => {
    setForm({
      _id: site._id,
      siteName: site.siteName,
      location: site.location,
      startDate: dayjs(site.startDate, 'DD-MM-YYYY'),
      endDate: site.endDate ? dayjs(site.endDate, 'DD-MM-YYYY') : null,
      nature: site.nature,
      projectGroup: site.projectGroup,
      description: site.description,
      status: site.status
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedSites = [...filteredSites].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedSites = sortedSites.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const parsed = dayjs(dateStr, 'DD-MM-YYYY');
    return parsed.isValid() ? parsed.format('DD-MM-YYYY') : 'Invalid Date';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto', minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: '#f0f4fa'
        }}>
          <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
            <Typography variant="h3" fontWeight="bold" sx={{
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🏗️ Site Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all construction sites and their details
            </Typography>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              sx={{
                background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                boxShadow: 2
              }}
            >
              New Site
            </Button>
          </motion.div>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <SiteSearchAndTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fetchSites={fetchSites}
          paginatedSites={paginatedSites}
          filteredSites={filteredSites}
          handleSort={handleSort}
          sortConfig={sortConfig}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          statusColors={statusColors}
          editSite={editSite}
          formatDate={formatDate}
        />

        <SiteDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          isEditing={isEditing}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setForm={setForm}
          natureOptions={natureOptions}
          statusOptions={statusOptions}
          statusColors={statusColors}
          loading={loading}
          duplicateDialogOpen={duplicateDialogOpen}
          setDuplicateDialogOpen={setDuplicateDialogOpen}
          duplicateMessage={duplicateMessage}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default SiteMaster;