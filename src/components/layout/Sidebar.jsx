import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../AuthContext';
import API_URL from '../../config';
import { iconMap } from './iconMap';
import routeGroups from '../../pages/RouteSetup/routeGroups';
import { CircularProgress } from '@mui/material';

const Sidebar = ({ isOpen, onClose, role, closeSidebar }) => {
  const [dropdowns, setDropdowns] = useState({});
  const [routes, setRoutes] = useState({
    main: [],
    grouped: [],
    secondary: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize dropdown state based on route groups
  useEffect(() => {
    const initialDropdowns = routeGroups.reduce((acc, group) => {
      acc[group.key] = false;
      return acc;
    }, {});
    setDropdowns(initialDropdowns);
  }, []);

  // Default secondary items that should always be available
  const defaultSecondaryItems = useMemo(() => {
    const items = [
      { path: '/help', name: 'Help Center', icon: 'help-circle', category: 'secondary' },
      { path: '/logout', name: 'Logout', icon: 'log-out', category: 'secondary' },
    ];
    
    // Add settings for admin users
    if (user?.role === 'Admin' || user?.role === 'Operation Head') {
      items.splice(1, 0, { path: '/settings', name: 'Settings', icon: 'settings', category: 'secondary' });
    }
    
    return items;
  }, [user?.role]);

  // Fetch and filter routes based on permissions
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both role and user routes in parallel
        const [roleRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/route-access/role-routes/${user.role}`),
          fetch(`${API_URL}/api/route-access/user-access/${user.username}/routes`)
        ]);

        if (!roleRes.ok || !userRes.ok) {
          throw new Error('Failed to fetch route permissions');
        }

        const [roleData, userData] = await Promise.all([
          roleRes.json(),
          userRes.json()
        ]);

        const roleRoutes = roleData.routes || [];
        const userRoutes = userData.routes || [];

        // Filter and organize routes based on permissions
        const { mainRoutes, groupedRoutes, secondaryRoutes } = filterAndOrganizeRoutes(
          roleRoutes, 
          userRoutes,
          user.role
        );

        setRoutes({
          main: mainRoutes,
          grouped: groupedRoutes,
          secondary: secondaryRoutes
        });
      } catch (err) {
        console.error('Failed to fetch routes:', err);
        setError('Failed to load navigation. Some items may be unavailable.');
        
        // Fallback to just showing default secondary items
        setRoutes({
          main: [],
          grouped: [],
          secondary: defaultSecondaryItems
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user, defaultSecondaryItems]);

  // Filter and organize routes based on permissions
  const filterAndOrganizeRoutes = (roleRoutes, userRoutes, userRole) => {
    // Create maps for quick lookup
    const roleRouteMap = new Set(roleRoutes.map(r => r.path));
    const userRouteMap = new Map(userRoutes.map(r => [r.path, r.action]));
    
    // Check if a route should be included
    const shouldIncludeRoute = (item) => {
      // First check user-specific permissions
      if (userRouteMap.has(item.path)) {
        return userRouteMap.get(item.path) === 'allow';
      }
      
      // Then check role permissions
      if (roleRouteMap.has(item.path)) {
        // Also verify role restrictions if specified
        return !item.roles || item.roles.includes(userRole);
      }
      
      return false;
    };
    
    // Process all route items
    const allItems = routeGroups.flatMap(group => group.items);
    const allowedItems = allItems.filter(shouldIncludeRoute);
    
    // Group routes by category
    const mainRoutes = allowedItems.filter(item => item.category === 'main');
    const secondaryItems = allowedItems.filter(item => item.category === 'secondary');
    
    // Merge with default secondary items
    const secondaryRoutes = [
      ...defaultSecondaryItems,
      ...secondaryItems.filter(
        item => !defaultSecondaryItems.some(def => def.path === item.path))
    ];
    
    // Group remaining routes by their original groups
    const groupedRoutes = routeGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => 
          allowedItems.some(allowed => allowed.path === item.path) &&
          item.category !== 'main' &&
          item.category !== 'secondary'
        )
      }))
      .filter(group => group.items.length > 0);
    
    return { mainRoutes, groupedRoutes, secondaryRoutes };
  };

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => {
    return path === '/' 
      ? location.pathname === path 
      : location.pathname.startsWith(path);
  };

  // Handle mobile responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = () => {
    if (isMobile && isOpen) {
      closeSidebar?.();
      onClose?.();
    }
  };

  const handleLogout = () => {
    logout();
    sessionStorage.clear();
    navigate('/login');
    handleLinkClick();
  };

  if (loading) {
    return (
      <aside className={`fixed z-30 top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'}
        flex flex-col flex-shrink-0`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <CircularProgress  size={24} />
            <span className="mt-2 text-sm">Loading navigation...</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`fixed z-30 top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'}
      flex flex-col flex-shrink-0`}>

      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <div className={`flex items-center ${isOpen ? 'px-4' : 'px-0 justify-center w-full'}`}>
          <div className="h-9 w-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xl px-2">
            MG
          </div>
          {isOpen && <span className="ml-2 text-lg font-semibold dark:text-white">Builders</span>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Main routes */}
          <nav className="space-y-1 mb-4">
            {routes.main.map((item, index) => {
              if (!iconMap[item.icon]) {
                console.warn(`Missing icon in iconMap for: ${item.icon}`);
              }
              const IconComponent = iconMap[item.icon] || HelpCircle;
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center px-2 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/20'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  } ${!isOpen && 'justify-center'}`}
                >
                  <IconComponent className={`h-5 w-5 ${
                    isActive(item.path) 
                      ? 'text-indigo-500' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Grouped routes */}
          {routes.grouped.map((group) => (
            <div key={group.key} className="mb-4">
              <button
                onClick={() => toggleDropdown(group.key)}
                className={`flex items-center w-full px-2 py-3 text-sm font-medium rounded-md transition-all duration-200
                  text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800
                  ${isOpen ? 'justify-start' : 'justify-center'}`}
              >
                <span className="flex items-center">
                  {dropdowns[group.key] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  {isOpen && <span className="ml-3">{group.label}</span>}
                </span>
              </button>
              
              <AnimatePresence>
                {dropdowns[group.key] && (
                  <motion.nav
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map((item, index) => {
                      const IconComponent = iconMap[item.icon] || HelpCircle;
                      return (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={handleLinkClick}
                          className={`flex items-center px-2 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                            isActive(item.path)
                              ? 'text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          } ${!isOpen && 'justify-center'}`}
                        >
                          <IconComponent className={`h-5 w-5 ${
                            isActive(item.path)
                              ? 'text-indigo-500'
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          {isOpen && <span className="ml-3">{item.name}</span>}
                        </Link>
                      );
                    })}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Secondary navigation */}
        <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <nav className="space-y-1">
            {routes.secondary.map((item, index) => {
              const IconComponent = iconMap[item.icon] || HelpCircle;
              
              if (item.path === '/logout') {
                return (
                  <button
                    key={index}
                    onClick={handleLogout}
                    className={`flex items-center w-full px-2 py-3 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    } transition-all duration-200 ${!isOpen && 'justify-center'}`}
                  >
                    <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </button>
                );
              }
              
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center px-2 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  } ${!isOpen && 'justify-center'}`}
                >
                  <IconComponent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;