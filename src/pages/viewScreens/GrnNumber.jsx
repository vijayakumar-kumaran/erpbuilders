import React, { useEffect, useState } from 'react';
import API_URL from '../../config';

const GrnNum = ({ number }) => {
  const [numberOptions, setNumberOptions] = useState([])
  const [grnData, setGrnData] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    if (!number) return;

    // 🔹 Fetch list of GRN numbers (optional)
    const fetchGrnNumbers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/track/grnno/all`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setNumberOptions(data);
        } else {
          console.error('Invalid GRN number response:', data);
          setNumberOptions([]);
        }
      } catch (err) {
        console.error('Failed to load GRN numbers:', err);
        setNumberOptions([]);
      }
    };

    // 🔹 Fetch specific GRN detail
    const fetchGrnDetails = async () => {
      setLoading(true);
      try {
        const encodedGrn = encodeURIComponent(number);
        const res = await fetch(`${API_URL}/api/track/grnno/reqnum/${encodedGrn}`);
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        setGrnData(data);
      } catch (err) {
        console.error('Error loading GRN data:', err);
        setGrnData(null);
      } finally {
        setLoading(false);
      }
    };

    // ✅ Call both
    fetchGrnNumbers();
    fetchGrnDetails();
  }, [number]);

  if (loading) return <div>Loading...</div>;
  if (!grnData) return <div>GRN not found.</div>;

  return (
    <div className="p-4 border rounded shadow-md bg-white">

      <h3 className="text-gray-600 mb-1">
        GRN Status: <span className={`font-semibold ${grnData.status === 'Completed' ? 'text-green-600' : 'text-red-600'}`}>
            {grnData.status}
        </span>
        </h3>
      <h3 className="text-2xl font-bold mb-2">GRN Number: {grnData.grnNumber}</h3>
      <p className="text-gray-600 mb-1">PO Number: <span className="font-semibold">{grnData.poNumber}</span></p>
      <p className="text-gray-600 mb-1">Vendor: {grnData.vendorName}</p>
      <p className="text-gray-600 mb-1">Address: {grnData.vendorAddress}</p>
      <p className="text-gray-600 mb-1">DC: {grnData.vendorDC}</p>
      <p className="text-gray-600 mb-1">Invoice: {grnData.vendorInvoice}</p>
      <p className="text-gray-600 mb-4">PO Date: {new Date(grnData.dateOfPO).toLocaleDateString()}</p>

      <h4 className="text-lg font-semibold mb-2">Received Items:</h4>
      <table className="w-full border table-auto text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">S.No</th>
            <th className="border p-1">Material</th>
            <th className="border p-1">Category</th>
            <th className="border p-1">Sub-Category</th>
            <th className="border p-1">Code</th>
            <th className="border p-1">UOM</th>
            <th className="border p-1">PO Qty</th>
            <th className="border p-1">Received Qty</th>
            <th className="border p-1">Received By</th>
            <th className="border p-1">Location</th>
            <th className="border p-1">Direct to Site</th>
          </tr>
        </thead>
        <tbody>
          {grnData.lineItems.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-1 text-center">{item.sNo}</td>
              <td className="border p-1">{item.materialName}</td>
              <td className="border p-1">{item.materialCategory}</td>
              <td className="border p-1">{item.materialSubCategory}</td>
              <td className="border p-1">{item.materialCode}</td>
              <td className="border p-1">{item.uom}</td>
              <td className="border p-1 text-center">{item.poQty}</td>
              <td className="border p-1 text-center">{item.receivedQty}</td>
              <td className="border p-1 text-center">{item.receivedBy}</td>
              <td className="border p-1 text-center">{item.receivingLocation}</td>
              <td className="border p-1 text-center">{item.directToSite}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GrnNum;
