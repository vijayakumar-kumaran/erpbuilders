import React from 'react';
import { TrendingUp, Users, CreditCard, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from './StatCard';
import ActivityList from './ActivityList';
import RevenueChart from './RevenueChart';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$45,231', 
      change: '+20.1%', 
      trend: 'up', 
      icon: CreditCard,
      desc: 'from last month'
    },
    { 
      title: 'Active Users', 
      value: '2,345', 
      change: '+15.2%', 
      trend: 'up', 
      icon: Users,
      desc: 'from last week'
    },
    { 
      title: 'Conversion Rate', 
      value: '3.6%', 
      change: '-2.3%', 
      trend: 'down', 
      icon: TrendingUp,
      desc: 'from yesterday'
    },
    { 
      title: 'Avg. Session', 
      value: '2m 56s', 
      change: '+10.5%', 
      trend: 'up', 
      icon: Clock,
      desc: 'from last week'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your workspace today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <ActivityList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;