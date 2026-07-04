import React, { useEffect, useState } from 'react';
import API_URL from '../../config'

const SplNum = ({ number }) => {
  const [reqDetails, setReqDetails] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  console.log(reqDetails)
  useEffect(() => {
    if (!number) return;
    const deNum = encodeURIComponent(number)
    const fetchData = async () => {
      try {
        // Fetch full details
        const res1 = await fetch(`${API_URL}/api/track/splno/reqnum/${deNum}`);
        const data1 = await res1.json();
        setReqDetails(data1);

        // Fetch status
        const res2 = await fetch(`${API_URL}/api/track/splno/status/${deNum}`);
        const data2 = await res2.json();
        setStatus(data2.status);
      } catch (err) {
        console.error("Error loading request data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [number]);

  if (loading) return <div>Loading...</div>;
  if (!reqDetails) return <div>Request not found.</div>;

  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-2xl font-bold mb-2">Request No: {number}</h3>
      <p className="text-gray-600 mb-1">Status: <span className="font-semibold">{status}</span></p>
      <p className="text-gray-600 mb-1">Requested By: {reqDetails.requestedBy}</p>
      <p className="text-gray-600 mb-1">Date: {reqDetails.dateOfRequest}</p>
      <p className="text-gray-600 mb-1">Source: {reqDetails.requestSource}</p>
      <p className="text-gray-600 mb-4">Site: {reqDetails.site}</p>

      <h4 className="text-lg font-semibold mb-2">Requested Items:</h4>
        <table className="w-full border table-auto text-sm">
        <thead>
            <tr className="bg-gray-100">
            <th className="border p-1">S.No</th>
            <th className="border p-1">Material</th>
            <th className="border p-1">Category</th>
            <th className="border p-1">Sub-Category</th>
            <th className="border p-1">Code</th>
            <th className="border p-1">UOM</th>
            <th className="border p-1">Req. Qty</th>
            <th className="border p-1">Available</th>
            <th className="border p-1">Suggested</th>
            <th className="border p-1">Proposed</th>
            <th className="border p-1">Required By</th>
            <th className="border p-1">Remarks</th>
            {status === 'POstage' && (
                <>
                <th className="border p-1">Vendor</th>
                <th className="border p-1">Vendor Code</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Amount</th>
                <th className="border p-1">Delivery Location</th>
                </>
            )}
            </tr>
        </thead>
        <tbody>
            {reqDetails.items.map((item, idx) => (
            <tr key={idx}>
                <td className="border p-1 text-center">{item.sNo}</td>
                <td className="border p-1">{item.materialName}</td>
                <td className="border p-1">{item.materialCategory}</td>
                <td className="border p-1">{item.materialSubCategory}</td>
                <td className="border p-1">{item.materialCode}</td>
                <td className="border p-1">{item.uom}</td>
                <td className="border p-1 text-center">{item.qtyRequested}</td>
                <td className="border p-1 text-center">{item.qtyAvailable}</td>
                <td className="border p-1 text-center">{item.suggestedQty}</td>
                <td className="border p-1 text-center">{item.proposedQty}</td>
                <td className="border p-1 text-center">{item.requiredByDate}</td>
                <td className="border p-1">{item.remarks}</td>
                {status === 'POstage' && (
                <>
                    <td className="border p-1">{item.vendorName}</td>
                    <td className="border p-1">{item.vendorCode}</td>
                    <td className="border p-1 text-right">{item.rate}</td>
                    <td className="border p-1 text-right">{item.amount}</td>
                    <td className="border p-1">{item.deliveryLocation}</td>
                </>
                )}
            </tr>
            ))}
        </tbody>
        </table>
    {status === 'POstage' && (
    <div className="mt-4 text-sm text-gray-700">
        <p><span className="font-semibold">PO Entered By:</span> {reqDetails.enteredBy}</p>
        <p><span className="font-semibold">Date of PO:</span> {reqDetails.updatedAt?.split('T')[0]}</p>
    </div>
    )}
    </div>
  );
};

export default SplNum;

