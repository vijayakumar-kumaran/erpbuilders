import React from 'react';
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import {useAuth} from '../../AuthContext';

const Header = ({ toggleSidebar, sidebarOpen, darkMode, toggleDarkMode }) => {
  const {user} = useAuth();
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 transition-all duration-200">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="hidden md:block ml-4">
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-1.5 rounded-md shadow-md">
          <h1 className="text-white text-xl font-bold tracking-wide">
            👋 Welcome back, {user?.name}! - ({user?.role})
          </h1>
        </div>
      </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-200"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 focus:outline-none relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium transition-colors duration-200">
          {user?.username.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
