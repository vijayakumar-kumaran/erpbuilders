import React, { useState, useRef } from 'react';
import HeaderMaterialOrderedPO from '../components/MaterialRequestOrderedPO/HeaderMaterialOrderedPO'
import LineItemMaterialOrderedPO from '../components/MaterialRequestOrderedPO/LineItemMaterialOrderedPO';
import FooterMaterialOrderedPO from '../components/MaterialRequestOrderedPO/FooterMaterialOrderedPO';
import { Button, Container, Box } from '@mui/material';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AlertDialog from '../components/reusable/AlertDialog';

export default function MaterialOrderedThroughPO() {
  const [formData, setFormData] = useState({ items: [], status: 'Pending' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isValidForm, setIsValidForm] = useState(true);
  const lineItemRef = useRef();
  const [dialog, setDialog] = useState({ open: false, type: 'success' });

  const handleSubmit = async () => {
     const isValid = lineItemRef.current?.validateProposedQuantities();
      if (!isValid) {
        
        return;
      }
  
      try {
        const saveData = {
          requestNo: formData.requestNo,
          dateOfRequest: formData.dateOfRequest,
          requestedBy: formData.requestedBy,
          requestSource: formData.requestSource,
          site: formData.site,
          suggestedPO: formData.suggestedPO,
          completionStatus: 'Completed',
          status: 'Pending',
          authorizedApproval: formData.authorizedApproval,
          enteredBy: user.name,
          items: formData.items.map((item) => ({
            sNo: item.sNo,
            materialCode: item.materialCode,  // <-- added this
            materialName: item.materialName,
            stockLocation: item.stockLocation,
            materialCategory: item.materialCategory,
            materialSubCategory: item.materialSubCategory,
            uom: item.uom,
            qtyRequested: item.qty,
            requiredByDate: item.requiredByDate,
            qtyAvailable: item.qtyAvailable || 0,
            suggestedQty: item.suggestedQty || 0,
            proposedQty: item.proposedQty || 0,
            remarks: item.remarks || ''
          }))
        };

      await axios.post(`${API_URL}/api/po/material-request/save`, saveData);

      await axios.post(`${API_URL}/api/mat-request/statusupdate`, {
        requestNo: formData.requestNo
      });
      setDialog({
        open: true,
        type: 'success',
        title: 'Request Created',
        message: `PO Request created for: ${formData.suggestedPO}`
      });
      
    } catch (error) {
      console.error(error);
      setDialog({
        open: true,
        type: 'error',
        title: 'PO Request Faild',
        message: `Something went Wrong Try agin later, or Check your Intenet Connection.`
      });
    }
  };    

  return (
    <Box sx={{p:3}}>
      <HeaderMaterialOrderedPO formData={formData} setFormData={setFormData} />

      {/* Conditionally render after requestNo is selected */}
      {formData.requestNo && (
        <>
          <Box sx={{ my: 3 }}>  {/* Add vertical margin (top and bottom) */}
            <LineItemMaterialOrderedPO 
            ref={lineItemRef}
            formData={formData} 
            setFormData={setFormData} 
            />
          </Box>

          <FooterMaterialOrderedPO formData={formData} setFormData={setFormData} />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Save
          </Button>
        </>
      )}

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
}