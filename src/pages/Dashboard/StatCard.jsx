import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ stat }) => {
  const { title, value, change, trend, icon: Icon, desc } = stat;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
          <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      
      <div className="mt-2 flex items-center">
        <span className={`text-sm font-medium flex items-center ${
          trend === 'up' 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {change}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          {desc}
        </span>
      </div>
    </div>
  );
};

export default StatCard;