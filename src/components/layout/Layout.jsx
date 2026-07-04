import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';
import { useAuth } from '../../AuthContext'; // ✅ Import AuthContext

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  // Sidebar open by default only on large screens (lg breakpoint ~1024px)

  const [darkMode, setDarkMode] = useState(false);

  const { user } = useAuth(); // ✅ Get user from context
  const role = user?.role || 'Guest'; // Default to 'Guest' if user is not logged in

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Backdrop for mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} role={role} closeSidebar={() => setSidebarOpen(false)} />

      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
      >
        <Header
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <Content>{children}</Content>
      </div>
    </div>

  );

};

export default Layout;