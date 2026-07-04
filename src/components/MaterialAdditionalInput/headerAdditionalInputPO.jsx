// src/components/MaterialAdditionalInput/headerAdditionalInputPO.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TableContainer, TableBody, TableCell, TableRow, TableHead, Table, TextField, MenuItem, Typography, Paper, Divider } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import API_URL from '../../config';
import colors from '../../theme/color';
import { bgcolor } from '@mui/system';

const HeaderAdditionalInputPO = ({ onSelectedPOChange, onHeaderDataChange }) => {
    const [suggestedPOs, setSuggestedPOs] = useState([]);
    const [selectedPO, setSelectedPO] = useState('');
    const [headerData, setHeaderData] = useState({
        dateOfRequest: '',
        requestedBy: '',
        requestSource: '',
        siteName: '',
        dateOfPO: dayjs().format('YYYY-MM-DD')  // default to today
    });
    const [poDate, setPoDate] = useState(dayjs());

    // Fetch Suggested POs on component mount
    useEffect(() => {
        const fetchSuggestedPOs = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/mat-add-input/suggestedPOs`);
                setSuggestedPOs(res.data);
            } catch (error) {
                console.error("Error fetching suggested POs:", error.message);
            }
        };

        fetchSuggestedPOs();
    }, []);

    // Handle PO change
    const handlePOChange = async (e) => {
        const po = e.target.value;
        setSelectedPO(po);
        if (onSelectedPOChange) onSelectedPOChange(po);

        try {
            const res = await axios.get(`${API_URL}/api/mat-add-input/pos/${encodeURIComponent(po)}`);

            // Set header data and date
            const fetchedData = {
                ...res.data,
                siteName: res.data.site || '',  // map `site` to `siteName`
                dateOfPO: res.data.dateOfPO || dayjs().format('YYYY-MM-DD')  // set current date if not provided
            };

            setHeaderData(fetchedData);
            setPoDate(dayjs(fetchedData.dateOfPO));
            if (onHeaderDataChange) onHeaderDataChange(fetchedData);
        } catch (error) {
            console.error(`Error fetching header data for PO ${po}:`, error.message);
            alert('Failed to fetch PO header data');
        }
    };

    // Handle PO date change
    const handleDateOfPOChange = (newDate) => {
        const formattedDate = newDate ? newDate.format('YYYY-MM-DD') : '';
        setPoDate(newDate);
        const updatedHeaderData = { ...headerData, dateOfPO: formattedDate };
        setHeaderData(updatedHeaderData);
        if (onHeaderDataChange) onHeaderDataChange(updatedHeaderData);
    };

    return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius:3, bgcolor:colors.headerBgcolor }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
            Additional Input to Generate PO
        </Typography>

        {/* PO Selection */}
        <TextField
            select
            label="Suggested PO listing #"
            value={selectedPO}
            onChange={handlePOChange}
            fullWidth
            margin="normal"
            size="small"
            helperText="Select a suggested PO to load its details"
        >
            {suggestedPOs.map((po) => (
                <MenuItem key={po} value={po}>
                    {po}
                </MenuItem>
            ))}
        </TextField>

        {/* Divider for better grouping */}
        {selectedPO && <Divider sx={{ my: 2 }} />}

        {/* PO Header Details in Table */}
        {selectedPO && (
            <TableContainer sx={{bgcolor:colors.headerBgcolor}}  variant="outlined">
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Date of PO</TableCell>
                            <TableCell sx={{ width: '30%' }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Date of PO"
                                        value={poDate}
                                        onChange={handleDateOfPOChange}
                                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Date of Request</TableCell>
                            <TableCell sx={{ width: '30%' }}>{headerData.dateOfRequest || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Requested By</TableCell>
                            <TableCell>{headerData.requestedBy || 'N/A'}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Request Source</TableCell>
                            <TableCell>{headerData.requestSource || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Site Name / Stock</TableCell>
                            <TableCell colSpan={3}>{headerData.siteName || 'N/A'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        )}
    </Paper>
);

};

export default HeaderAdditionalInputPO;
