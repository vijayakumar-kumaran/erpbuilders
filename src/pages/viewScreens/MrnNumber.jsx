import React, { useEffect, useState } from 'react';
import API_URL from '../../config'

const MrnNum = ({ number }) => {
    const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;

    const fetchData = async () => {
      try {
        const deNum = encodeURIComponent(number);
        const res = await fetch(`${API_URL}/api/track/mrnno/reqnum/${deNum}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error loading return data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [number]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Return not found.</div>;

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-2xl font-bold mb-2">Return No: {data.materialReturnNo}</h3>
      <p className="text-gray-600 mb-1">Engineer: <span className="font-semibold">{data.engineerName}</span></p>
      <p className="text-gray-600 mb-1">Date: {new Date(data.dateOfReturn).toLocaleDateString()}</p>
      <p className="text-gray-600 mb-4">Entered By: {data.enteredBy}</p>

      <h4 className="text-lg font-semibold mb-2">Returned Items:</h4>
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
            <th className="border p-1">Returning Site</th>
            <th className="border p-1">Receiving Site</th>
            <th className="border p-1">Vendor</th>
            <th className="border p-1">Credit Note</th>
            <th className="border p-1">Note No</th>
            <th className="border p-1">Remark</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-1 text-center">{idx + 1}</td>
              <td className="border p-1">{item.materialName}</td>
              <td className="border p-1">{item.materialCategory}</td>
              <td className="border p-1">{item.materialSubCategory}</td>
              <td className="border p-1">{item.materialCode}</td>
              <td className="border p-1">{item.uom}</td>
              <td className="border p-1 text-center">{item.returnQty}</td>
              <td className="border p-1">{item.returningSite}</td>
              <td className="border p-1">{item.receivingSiteOrStock}</td>
              <td className="border p-1">{item.vendorName || '-'}</td>
              <td className="border p-1 text-center">{item.creditNote}</td>
              <td className="border p-1">{item.creditNoteNo || '-'}</td>
              <td className="border p-1">{item.remark || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MrnNum;

