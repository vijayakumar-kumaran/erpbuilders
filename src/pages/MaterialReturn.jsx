// File: frontend/src/pages/MaterialReturn.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, Card } from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import MaterialDropdown from '../components/reusable/TypeAheadDrop';
import { useAuth } from '../AuthContext';
import colors from '../theme/color';
import AlertDialog from '../components/reusable/AlertDialog';
import MaterialReturnForm from './MaterialReturns/Form';

const MaterialReturn = () => {
  const [materialReturnNo, setMaterialReturnNo] = useState('');
  const [dateOfReturn, setDateOfReturn] = useState(new Date().toISOString().slice(0, 10));
  const [engineers, setEngineers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [enteredBy, setEnteredBy] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [items, setItems] = useState([createEmptyItem()]);
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  const [validationErrors, setValidationErrors] = useState({
    engineerName: false,
    items: []
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [engineerRes, materialRes, vendorRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/api/masters/users`),
        axios.get(`${API_URL}/api/masters/materials`),
        axios.get(`${API_URL}/api/masters/vendors`),
        axios.get(`${API_URL}/api/masters/users`),
      ]);

      setEngineers(engineerRes.data);
      setMaterials(materialRes.data);
      setVendors(vendorRes.data);
      setUsers(userRes.data);

      const rtnNoRes = await axios.get(`${API_URL}/api/material-return/generate-return-no`);
      setMaterialReturnNo(rtnNoRes.data.returnNo);
      setEnteredBy(userRes.data[0]?.name || '');
    };

    fetchData();
  }, []);

  useEffect(() => {
    setValidationErrors(prev => ({
      ...prev,
      items: items.map(item => ({
        materialSubCategory: false,
        materialName: false,
        returningSite: false,
        returnQty: false,
        receivingSiteOrStock: false,
        vendorName: false
      }))
    }));
  }, [items]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      engineerName: !engineerName,
      items: items.map(item => {
        const itemErrors = {
          materialSubCategory: !item.materialSubCategory,
          materialName: !item.materialName,
          returningSite: !item.returningSite,
          returnQty: !item.returnQty || parseFloat(item.returnQty) <= 0,
          receivingSiteOrStock: item.receiveType === 'Site' && !item.receivingSiteOrStock,
          vendorName: item.receiveType === 'Vendor' && !item.vendorName
        };

        if (Object.values(itemErrors).some(error => error)) {
          isValid = false;
        }

        return itemErrors;
      })
    };

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.validation-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload = {
      materialReturnNo,
      dateOfReturn,
      engineerName,
      items,
      enteredBy,
    };

    try {
      await axios.post(`${API_URL}/api/material-return/save`, payload);
      setDialog({
        open: true,
        type: 'success',
        title: 'Material Return Created',
        message: `Material Return Created Successfuly For: ${materialReturnNo}`
      });
      
      // Reset form
      const rtnNoRes = await axios.get(`${API_URL}/api/material-return/generate-return-no`);
      setMaterialReturnNo(rtnNoRes.data.returnNo);
      setDateOfReturn(new Date().toISOString().slice(0, 10));
      setItems([createEmptyItem()]);
      setEngineerName('');
    } catch (error) {
      setDialog({
        open: true,
        type: 'error',
        title: 'Material Return Failed!',
        message: `${error.message}: Please Check your Internet Connection.`
      });
    }
  };

  const addNewItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  return (
    <Box p={4}>
      <Paper mb={2} display="flex" gap={3} flexWrap="wrap" sx={{ p: 4, bgcolor: colors.headerBgcolor, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Material Return from Site to Stock or Vendor
        </Typography>
        <TextField
          label="Matl Return #"
          value={materialReturnNo}
          InputProps={{ readOnly: true }}
          size="small"
        />
        <TextField
          label="Date of Return"
          type="date"
          value={dateOfReturn}
          onChange={(e) => setDateOfReturn(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ ml: 3 }}
        />
        <Box sx={{ my: 2, maxWidth: 230 }} className={validationErrors.engineerName ? 'validation-error' : ''}>
          <MaterialDropdown
            label="Engineer Name"
            placeholder='Engineer Name'
            value={engineerName ? { label: engineerName, value: engineerName } : null}
            onChange={(selected) => {
              setEngineerName(selected ? selected.value : '');
              setValidationErrors(prev => ({ ...prev, engineerName: false }));
            }}
            onSearch={async (searchTerm) => {
              if (!searchTerm) return engineers.map(eng => ({ label: eng.name, value: eng.name }));
              return engineers
                .filter(eng => eng.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(eng => ({ label: eng.name, value: eng.name }));
            }}
            loadInitialData={true}
            initialOptions={engineers.map(eng => ({ label: eng.name, value: eng.name }))}
            error={validationErrors.engineerName}
            helperText={validationErrors.engineerName ? "Engineer Name is required" : ""}
          />
        </Box>
      </Paper>

      <MaterialReturnForm 
        items={items}
        materials={materials}
        vendors={vendors}
        validationErrors={validationErrors}
        removeItem={removeItem}
        setValidationErrors={setValidationErrors}
        setItems={setItems}
        dateOfReturn={dateOfReturn}
      />

      <Box mt={2}>
        <Button variant="outlined" onClick={addNewItem}>
          + Add Item
        </Button>
      </Box>

      <Box mt={3} display="flex" gap={2} alignItems="center">
        <TextField
          variant='filled'
          label="Entered By"
          value={user.name}
          inputProps={{ readOnly: true }}
        />
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Box>

      <AlertDialog
        open={dialog.open}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onClose={() => {
          setDialog({ ...dialog, open: false });
          if (dialog.type === 'success') {
            navigate('/');
          }
        }}
      />
    </Box>
  );
};

function createEmptyItem() {
  return {
    materialName: '',
    materialCode: '',
    materialCategory: '',
    materialSubCategory: '',
    uom: '',
    returnQty: '',
    returningSite: '',
    receiveType: 'Site',
    receivingSiteOrStock: '',
    vendorName: '',
    creditNote: 'NO',
    creditNoteNo: '',
    remark: '',
  };
}

export default MaterialReturn;