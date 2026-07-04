import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import OpeningStockForm from './OpeningStock/Form';
import OpeningStockList from './OpeningStock/List';
import AlertDialog from '../components/reusable/AlertDialog';

const OpeningStock = () => {
  const [materials, setMaterials] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    type: 'error',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [materialsRes, stockRes] = await Promise.all([
        axios.get(`${API_URL}/api/masters/materials/all`),
        axios.get(`${API_URL}/api/opening-stock`)
      ]);
      setMaterials(materialsRes.data);
      setStockList(stockRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        date: formData.date,
        materialName: formData.selectedMaterial
      };

      const url = editData
        ? `${API_URL}/api/opening-stock/${editData._id}`
        : `${API_URL}/api/opening-stock`;

      const method = editData ? 'put' : 'post';

      await axios[method](url, payload);

      setAlert({
        open: true,
        type: 'success',
        title: 'Success',
        message: editData ? 'Opening stock updated successfully.' : 'Opening stock created successfully.'
      });

      fetchInitialData();
      setFormOpen(false);
      setEditData(null);
    } catch (error) {
      console.error('Error saving opening stock:', error);

      // Default error message
      let errorTitle = 'Error';
      let errorMessage = 'An unexpected error occurred. Please try again.';

      // Handle axios error response
      if (error.response) {
        const { data } = error.response;

        if (data.error === 'Duplicate Entry') {
          errorTitle = data.error;
          errorMessage = data.message;

          // You can add more specific details if needed
          if (data.details) {
            errorMessage += ` (Material: ${data.details.materialName}, Site: ${data.details.site})`;
          }
        } else if (data.error) {
          errorTitle = data.error;
          errorMessage = data.message || errorMessage;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }

      setAlert({
        open: true,
        type: 'error',
        title: "Duplicate Entry Detected",
        message: "Opening stock already exists for this material and site combination"
      });
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
    setFormOpen(true);
  };

  return (
    <>
      <OpeningStockForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        materials={materials}
        initialData={editData}
      />

      <OpeningStockList
        stockList={stockList}
        onAddNew={() => setFormOpen(true)}
        onEdit={handleEdit}
      />

      <AlertDialog
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </>
  );
};

export default OpeningStock;
