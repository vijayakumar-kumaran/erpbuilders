// src/pages/MenuManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Button, MenuItem,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText,
  TablePagination
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';

const roles = [
  'Admin', 'Managing Director', 'Site Engineer', 'Site Manager',
  'Operation Head', 'Marketing Head', 'Project Manager', 'Purchase Manager',
  'Finance Manager', 'Engineering Head', 'HR', 'Accountant', 'Buyer', 'Store keeper'
];

const allGroups = ['operations', 'masters', 'transactions', 'reports'];

const MenuManager = () => {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [menus, setMenus] = useState([]);

  // For filtering Existing Menus by group
  const [filterGroup, setFilterGroup] = useState('masters'); // default filter

  // Pagination
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu/getrolemapping`);
      setMenus(res.data);
    } catch (err) {
      console.error('Error fetching menus', err);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !path.trim() || selectedRoles.length === 0 || selectedGroups.length === 0) {
      alert('Please fill all fields and select at least one role and one group.');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/menu`, {
        name: name.trim(),
        path: path.trim(),
        roles: selectedRoles,
        group: selectedGroups,
      });

      setName('');
      setPath('');
      setSelectedRoles([]);
      setSelectedGroups([]);
      fetchMenus();
    } catch (err) {
      console.error('Error saving menu', err);
    }
  };

  // Filter menus by selected group for display
  const filteredMenus = menus.filter(menu =>
    Array.isArray(menu.group) && menu.group.includes(filterGroup)
  );

  // Pagination handler
  const handlePageChange = (_, newPage) => setPage(newPage);

  return (
    <Card className="m-4" sx={{ maxWidth: 800, mx: 'auto', boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Menu Manager
        </Typography>

        <TextField
          label="Menu Name"
          fullWidth
          margin="normal"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="off"
          size="small"
        />

        <TextField
          label="Path"
          fullWidth
          margin="normal"
          value={path}
          onChange={e => setPath(e.target.value)}
          autoComplete="off"
          size="small"
        />

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Roles</InputLabel>
          <Select
            multiple
            value={selectedRoles}
            onChange={e => setSelectedRoles(e.target.value)}
            input={<OutlinedInput label="Roles" />}
            renderValue={selected => selected.join(', ')}
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>
                <Checkbox checked={selectedRoles.includes(role)} />
                <ListItemText primary={role} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Group</InputLabel>
          <Select
            multiple
            value={selectedGroups}
            onChange={e => setSelectedGroups(e.target.value)}
            input={<OutlinedInput label="Group" />}
            renderValue={selected => selected.join(', ')}
          >
            {allGroups.map(group => (
              <MenuItem key={group} value={group}>
                <Checkbox checked={selectedGroups.includes(group)} />
                <ListItemText primary={group} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          sx={{ mt: 2, mb: 4 }}
          onClick={handleSubmit}
          fullWidth
        >
          Save Menu
        </Button>

        {/* Group Filter Dropdown */}
        <FormControl sx={{ mb: 2, minWidth: 150 }}>
          <InputLabel id="filter-group-label">Filter Group</InputLabel>
          <Select
            labelId="filter-group-label"
            value={filterGroup}
            label="Filter Group"
            onChange={e => {
              setFilterGroup(e.target.value);
              setPage(0);
            }}
            size="small"
          >
            {allGroups.map(group => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom>
          Existing Menus ({filterGroup})
        </Typography>

        {filteredMenus.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No menus found for the selected group.
          </Typography>
        )}

        {filteredMenus
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map(menu => (
            <div
              key={menu._id}
              style={{
                marginBottom: 12,
                padding: 12,
                border: '1px solid #ccc',
                borderRadius: 8,
                backgroundColor: '#fafafa',
              }}
            >
              <Typography sx={{ fontWeight: 'bold' }}>{menu.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Path: {menu.path}
              </Typography>
              <Typography variant="body2">
                Roles: {menu.roles.join(', ')}
              </Typography>
              {/* Group value intentionally hidden in display */}
            </div>
          ))}

        {filteredMenus.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={filteredMenus.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MenuManager;