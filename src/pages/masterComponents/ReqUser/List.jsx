import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  Button
} from '@mui/material';
import { Edit, Search, Add } from '@mui/icons-material';
import UserAccessModal from '../../RouteSetup/UserAccessModal';

const UserList = ({ 
  users, 
  paginatedUsers, 
  page, 
  rowsPerPage, 
  setPage, 
  searchTerm, 
  setSearchTerm, 
  editUser,
  handleOpenForm
}) => {
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAssignClick = (user) => {
    setSelectedUser(user);
    setAccessModalOpen(true);
  };

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenForm}
        >
          New User
        </Button>
      </Box>

      {/* Search Input */}
      <Box sx={{ mb: 2, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          label="Search by Name, Username, Role, Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Access / Pages</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No users found</TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar>{user.name.charAt(0)}</Avatar>
                      <Typography>{user.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography>{user.username}</Typography>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    {user.startDate} - {user.endDate || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleAssignClick(user)}>Assign</Button>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => editUser(user)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          count={Math.ceil(users.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          shape="rounded"
          color="primary"
        />
      </Box>

      {/* User Access Modal */}
      <UserAccessModal 
        open={accessModalOpen} 
        onClose={() => setAccessModalOpen(false)} 
        user={selectedUser}
      />
    </>
  );
};

export default UserList;