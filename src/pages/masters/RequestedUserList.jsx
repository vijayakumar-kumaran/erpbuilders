import {
  Box,
  Alert,
  LinearProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import UserForm from '../masterComponents/ReqUser/Form';
import UserList from '../masterComponents/ReqUser/List';
import API_URL from '../../config';
import axios from 'axios';

const RequestedUserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: '',
    escalationManager: '',
    startDate: dayjs(),
    endDate: null,
    description: '',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 8;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/masters/users`);
      setUsers(res.data);
      setFilteredUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
  const results = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredUsers(results);
  setPage(1);
}, [searchTerm, users]);


  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!form.name || !form.username || (!isEditing && !form.password) || !form.role) {
        throw new Error('Name, Username, Password (on create), and Role are required');
      }
      const payload = {
        ...form,
        startDate: form.startDate.format('DD-MM-YYYY'),
        endDate: form.endDate ? form.endDate.format('DD-MM-YYYY') : ''
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/masters/users/${form._id}`, payload);
        setSuccess('User updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/masters/users/create`, payload);
        setSuccess('User created successfully!');
      }

      handleCloseForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user) => {
    setForm({
      ...user,
      password: '',
      startDate: dayjs(user.startDate, 'DD-MM-YYYY'),
      endDate: dayjs(user.endDate, 'DD-MM-YYYY'),
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      username: '',
      password: '',
      role: '',
      escalationManager: '',
      startDate: dayjs(),
      endDate: null,
      description: '',
      status: 'Active'
    });
    setIsEditing(false);
  };

  const handleOpenForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <UserForm
          open={formOpen}
          handleClose={handleCloseForm}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isEditing={isEditing}
          loading={loading}
        />

        <UserList
          users={filteredUsers}
          paginatedUsers={paginatedUsers}
          page={page}
          rowsPerPage={rowsPerPage}
          setPage={setPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          editUser={editUser}
          handleOpenForm={handleOpenForm}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default RequestedUserList;