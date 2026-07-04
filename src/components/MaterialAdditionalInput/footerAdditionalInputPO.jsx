import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useAuth } from '../../AuthContext';

const FooterAdditionalInputPO = ({ onSave }) => {
    const { user } = useAuth();
    
    const handleSave = () => {
        if (onSave) {
            onSave(user.name); // Always pass the authenticated user's name
        }
    };

    return (
        <Box mt={2} display="flex" alignItems="center" gap={2}>
            <TextField
                variant='filled'
                label="PO Details Entered by"
                margin="normal"
                value={user?.name || ''}
                InputProps={{
                    readOnly: true,
                }}
                fullWidth
                sx={{ maxWidth: 300 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ height: 56, mt: 1 }}
            >
                Save
            </Button>
        </Box>
    );
};

export default FooterAdditionalInputPO;