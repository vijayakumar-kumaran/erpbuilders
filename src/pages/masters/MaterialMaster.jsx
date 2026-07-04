import React, { useState } from 'react';
import { Box, Paper, Typography, Button, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import MaterialList from '../masterComponents/MaterialMaster/List';
import MaterialForm from '../masterComponents/MaterialMaster/Form';

const MaterialManager = () => {
  const theme = useTheme();
  const [openForm, setOpenForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [refreshListTrigger, setRefreshListTrigger] = useState(0);


  // this replaces handleFormClose
  const handleSaveComplete = () => {
    setOpenForm(false);
    setSelectedMaterial(null);
    setRefreshListTrigger((prev) => prev + 1); // this triggers useEffect in MaterialList
  };
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedMaterial(null);
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)'
          : 'linear-gradient(135deg, #f0f2f5 0%, #dfe4ea 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 1400,
          mb: 3,
          px: 4,
          py: 3,
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(6px)',
          boxShadow: theme.shadows[2],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            📘 Material Manager
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Central hub for managing all materials and inventory data
          </Typography>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedMaterial(null);
              setOpenForm(true);
            }}
            sx={{
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              color: '#fff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                background: 'linear-gradient(90deg, #303f9f, #1976d2)'
              }
            }}
          >
            Add Material
          </Button>
        </motion.div>
      </Paper>

      <MaterialList
        openForm={openForm}
        setOpenForm={setOpenForm}
        selectedMaterial={selectedMaterial}
        setSelectedMaterial={setSelectedMaterial}
        refreshListTrigger={refreshListTrigger}
      />


      <MaterialForm
        open={openForm}
        onClose={handleFormClose}
        selectedMaterial={selectedMaterial}
        onSaveComplete={handleSaveComplete}
      />

    </Box>
  );
};

export default MaterialManager;