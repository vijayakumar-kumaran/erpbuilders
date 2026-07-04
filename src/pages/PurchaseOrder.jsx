import React, { useRef, useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import HeaderPO from '../components/PurchaseOrder/headerPO';
import LineItemPO from '../components/PurchaseOrder/lineItemPO';
import FooterPO from '../components/PurchaseOrder/footerPO';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { head } from 'lodash';
import AlertDialog from '../components/reusable/AlertDialog';

const PurchaseOrder = () => {
  const [poNumber, setPoNumber] = useState('');
  const [headerData, setHeaderData] = useState({});
  const [items, setItems] = useState([]);
  const [vendor, setVendor] = useState({});
  const [enteredBy, setEnteredBy] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const printRef = useRef();
  const [vendorName, setVendorName] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: 'success' });

  const sanitizeFileName = (poNo) => {
    return poNo.replace(/[\\/]/g, '-'); // Replace / or \ with -
  };

  const generatePDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Increase for better quality
      logging: false,
      useCORS: true,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10; // 10mm margin on all sides
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image with margins
    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      margin,
      margin,
      pdfWidth,
      pdfHeight
    );

    return pdf;
  };

  const handleSave = async () => {
    const requestNo = headerData.requestNo || ''
    const suggestedPO = headerData.suggestedPO || ''

    const payload = {
      poNumber: poNumber,
      requestNo,
      suggestedPO,
      vendorName: vendor.vendorName,
      vendorAddress: `${vendor.address1}, ${vendor.address2}`,
      gst: vendor.gstNo,
      dateofPO: headerData.dateOfPO,
      siteName: headerData.siteName,
      generatedBy: enteredBy,
      poitems: items.map(item => ({
        sNo: item.sNo,
        materialName: item.materialName,
        materialCode:item.materialCode,
        materialCategory:item.materialCategory,
        materialSubCategory:item.materialSubCategory,
        uom: item.uom,
        poQty: item.proposedQty,
        rate: item.rate,
        amount: item.amount,
        deliveryLocation: item.deliveryLocation            
      }))
    };
    
    try {
      await axios.post(`${API_URL}/api/purchase-order`, payload);
      await axios.put(`${API_URL}/api/purchase-order/material/mark-complete/${encodeURIComponent(poNumber)}`);

      // Generate and save PDF
      const pdf = await generatePDF();
      pdf.save(`${sanitizeFileName(poNumber)}.pdf`);

      setDialog({
        open: true,
        type: 'success',
        title: 'Purchase Order Created',
        message: `Purchase Order Created for: ${poNumber}, Please Check The Downloaded PDF.`
      });

    } catch (err) {
      console.error('Error saving purchase order:', err);
       setDialog({
        open: true,
        type: 'error',
        title: 'Purchase Order Failed',
        message: `Something went Wrong, Please Check your Internet Connection.`,
      });
    }
  };

  return (
    <Box sx={{p:3}}>
        <HeaderPO
          poNumber={poNumber}
          setPoNumber={setPoNumber}
          setHeaderData={setHeaderData}
          setItems={setItems}
          setVendor={setVendor}
          setShowDetails={setShowDetails}
          setVendorName={setVendorName}
        />
        
        {showDetails && (
          <Box sx={{my:2, p:2, borderRadius:3, border:'0.5px solid gray', }}>
          <div 
            
            ref={printRef}
            style={{
              padding: '20px', // Add padding for better PDF appearance
              backgroundColor: 'white' // Ensure white background for PDF
            }}
          >

            <Typography variant="body2" sx={{ mt: 2 }}>
              Date of PO: {headerData.dateOfPO}
            </Typography>

            {showDetails && vendor && (
              <Box sx={{ mt: 2}}>
                <Typography variant="subtitle1">Vendor Name: {vendor.vendorName}</Typography>
                <Typography variant="body2">Vendor Address: <br /> {vendor.address1}</Typography>
                <Typography variant="body2">{vendor.address2}</Typography>
                <Typography variant="body2">GST #: {vendor.gstNo}</Typography>
              </Box>
            )}

            <LineItemPO items={items} />
            <FooterPO enteredBy={enteredBy} setEnteredBy={setEnteredBy} />
          </div>
           </Box>
        )}
       

        {showDetails && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            {/* <Button variant="outlined" color="secondary" onClick={handleGetPDF}>
              Get PDF
            </Button> */}
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
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
};

export default PurchaseOrder;