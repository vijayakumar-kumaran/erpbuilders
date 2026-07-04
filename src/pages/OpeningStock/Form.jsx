import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, TextField, Button, MenuItem
} from '@mui/material';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';
import dayjs from 'dayjs';
import axios from 'axios';
import API_URL from '../../config';

const OpeningStockForm = ({ open, onClose, onSubmit, materials, initialData }) => {
    const [form, setForm] = useState({
        date: dayjs().format('YYYY-MM-DD'),
        materialCode: '',
        materialCategory: '',
        materialSubCategory: '',
        uom: '',
        site: '',
        openingQty: '',
        selectedMaterial: ''
    });

    const [materialSubCategories, setMaterialSubCategories] = useState([]);

    React.useEffect(() => {
        if (initialData) {
            setForm({
                date: initialData.date,
                materialCode: initialData.materialCode,
                materialCategory: initialData.materialCategory,
                materialSubCategory: initialData.materialSubCategory,
                uom: initialData.uom,
                site: initialData.site,
                openingQty: initialData.openingQty,
                selectedMaterial: initialData.materialName
            });
        } else {
            setForm({
                date: dayjs().format('YYYY-MM-DD'),
                materialCode: '',
                materialCategory: '',
                materialSubCategory: '',
                uom: '',
                site: '',
                openingQty: '',
                selectedMaterial: ''
            });
        }

        // Fetch unique material subcategories
        const fetchSubCategories = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/masters/material-sub-category/all`);
                setMaterialSubCategories(res.data);
            } catch (error) {
                console.error('Error fetching subcategories:', error);
            }
        };
        fetchSubCategories();
    }, [initialData]);

    const handleMaterialSubCategoryChange = (selected) => {
        const subCategory = selected?.label || '';
        setForm({
            ...form,
            materialSubCategory: subCategory,
            selectedMaterial: '',
            materialCode: '',
            materialCategory: '',
            uom: ''
        });
    };

    const handleMaterialChange = (selected) => {
        const materialName = selected?.label || '';
        const material = materials.find(m => m.materialName === materialName);
        setForm({
            ...form,
            selectedMaterial: materialName,
            materialCode: material?.materialCode || '',
            materialCategory: material?.materialCategory || '',
            uom: material?.uom || '',
        });
    };

    const handleSubmit = () => {
        if (dayjs(form.date).isAfter(dayjs(), 'day')) {
            return alert("Date cannot be in the future.");
        }
        if (!form.materialSubCategory) {
            return alert("Please select a material subcategory first");
        }
        if (!form.selectedMaterial) {
            return alert("Please select a material");
        }
        onSubmit(form);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initialData ? 'Edit Opening Stock' : 'Add Opening Stock'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Material Subcategory Dropdown */}
                    <Grid item xs={12} sm={4}>
                        <MaterialDropdown
                            placeholder="Select Subcategory"
                            value={form.materialSubCategory ? {
                                label: form.materialSubCategory,
                                value: form.materialSubCategory
                            } : null}
                            onChange={handleMaterialSubCategoryChange}
                            onSearch={async (searchTerm) => {
                                try {
                                    const res = await axios.get(`${API_URL}/api/masters/material-sub-category/drop`, {
                                        params: { search: searchTerm }
                                    });
                                    return res.data;
                                } catch (err) {
                                    console.error('Error fetching subcategories:', err);
                                    return [];
                                }
                            }}
                            loadInitialData={true}
                        />
                    </Grid>

                    {/* Material Name Dropdown */}
                    <Grid item xs={12} sm={4}>
                        <MaterialDropdown
                            placeholder="Select Material"
                            value={form.selectedMaterial ? {
                                label: form.selectedMaterial,
                                value: form.selectedMaterial
                            } : null}
                            onChange={handleMaterialChange}
                            disabled={!form.materialSubCategory}
                            onSearch={async (searchTerm) => {
                                try {
                                    const res = await axios.get(`${API_URL}/api/masters/materials/drop`, {
                                        params: {
                                            search: searchTerm,
                                            materialSubCategory: form.materialSubCategory
                                        }
                                    });
                                    return res.data;
                                } catch (err) {
                                    console.error('Error fetching materials:', err);
                                    return [];
                                }
                            }}
                            loadInitialData={true} // Add this prop
                            initialSearchParams={{
                                materialSubCategory: form.materialSubCategory
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Material Code"
                            fullWidth
                            size="small"
                            value={form.materialCode}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Category"
                            fullWidth
                            size="small"
                            value={form.materialCategory}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Sub Category"
                            fullWidth
                            size="small"
                            value={form.materialSubCategory}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="UoM"
                            fullWidth
                            size="small"
                            value={form.uom}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MaterialDropdown
                            placeholder="Search site..."
                            value={form.site ? { label: form.site, value: form.site } : null}
                            onSearch={async (searchTerm) => {
                                try {
                                    const res = await axios.get(`${API_URL}/api/masters/sites/stock/q`, {
                                        params: { search: searchTerm }
                                    });
                                    return res.data.map(site => ({
                                        label: `${site.siteName} - ${site.location}`,
                                        value: site._id,
                                        ...site
                                    }));
                                } catch (err) {
                                    console.error('Error fetching sites:', err);
                                    return [];
                                }
                            }}
                            onChange={(selected) => {
                                setForm({ ...form, site: selected?.label || '' });
                            }}
                            loadInitialData={true}
                            minCharsToSearch={0}
                            disabled={!form.selectedMaterial}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Quantity"
                            type="number"
                            fullWidth
                            size="small"
                            value={form.openingQty}
                            onChange={(e) => setForm({ ...form, openingQty: e.target.value })}
                            inputProps={{ min: 0 }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!form.selectedMaterial || !form.site || !form.openingQty}
                >
                    {initialData ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OpeningStockForm;