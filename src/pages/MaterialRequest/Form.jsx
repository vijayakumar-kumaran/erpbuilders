import React from 'react';
import {
    TextField, MenuItem, Select, InputLabel, FormControl,
    Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography,
    Box, Paper, Grid, Button,
    Divider,
    FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import dayjs from 'dayjs';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';
import API_URL from '../../config';
import axios from 'axios';
import colors from '../../theme/color';

const MaterialRequestForm = ({
    requestNo,
    dateOfRequest,
    setDateOfRequest,
    user,
    requestSource,
    setRequestSource,
    site,
    setSite,
    isSiteDropdownDisabled,
    setIsSiteDropdownDisabled,
    sources,
    items,
    handleItemChange,
    addRow,
    removeRow,
    saveRequest,
    materials
}) => {
    // State for validation errors
    const [errors, setErrors] = React.useState({
        dateOfRequest: false,
        requestSource: false,
        site: false,
        items: []
    });

    // Validate all fields before saving
    const validateAndSave = () => {
        // Validate header fields
        const newErrors = {
            dateOfRequest: !dateOfRequest,
            requestSource: !requestSource,
            site: !site,
            items: items.map(item => ({
                workStage: !item.workStage,
                materialSubCategory: !item.materialSubCategory,
                materialName: !item.materialName,
                qty: !item.qty || item.qty <= 0,
                requiredByDate: !item.requiredByDate
            }))
        };

        setErrors(newErrors);

        // Check if any errors exist
        const hasErrors = 
            newErrors.dateOfRequest || 
            newErrors.requestSource || 
            newErrors.site || 
            newErrors.items.some(item => 
                item.workStage || 
                item.materialSubCategory || 
                item.materialName || 
                item.qty || 
                item.requiredByDate
            );

        if (!hasErrors) {
            saveRequest();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius:4,  bgcolor: colors.headerBgcolor }}>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3 }}>Material Request Form</Typography>

                {/* Request Info */}
                <Grid container spacing={3} sx={{ mb: 3}}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Request No."
                            value={requestNo}
                            disabled
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <DatePicker
                            label="Date of Request"
                            value={dateOfRequest}
                            minDate={dayjs()}
                            maxDate={dayjs().add(7, 'day')}
                            onChange={(newValue) => {
                                setDateOfRequest(newValue);
                                setErrors(prev => ({...prev, dateOfRequest: false}));
                            }}
                            slotProps={{ 
                                textField: { 
                                    fullWidth: true, 
                                    size: 'small',
                                    error: errors.dateOfRequest,
                                    helperText: errors.dateOfRequest ? "Date of request is required" : ""
                                } 
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            variant="outlined"
                            label="Requested By"
                            value={user?.name || ''}
                            inputProps={{ readOnly: true }}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                </Grid>

                <Divider sx={{mb:3}}/>

                {/* Header Dropdowns */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120, maxWidth: { xs: '100%', sm: 300 } }} error={errors.requestSource}>
                            <InputLabel>Request Source *</InputLabel>
                            <Select
                                value={requestSource}
                                onChange={(e) => {
                                    setRequestSource(e.target.value);
                                    setSite(null);
                                    setIsSiteDropdownDisabled(false);
                                    setErrors(prev => ({...prev, requestSource: false}));
                                }}
                                required
                                label="Request Source *"
                                sx={{
                                    '& .MuiSelect-select': {
                                        minWidth: '120px !important',
                                        bgcolor:'white'
                                    }
                                }}
                            >
                                {sources.map(s => (
                                    <MenuItem key={s._id} value={s.sourceName}>
                                        {s.sourceName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.requestSource && <FormHelperText>Request source is required</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <FormControl fullWidth size="small" error={errors.site}>
                            <MaterialDropdown
                                placeholder={isSiteDropdownDisabled ? "Select request source first" : "Select Site *"}
                                value={site}
                                onChange={(selected) => {
                                    if (!selected) return;
                                    setSite({
                                        ...selected,
                                        siteName: selected.siteName || selected.label?.split(' - ')[0],
                                        location: selected.location || selected.label?.split('(')[1]?.replace(')', '') || ''
                                    });
                                    setErrors(prev => ({...prev, site: false}));
                                }}
                                disabled={isSiteDropdownDisabled}
                                onSearch={async (searchTerm) => {
                                    try {
                                        const url = requestSource === 'Site'
                                            ? `${API_URL}/api/masters/sites/nonstock/q`
                                            : `${API_URL}/api/masters/sites/stock/q`;

                                        const res = await axios.get(url, { params: { search: searchTerm } });

                                        return res.data.map(site => ({
                                            label: `${site.siteName} - (${site.location})`,
                                            value: site._id,
                                            siteName: site.siteName,
                                            location: site.location,
                                            ...site
                                        }));
                                    } catch (err) {
                                        console.error('Site search failed:', err);
                                        return [];
                                    }
                                }}
                                loadInitialData={true}
                            />
                            {errors.site && <FormHelperText sx={{ color: 'error.main', ml: 1 }}>Site is required</FormHelperText>}
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Items Table */}
            <Box sx={{ p: 3, mb: 3, border:'0.5px solid gray',  borderRadius:3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>Request Items</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="5%">S.No</TableCell>
                                <TableCell width="15%">Work Stage *</TableCell>
                                <TableCell width="15%">Sub Category *</TableCell>
                                <TableCell width="20%">Material Name *</TableCell>
                                <TableCell width="10%">Qty *</TableCell>
                                <TableCell>Required Date *</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row, index) => (
                                <React.Fragment key={index}>
                                    {/* First Line */}
                                    <TableRow hover>
                                        <TableCell rowSpan={2}>{index + 1}</TableCell>
                                        <TableCell sx={{ minWidth: 300 }}>
                                            <MaterialDropdown
                                                placeholder="Stage..."
                                                value={row.workStage ? { label: row.workStage, value: row.workStage } : null}
                                                loadInitialData={true}
                                                onChange={(selected) => {
                                                    const workStage = selected?.label || '';
                                                    handleItemChange(index, 'workStage', workStage);
                                                    setErrors(prev => {
                                                        const newItems = [...prev.items];
                                                        newItems[index] = {...newItems[index], workStage: false};
                                                        return {...prev, items: newItems};
                                                    });
                                                }}
                                                onSearch={async (searchTerm) => {
                                                    const { data } = await axios.get(`${API_URL}/api/masters/stages/drop`, {
                                                        params: { search: searchTerm || '' }
                                                    });
                                                    return data;
                                                }}
                                                size="small"
                                                fullWidth
                                                error={errors.items[index]?.workStage}
                                                helperText={errors.items[index]?.workStage ? "Required" : ""}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 300 }}>
                                            <MaterialDropdown
                                                placeholder="Sub Category..."
                                                value={row.materialSubCategory ? { label: row.materialSubCategory, value: row.materialSubCategory } : null}
                                                loadInitialData={true}
                                                onChange={(selected) => {
                                                    const subcat = selected?.label || '';
                                                    handleItemChange(index, 'materialSubCategory', subcat);
                                                    handleItemChange(index, 'materialName', '');
                                                    handleItemChange(index, 'materialCategory', '');
                                                    handleItemChange(index, 'uom', '');
                                                    handleItemChange(index, 'materialCode', '');
                                                    setErrors(prev => {
                                                        const newItems = [...prev.items];
                                                        newItems[index] = {...newItems[index], materialSubCategory: false};
                                                        return {...prev, items: newItems};
                                                    });
                                                }}
                                                onSearch={async (searchTerm) => {
                                                    const { data } = await axios.get(`${API_URL}/api/masters/material-sub-category/drop`, {
                                                        params: { search: searchTerm || '' }
                                                    });
                                                    return data;
                                                }}
                                                size="small"
                                                fullWidth
                                                error={errors.items[index]?.materialSubCategory}
                                                helperText={errors.items[index]?.materialSubCategory ? "Required" : ""}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 300 }}>
                                            <MaterialDropdown
                                                placeholder="Search Material..."
                                                value={row.materialName ? { label: row.materialName, value: row.materialName } : null}
                                                loadInitialData={true}
                                                onChange={(selected) => {
                                                    const materialName = selected?.label || '';
                                                    handleItemChange(index, 'materialName', materialName);
                                                    setErrors(prev => {
                                                        const newItems = [...prev.items];
                                                        newItems[index] = {...newItems[index], materialName: false};
                                                        return {...prev, items: newItems};
                                                    });
                                                }}
                                                onSearch={async (searchTerm) => {
                                                    if (!row.materialSubCategory) return [];
                                                    const { data } = await axios.get(`${API_URL}/api/masters/materials/drop`, {
                                                        params: {
                                                            search: searchTerm || '',
                                                            materialSubCategory: row.materialSubCategory,
                                                        },
                                                    });
                                                    return data;
                                                }}
                                                size="small"
                                                fullWidth
                                                error={errors.items[index]?.materialName}
                                                helperText={errors.items[index]?.materialName ? "Required" : ""}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 100 }}>
                                            <TextField
                                                type="number"
                                                inputProps={{ min: 1 }}
                                                value={row.qty}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value || '0');
                                                    handleItemChange(index, 'qty', val);
                                                    setErrors(prev => {
                                                        const newItems = [...prev.items];
                                                        newItems[index] = {...newItems[index], qty: false};
                                                        return {...prev, items: newItems};
                                                    });
                                                }}
                                                fullWidth
                                                size="small"
                                                error={errors.items[index]?.qty}
                                                helperText={errors.items[index]?.qty ? "Quantity must be greater than 0" : ""}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ width: 100 }}>
                                            <DatePicker
                                                minDate={dayjs()}
                                                value={row.requiredByDate}
                                                onChange={(val) => {
                                                    handleItemChange(index, 'requiredByDate', val);
                                                    setErrors(prev => {
                                                        const newItems = [...prev.items];
                                                        newItems[index] = {...newItems[index], requiredByDate: false};
                                                        return {...prev, items: newItems};
                                                    });
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true,
                                                        sx: { width: 150 },
                                                        error: errors.items[index]?.requiredByDate,
                                                        helperText: errors.items[index]?.requiredByDate ? "Required" : ""
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell rowSpan={2} align="center">
                                            <IconButton
                                                onClick={() => removeRow(index)}
                                                color="error"
                                                size="small"
                                            >
                                                <RemoveCircle fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {/* Second Line - Additional Details */}
                                    <TableRow hover sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell colSpan={2}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: '600',
                                                    color: '#2e7d32',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {row.materialCode && `Code: ${row.materialCode}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell colSpan={1}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: '600',
                                                    color: '#1565c0',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {row.materialCategory && `Category: ${row.materialCategory}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell colSpan={2}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: '600',
                                                    color: '#6a1b9a',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {row.uom && `UOM: ${row.uom}`}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        startIcon={<AddCircle />}
                        onClick={addRow}
                        variant="outlined"
                        size="small"
                    >
                        Add Item
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={validateAndSave}
                        size="large"
                        sx={{ minWidth: 150 }}
                    >
                        Save Request
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default MaterialRequestForm;