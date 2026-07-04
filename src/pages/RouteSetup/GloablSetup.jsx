import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, FormControl, InputLabel, Select,
  MenuItem, Checkbox, Grid, Button, Divider, Box
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';
import routeGroups from './routeGroups';
import roleOptions from './rolesDatas';
import { iconMap } from '../../components/layout/iconMap';
import { useNavigate } from 'react-router-dom';

const GlobalSettingsPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [roleRoutes, setRoleRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedRole) fetchRoleRoutes(selectedRole);
  }, [selectedRole]);

  const fetchRoleRoutes = async (role) => {
    try {
      const res = await axios.get(`${API_URL}/api/route-access/role-routes/${role}`);
      setRoleRoutes(res.data.routes || []);
    } catch (err) {
      console.error('Error loading role routes', err);
    }
  };

  const handleToggleRoute = (route) => {
    setRoleRoutes((prev) =>
      prev.some(r => r.path === route.path)
        ? prev.filter((r) => r.path !== route.path)
        : [...prev, {
          path: route.path,
          name: route.name,
          icon: route.icon.name || route.icon, // Handle both component and string
          category: route.category
        }]
    );
  };

  const handleToggleGroup = (group) => {
    const allIncluded = group.items.every(item =>
      roleRoutes.some(r => r.path === item.path)
    );

    if (allIncluded) {
      setRoleRoutes(prev =>
        prev.filter(r => !group.items.some(item => item.path === r.path))
      );
    } else {
      const newRoutes = [...roleRoutes];
      group.items.forEach(item => {
        if (!newRoutes.some(r => r.path === item.path)) {
          newRoutes.push({
            path: item.path,
            name: item.name,
            icon: item.icon.name || item.icon, // Handle both component and string
            category: item.category
          });
        }
      });
      setRoleRoutes(newRoutes);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/route-access/update-role-routes`, {
        role: selectedRole,
        routes: roleRoutes.map(route => ({
          path: route.path,
          name: route.name,
          icon: route.icon, // Now sending string
          category: route.category
        }))
      });
      alert('Saved successfully!');
      navigate('/')
    } catch (err) {
      console.error('Error saving role routes', err);
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const isRouteSelected = (path) => {
    return roleRoutes.some(r => r.path === path);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Global Role Settings
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Select Role</InputLabel>
        <Select
          value={selectedRole}
          label="Select Role"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roleOptions.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRole && (
        <>
          <Divider sx={{ my: 2 }} />
          {routeGroups.map((group) => {
            const allChecked = group.items.every(item =>
              isRouteSelected(item.path)
            );

            return (
              <Paper
                key={group.key}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 3,
                  border: allChecked ? '1px solid #1976d2' : '1px solid #ddd',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  <Checkbox
                    checked={allChecked}
                    indeterminate={
                      !allChecked &&
                      group.items.some(item => isRouteSelected(item.path))
                    }
                    onChange={() => handleToggleGroup(group)}
                  />
                  {group.label}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  {group.items.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.path}>
                      <Box display="flex" alignItems="center">
                        <Checkbox
                          checked={isRouteSelected(item.path)}
                          onChange={() => handleToggleRoute({
                            path: item.path,
                            name: item.name,
                            icon: item.icon.name || item.icon, // Handle both component and string
                            category: item.category
                          })}
                        />
                        <Box display="inline-flex" alignItems="center">
                          {(() => {
                            const IconComp = iconMap[item.icon] || iconMap[item.name];
                            return IconComp ? (
                              <IconComp size={16} style={{ marginRight: 8 }} />
                            ) : (
                              <span style={{ marginRight: 8 }}>{item.icon}</span>
                            );
                          })()}

                          <Typography variant="body2">{item.name}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            );
          })}

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedRole('')}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default GlobalSettingsPage;