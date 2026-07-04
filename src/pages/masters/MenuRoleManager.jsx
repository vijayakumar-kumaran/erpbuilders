// src/pages/MenuRoleManager.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import axios from 'axios';
import API_URL from '../../config'

const MenuRoleManager = () => {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${API_URL}/api/menu/getrolemapping`);
      setMenus(res.data);
    };
    fetchData();
  }, []);

  return (
    <Card className="m-4">
      <CardContent>
        <Typography variant="h5" gutterBottom>Menu Role Mapping</Typography>
        {menus.map((menu) => (
          <div key={menu._id} className="my-2">
            <Typography variant="subtitle1">{menu.name} ({menu.path})</Typography>
            <div className="flex gap-2 flex-wrap">
              {menu.roles.map((role, idx) => (
                <Chip key={idx} label={role} color="primary" />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MenuRoleManager;