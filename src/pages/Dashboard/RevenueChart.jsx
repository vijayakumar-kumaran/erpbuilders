import React from 'react';

const RevenueChart = () => {
  // This would normally use a charting library like Chart.js or Recharts
  // For this example, we'll create a simple visual representation
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [35, 45, 30, 60, 50, 75];
  const maxValue = Math.max(...data);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Overview</h3>
        <select className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <option>Last 6 months</option>
          <option>Last year</option>
          <option>All time</option>
        </select>
      </div>
      
      <div className="h-64 flex items-end justify-between">
        {months.map((month, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div 
              className="w-12 bg-indigo-500 dark:bg-indigo-600 rounded-t-md hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-300"
              style={{ height: `${(data[i] / maxValue) * 200}px` }}
            ></div>
            <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">{month}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">$34,567</span>
          <span className="ml-2 text-sm text-emerald-600 dark:text-emerald-400">+12.4%</span>
        </div>
        <button className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors duration-200">
          Download Report
        </button>
      </div>
    </div>
  );
};

export default RevenueChart;