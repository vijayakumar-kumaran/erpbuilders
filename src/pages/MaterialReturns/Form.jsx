// File: frontend/src/pages/MaterialReturnForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid, Typography, Select, MenuItem,
  TextField, IconButton, Box, Card
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialDropdown from '../../components/reusable/TypeAheadDrop';
import axios from 'axios';
import API_URL from '../../config';

const MaterialReturnForm = ({
  items,
  materials,
  vendors,
  validationErrors,
  removeItem,
  setValidationErrors,
  setItems,
  dateOfReturn,
  setDialog
}) => {
  const [filteredMaterials, setFilteredMaterials] = useState(materials);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    // Extract unique subcategories
    const uniqueSubCategories = [...new Set(materials.map(m => m.materialSubCategory))];
    setSubCategories(uniqueSubCategories);
    setFilteredMaterials(materials);
  }, [materials]);

  useEffect(() => {
    if (selectedSubCategory) {
      setFilteredMaterials(
        materials.filter(m => m.materialSubCategory === selectedSubCategory)
      );
    } else {
      setFilteredMaterials(materials);
    }
  }, [selectedSubCategory, materials]);

  const handleItemChange = async (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'materialName') {
      const selectedMaterial = materials.find(m => m.materialName === value);
      if (selectedMaterial) {
        updatedItems[index].uom = selectedMaterial.uom || '';
        updatedItems[index].materialCode = selectedMaterial.materialCode || '';
        updatedItems[index].materialCategory = selectedMaterial.materialCategory || '';
        updatedItems[index].materialSubCategory = selectedMaterial.materialSubCategory || '';
        setSelectedSubCategory(selectedMaterial.materialSubCategory || '');
      } else {
        updatedItems[index].uom = '';
        updatedItems[index].materialCode = '';
        updatedItems[index].materialCategory = '';
        updatedItems[index].materialSubCategory = '';
      }
    }

    if (field === 'creditNote' && value === 'NO') {
      updatedItems[index].creditNoteNo = '';
    }

    if ((field === 'materialName' || field === 'returningSite') &&
      updatedItems[index].materialCode &&
      updatedItems[index].returningSite) {
      try {
        const response = await axios.get(
          `${API_URL}/api/closing/stock/${encodeURIComponent(updatedItems[index].materialCode)}/${encodeURIComponent(updatedItems[index].returningSite)}/${dateOfReturn}`
        );
        updatedItems[index].availableQty = response.data.closingQty ?? 0;
      } catch (error) {
        console.error('Error fetching stock:', error);
        updatedItems[index].availableQty = 0;
      }
    }

    if (field === 'returnQty') {
      const maxQty = parseFloat(updatedItems[index].availableQty || 0);
      const enteredQty = parseFloat(value || 0);

      if (enteredQty > maxQty) {
        setDialog({
          open: true,
          type: 'warning',
          title: 'Check Return Quantity',
          message: `Return quantity cannot exceed available stock: ${maxQty}`
        });
        updatedItems[index].returnQty = '';
        setItems(updatedItems);
        return;
      }
    }
    setItems(updatedItems);
  };

  const showReceivingSiteColumn = items.some(item => item.receiveType === 'Site');
  const showVendorNameColumn = items.some(item => item.receiveType === 'Vendor');

  return (
    <Box mt={2}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <Box ml={2} color={'black'} fontWeight={700}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Material {idx + 1}
            </Typography>
          </Box>
          <Card key={idx} sx={{ mb: 2, p: 2, borderRadius: 3, border: '1px solid #ccc' }}>       
            <Grid container spacing={3} px={2} width={'90%'}>
              <Grid item xs={12} sm={6}>
                <MaterialDropdown
                  label="Sub Category"
                  value={selectedSubCategory ? { label: selectedSubCategory, value: selectedSubCategory } : null}
                  onChange={(selected) => setSelectedSubCategory(selected ? selected.value : '')}
                  onSearch={async (searchTerm) => {
                    if (!searchTerm) return subCategories.map(sc => ({ label: sc, value: sc }));
                    return subCategories
                      .filter(sc => sc.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(sc => ({ label: sc, value: sc }));
                  }}
                  initialOptions={subCategories.map(sc => ({ label: sc, value: sc }))}
                  error={validationErrors.items[idx]?.materialSubCategory}
                  helperText={validationErrors.items[idx]?.materialSubCategory ? "SubCategory is required" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialDropdown
                  label="Material Name"
                  value={item.materialName ? { label: item.materialName, value: item.materialName } : null}
                  onChange={(selected) => {
                    handleItemChange(idx, 'materialName', selected ? selected.value : '');
                    setValidationErrors(prev => {
                      const newItems = [...prev.items];
                      newItems[idx] = { ...newItems[idx], materialName: false };
                      return { ...prev, items: newItems };
                    });
                  }}
                  onSearch={async (searchTerm) => {
                    const materialsToSearch = selectedSubCategory ? filteredMaterials : materials;
                    if (!searchTerm) return materialsToSearch.map(m => ({ label: m.materialName, value: m.materialName, ...m }));
                    return materialsToSearch
                      .filter(m => m.materialName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(m => ({ label: m.materialName, value: m.materialName, ...m }));
                  }}
                  initialOptions={filteredMaterials.map(m => ({
                    label: m.materialName,
                    value: m.materialName,
                    ...m
                  }))}
                  error={validationErrors.items[idx]?.materialName}
                  helperText={validationErrors.items[idx]?.materialName ? "Material Name is required" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6} alignItems={'center'} minWidth={80}>
                <Typography>UOM</Typography>
                <Typography color={'blue'}>{item.uom}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <MaterialDropdown
                  label="Returning Site"
                  value={item.returningSite ? { label: item.returningSite, value: item.returningSite } : null}
                  onChange={(selected) => {
                    handleItemChange(idx, 'returningSite', selected ? selected.label : '');
                    setValidationErrors(prev => {
                      const newItems = [...prev.items];
                      newItems[idx] = { ...newItems[idx], returningSite: false };
                      return { ...prev, items: newItems };
                    });
                  }}
                  onSearch={async (searchTerm) => {
                    const response = await axios.get(`${API_URL}/api/masters/sites/drop`, {
                      params: { search: searchTerm || '' }
                    });
                    return response.data;
                  }}
                  loadInitialData={true}
                  initialOptions={[]}
                  error={validationErrors.items[idx]?.returningSite}
                  helperText={validationErrors.items[idx]?.returningSite ? "Returning Site is required" : ""}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  variant='standard'
                  label="Return Qty"
                  value={item.returnQty}
                  onChange={(e) => {
                    handleItemChange(idx, 'returnQty', e.target.value);
                    setValidationErrors(prev => {
                      const newItems = [...prev.items];
                      newItems[idx] = { ...newItems[idx], returnQty: false };
                      return { ...prev, items: newItems };
                    });
                  }}
                  fullWidth
                  helperText={validationErrors.items[idx]?.returnQty ?
                    "Return Qty must be greater than 0" : `Available: ${item.availableQty || 0}`}
                  error={validationErrors.items[idx]?.returnQty}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} minWidth={210}>
                <Typography>Receiver Type</Typography>
                <Select
                  label="Receiver Type"
                  value={item.receiveType}
                  onChange={(e) => handleItemChange(idx, 'receiveType', e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="Site">Site</MenuItem>
                  <MenuItem value="Vendor">Vendor</MenuItem>
                </Select>
              </Grid>

              {item.receiveType === 'Site' && showReceivingSiteColumn && (
                <Grid item xs={12} sm={6}>
                  <MaterialDropdown
                    label="Receiving Site"
                    value={item.receivingSiteOrStock ? { label: item.receivingSiteOrStock, value: item.receivingSiteOrStock } : null}
                    onChange={(selected) => {
                      handleItemChange(idx, 'receivingSiteOrStock', selected ? selected.label : '');
                      setValidationErrors(prev => {
                        const newItems = [...prev.items];
                        newItems[idx] = { ...newItems[idx], receivingSiteOrStock: false };
                        return { ...prev, items: newItems };
                      });
                    }}
                    onSearch={async (searchTerm) => {
                      const response = await axios.get(`${API_URL}/api/masters/sites/drop`, {
                        params: { search: searchTerm || '' }
                      });
                      return response.data;
                    }}
                    loadInitialData={true}
                    initialOptions={[]}
                    error={validationErrors.items[idx]?.receivingSiteOrStock}
                    helperText={validationErrors.items[idx]?.receivingSiteOrStock ? "Receiving Site is required" : ""}
                  />
                </Grid>
              )}

              {item.receiveType === 'Vendor' && showVendorNameColumn && (
                <Grid item xs={12} sm={6}>
                  <MaterialDropdown
                    label="Vendor Name"
                    value={item.vendorName ? { label: item.vendorName, value: item.vendorName } : null}
                    onChange={(selected) => {
                      handleItemChange(idx, 'vendorName', selected ? selected.value : '');
                      setValidationErrors(prev => {
                        const newItems = [...prev.items];
                        newItems[idx] = { ...newItems[idx], vendorName: false };
                        return { ...prev, items: newItems };
                      });
                    }}
                    onSearch={async (searchTerm) => {
                      if (!searchTerm) return vendors.map(v => ({ label: v.vendorName, value: v.vendorName }));
                      return vendors
                        .filter(v => v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(v => ({ label: v.vendorName, value: v.vendorName }));
                    }}
                    initialOptions={vendors.map(v => ({ label: v.vendorName, value: v.vendorName }))}
                    error={validationErrors.items[idx]?.vendorName}
                    helperText={validationErrors.items[idx]?.vendorName ? "Vendor Name is required" : ""}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography fontSize={"0.9rem"}> Credit Note </Typography>
                
                <Select
                  label="Credit Note"
                  value={item.creditNote}
                  onChange={(e) => handleItemChange(idx, 'creditNote', e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
                <Typography fontSize={"0.8rem"}> if return to Vendor</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Credit Note #"
                  variant='standard'
                  value={item.creditNote === 'YES' ? item.creditNoteNo : ''}
                  onChange={(e) => handleItemChange(idx, 'creditNoteNo', e.target.value)}
                  size="small"
                  fullWidth
                  disabled={item.creditNote !== 'YES'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                variant='standard'
                  label="Remark"
                  value={item.remark}
                  onChange={(e) => handleItemChange(idx, 'remark', e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end">
                  <IconButton onClick={() => removeItem(idx)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default MaterialReturnForm;