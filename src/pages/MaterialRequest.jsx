import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import MaterialRequestForm from './MaterialRequest/Form';
import AlertDialog from '../components/reusable/AlertDialog'

const MaterialRequest = () => {
  const [requestNo, setRequestNo] = useState('');
  const [dateOfRequest, setDateOfRequest] = useState(dayjs());
  const [requestSource, setRequestSource] = useState('');
  const [site, setSite] = useState(null);
  const [items, setItems] = useState([{
    workStage: '', 
    materialCategory: '', 
    materialSubCategory: '', 
    materialCode: '', 
    materialName: '', 
    uom: '', 
    qty: '', 
    requiredByDate: dayjs(),
    stockLocation: '', 
    availableQty: 0
  }]);
  const [isSiteDropdownDisabled, setIsSiteDropdownDisabled] = useState(true);
  const [sources, setSources] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [dialog, setDialog] = useState({ open: false, type: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDropdowns = async () => {
    try {
      const [ s,  m] = await Promise.all([
        axios.get(`${API_URL}/api/masters/sources`),
        axios.get(`${API_URL}/api/masters/materials`)
      ]);
      setSources(s.data);
      setMaterials(m.data);
    } catch (err) {
      console.error('Dropdown loading failed', err);
      setDialog({
        open: true,
        type: 'error',
        title: 'Error Loading Data',
        message: `Please Check your Internet Connection`
      });
    }
  };

  const fetchRequestNo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/mat-request/nextNo`);
      setRequestNo(response.data.requestNo);
    } catch {
      setRequestNo('0001/25-26');
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchRequestNo();
    setSite(null);
    setIsSiteDropdownDisabled(true);
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'materialSubCategory') {
      updated[index].materialName = '';
      updated[index].materialCategory = '';
      updated[index].materialCode = '';
      updated[index].uom = '';
    }

    if (field === 'materialName') {
      const selected = materials.find(
        m => m.materialName === value && m.materialSubCategory === updated[index].materialSubCategory
      );
      if (!selected) return;

      updated[index].materialCategory = selected.materialCategory;
      updated[index].uom = selected.uom;
      updated[index].materialCode = selected.materialCode;
    }

    setItems(updated);
  };

  const addRow = () => {
    setItems([...items, { 
      workStage: '', 
      materialCategory: '', 
      materialSubCategory: '',
      materialName: '', 
      uom: '', 
      qty: '', 
      requiredByDate: dayjs() 
    }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      const updated = [...items];
      updated.splice(index, 1);
      setItems(updated);
    }
  };
  
  const saveRequest = async () => {
    if (!requestSource) {
      alert('Please select request source first');
      return;
    }

    if (isSiteDropdownDisabled === false && !site) {
      alert('Please select site');
      return;
    }

    const payload = {
      requestNo,
      dateOfRequest: dateOfRequest.format('YYYY-MM-DD'),
      requestedBy: user.name,
      requestSource,
      site: `${site?.siteName} - ${site?.location}` || site?.label || '',
      siteLocation: site?.location,
      items: items.map((item, i) => ({
        sNo: i + 1,
        workStage: item.workStage,
        materialCategory: item.materialCategory,
        materialSubCategory: item.materialSubCategory,
        materialCode: item.materialCode,
        materialName: item.materialName,
        uom: item.uom,
        qty: parseInt(item.qty),
        requiredByDate: item.requiredByDate.format('YYYY-MM-DD'),
      }))
    };
    try {
      await axios.post(`${API_URL}/api/mat-request/create`, payload);
      setDialog({
        open: true,
        type: 'success',
        title: 'Request Created',
        message: `Request created for: ${requestNo}`
      });

    } catch (err) {
      console.error('Save failed', err);         
      setDialog({
        open: true,
        type: 'error',
        title: 'Material Request Failed',
        message: `Something went Wrong, Please Check your Internet Connection.`,
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialRequestForm
        requestNo={requestNo}
        dateOfRequest={dateOfRequest}
        setDateOfRequest={setDateOfRequest}
        user={user}
        requestSource={requestSource}
        setRequestSource={setRequestSource}
        site={site}
        setSite={setSite}
        isSiteDropdownDisabled={isSiteDropdownDisabled}
        setIsSiteDropdownDisabled={setIsSiteDropdownDisabled}
        sources={sources}
        items={items}
        handleItemChange={handleItemChange}
        addRow={addRow}
        removeRow={removeRow}
        saveRequest={saveRequest}
        materials={materials}
      />
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

    </LocalizationProvider>
  );
};

export default MaterialRequest;