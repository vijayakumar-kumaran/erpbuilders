import React, { useEffect, useState } from 'react';
import API_URL from '../../config';

const StockTRFNum = ({ number }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    const fetchData = async () => {
      try {
        const deNum = encodeURIComponent(number);
        const res = await fetch(`${API_URL}/api/track/stocktrfno/reqnum/${deNum}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error loading stock transfer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [number]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Stock transfer not found.</div>;

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-2xl font-bold mb-2">Transfer No: {data.stockTransferNo}</h3>
      <p className="text-gray-600 mb-1">Date: {new Date(data.dateOfTransfer).toLocaleDateString()}</p>
      <p className="text-gray-600 mb-1">Entered By: <span className="font-semibold">{data.enteredBy}</span></p>

      <h4 className="text-lg font-semibold mt-4 mb-2">Transferred Items:</h4>
      <table className="w-full border table-auto text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">S.No</th>
            <th className="border p-1">Material</th>
            <th className="border p-1">Category</th>
            <th className="border p-1">Sub-Category</th>
            <th className="border p-1">Code</th>
            <th className="border p-1">UOM</th>
            <th className="border p-1">Qty</th>
            <th className="border p-1">Issuing Site</th>
            <th className="border p-1">Receiving Site</th>
            <th className="border p-1">Issued By</th>
            <th className="border p-1">Received By</th>
            <th className="border p-1">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={item._id || idx}>
              <td className="border p-1 text-center">{idx + 1}</td>
              <td className="border p-1">{item.materialName}</td>
              <td className="border p-1">{item.materialCategory}</td>
              <td className="border p-1">{item.materialSubCategory}</td>
              <td className="border p-1">{item.materialCode}</td>
              <td className="border p-1">{item.uom}</td>
              <td className="border p-1 text-center">{item.transferQty}</td>
              <td className="border p-1">{item.issuingSite}</td>
              <td className="border p-1">{item.receivingSite}</td>
              <td className="border p-1">{item.issuedBy}</td>
              <td className="border p-1">{item.receivedBy}</td>
              <td className="border p-1">{item.remarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTRFNum;
