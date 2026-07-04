import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, Grid, Typography, FormGroup, FormControlLabel,
  Box, Divider, Paper, CircularProgress, Tooltip
} from '@mui/material';
import axios from 'axios';
import API_URL from '../../config';
import groups from './routeGroups';

const UserAccessModal = ({ open, onClose, user }) => {
  const [roleRoutes, setRoleRoutes] = useState([]);
  const [userRoutes, setUserRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && user?.username && user?.role) {
      fetchRoutes();
    } else {
      setRoleRoutes([]);
      setUserRoutes([]);
      setError(null);
    }
  }, [open, user]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roleResponse, userResponse] = await Promise.all([
        axios.get(`${API_URL}/api/route-access/role-routes/${user.role}`),
        axios.get(`${API_URL}/api/route-access/user-access/${user.username}/routes`)
      ]);

      setRoleRoutes(roleResponse.data.routes || []);
      setUserRoutes(userResponse.data.routes || []);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load route permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRouteStatus = (path) => {
    const override = userRoutes.find(r => r.path === path);

    if (override) {
      return {
        status: override.action === 'deny' ? 'denied' : 'user-override',
        hasOverride: true
      };
    }

    const inRole = roleRoutes.some(r => r.path === path);
    return {
      status: inRole ? 'role-default' : 'none',
      hasOverride: false
    };
  };

  const handleToggleRoute = (route) => {
    const { status } = getRouteStatus(route.path);

    if (status === 'user-override' || status === 'denied') {
      setUserRoutes(prev => prev.filter(r => r.path !== route.path));
    } else if (status === 'role-default') {
      setUserRoutes(prev => [
        ...prev,
        {
          path: route.path,
          action: 'deny',
          addedAt: new Date().toISOString(),
          addedBy: 'admin'
        }
      ]);
    } else {
      setUserRoutes(prev => [
        ...prev,
        {
          path: route.path,
          action: 'allow',
          addedAt: new Date().toISOString(),
          addedBy: 'admin'
        }
      ]);
    }
  };

  const handleToggleGroup = (group) => {
    const groupPaths = group.items.map(item => item.path);

    const updatedRoutes = [...userRoutes];
    const newOverrides = [];

    group.items.forEach(item => {
      const { status } = getRouteStatus(item.path);
      const hasAccess = status === 'user-override' || status === 'role-default';

      if (hasAccess) {
        const alreadyDenied = updatedRoutes.find(r => r.path === item.path && r.action === 'deny');
        if (alreadyDenied) {
          const index = updatedRoutes.findIndex(r => r.path === item.path);
          updatedRoutes.splice(index, 1);
        } else if (status === 'role-default') {
          newOverrides.push({
            path: item.path,
            action: 'deny',
            addedAt: new Date().toISOString(),
            addedBy: 'admin'
          });
        } else {
          const index = updatedRoutes.findIndex(r => r.path === item.path);
          updatedRoutes.splice(index, 1);
        }
      } else {
        newOverrides.push({
          path: item.path,
          action: 'allow',
          addedAt: new Date().toISOString(),
          addedBy: 'admin'
        });
      }
    });

    setUserRoutes([...updatedRoutes, ...newOverrides]);
  };

  const getGroupOverrideStatus = (group) => {
    const groupPaths = group.items.map(item => item.path);
    const accessCount = groupPaths.filter(path => {
      const { status } = getRouteStatus(path);
      return status !== 'denied' && status !== 'none';
    }).length;

    if (accessCount === 0) return 'none';
    if (accessCount === group.items.length) return 'all';
    return 'some';
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.post(`${API_URL}/api/route-access/user-access/update-routes`, {
        username: user.username,
        routes: userRoutes,
        updatedAt: new Date().toISOString()
      });

      onClose(true);
    } catch (err) {
      console.error('Error saving:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUserRoutes([]); // Clear all user-specific overrides
  };

  return (
    <Dialog
      open={open}
      onClose={() => !saving && onClose(false)}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={saving}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Route Access for {user?.username} ({user?.role})
          <Typography variant="subtitle2" color="textSecondary">
            {userRoutes.length} user-specific overrides
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box py={2} textAlign="center" color="error.main">
            {error}
            <Box pt={2}>
              <Button onClick={fetchRoutes} color="primary">
                Retry
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <Box component="span" sx={{ color: '#1976d2' }}>Blue</Box> = Role access |
              <Box component="span" sx={{ color: '#4caf50', ml: 1 }}>Green</Box> = User-allowed |
              <Box component="span" sx={{ color: '#f44336', ml: 1 }}>Red</Box> = User-denied
            </Typography>

            <Grid container spacing={3}>
              {groups.map((group) => {
                const groupStatus = getGroupOverrideStatus(group);

                return (
                  <Grid item xs={12} md={6} key={group.key}>
                    <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px solid #ddd' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <Checkbox
                          checked={groupStatus === 'all'}
                          indeterminate={groupStatus === 'some'}
                          onChange={() => handleToggleGroup(group)}
                          color="primary"
                        />
                        {group.label}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <FormGroup>
                        {group.items.map((item) => {
                          const { status } = getRouteStatus(item.path);
                          const hasAccess = status !== 'denied' && status !== 'none';
                          return (
                            <Tooltip key={item.path} title={item.path} placement="right" arrow>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={hasAccess}
                                    onChange={() => handleToggleRoute(item)}
                                    color={
                                      status === 'user-override' ? 'success' :
                                      status === 'denied' ? 'error' :
                                      'primary'
                                    }
                                  />
                                }
                                label={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color:
                                        status === 'user-override' ? '#4caf50' :
                                        status === 'denied' ? '#f44336' :
                                        status === 'role-default' ? '#1976d2' :
                                        'inherit',
                                      fontWeight: status === 'user-override' ? 600 : 'normal'
                                    }}
                                  >
                                    {item.name}
                                  </Typography>
                                }
                              />
                            </Tooltip>
                          );
                        })}
                      </FormGroup>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose(false)} color="secondary" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleReset}
          color="warning"
          disabled={loading || saving}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Overrides'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserAccessModal;
