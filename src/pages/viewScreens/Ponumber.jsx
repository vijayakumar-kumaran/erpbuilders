import React, { useEffect, useState } from 'react';
import API_URL from '../../config';

const PoNum = ({ number }) => {
  const [reqDetails, setReqDetails] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    const deNum = encodeURIComponent(number);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/track/pono/reqnum/${deNum}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setReqDetails(data);
        setStatus(data.status || '');
      } catch (err) {
        console.error('Error loading purchase order data:', err);
        setReqDetails(null);
        setStatus('');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [number]);

  if (loading) return <div>Loading...</div>;
  if (!reqDetails) return <div>Purchase Order not found.</div>;

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-2xl font-bold mb-2">PO Number: {number}</h3>
      <p className="text-gray-600 mb-1">
        Status: <span className="font-semibold">{status}</span>
      </p>
      <p className="text-gray-600 mb-1">Vendor Name: {reqDetails.vendorName}</p>
      <p className="text-gray-600 mb-1">Vendor Address: {reqDetails.vendorAddress}</p>
      <p className="text-gray-600 mb-1">GST: {reqDetails.gst}</p>
      <p className="text-gray-600 mb-4">Date of PO: {reqDetails.dateofPO}</p>

      <h4 className="text-lg font-semibold mb-2">PO Items:</h4>
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
            <th className="border p-1">Delivery Location</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(reqDetails.poitems) && reqDetails.poitems.length > 0 ? (
            reqDetails.poitems.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-1 text-center">{item.sNo}</td>
                <td className="border p-1">{item.materialName}</td>
                <td className="border p-1">{item.materialCategory}</td>
                <td className="border p-1">{item.materialSubCategory}</td>
                <td className="border p-1">{item.materialCode}</td>
                <td className="border p-1">{item.uom}</td>
                <td className="border p-1 text-center">{item.poQty}</td>
                <td className="border p-1">{item.deliveryLocation}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PoNum;
