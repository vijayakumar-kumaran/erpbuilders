import React, { useState } from 'react';
import { Box, Typography, Paper, Button, useTheme, alpha } from '@mui/material';
import { Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import WorkStageForm from '../WorkStageMaster/Form';
import WorkStageList from '../WorkStageMaster/List';

const StageMaster = () => {
  const theme = useTheme();
  const [selectedStage, setSelectedStage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const handleEdit = (stage) => {
    setSelectedStage(stage);
    setFormOpen(true);
  };

  const handleNew = () => {
    setSelectedStage(null);
    setFormOpen(true);
  };

  const handleSaveComplete = () => {
    setFormOpen(false);
    setSelectedStage(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 1400,
        mx: 'auto',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)'
          : 'linear-gradient(135deg, #f0f2f5 0%, #dfe4ea 100%)',
        minHeight: '100vh'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          mb: 4,
          px: 4,
          py: 3,
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(6px)',
          boxShadow: theme.shadows[2]
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              🏗️ Stage Master
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage all work stages and their details
            </Typography>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNew}
              sx={{
                background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              New Stage
            </Button>
          </motion.div>
        </Box>
      </Paper>

      <WorkStageForm
        selectedStage={selectedStage}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaveComplete={handleSaveComplete}
      />

      <WorkStageList onEdit={handleEdit} key={refreshKey} />
    </Box>
  );
};

export default StageMaster;