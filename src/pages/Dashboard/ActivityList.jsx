import React from 'react';
import { User, ShoppingCart, FileText, AlertCircle } from 'lucide-react';

const ActivityList = () => {
  const activities = [
    { 
      icon: User, 
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', 
      title: 'New user registered', 
      time: '5 min ago',
      description: 'John Smith created a new account'
    },
    { 
      icon: ShoppingCart, 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', 
      title: 'New order placed', 
      time: '2 hours ago',
      description: 'Order #38294 for $296.00'
    },
    { 
      icon: FileText, 
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400', 
      title: 'Report generated', 
      time: 'Yesterday',
      description: 'Monthly sales report was created'
    },
    { 
      icon: AlertCircle, 
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', 
      title: 'System alert', 
      time: '2 days ago',
      description: 'Server load reached 92%'
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="p-4">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <li key={index} className="py-3">
              <div className="flex items-start">
                <div className={`${activity.color} p-2 rounded-md mr-4`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-center">
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;