import React, { useState, useEffect } from 'react';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import StockTRFNum from './viewScreens/StockTRF';

// Lazy load JSX pages
const PoNum = React.lazy(() => import('./viewScreens/Ponumber'));
const GrnNum = React.lazy(() => import('./viewScreens/GrnNumber'));
const RequestNum = React.lazy(() => import('./viewScreens/RequestNumber'));
const SplNum = React.lazy(() => import('./viewScreens/SplNumber'));
const MrnNum = React.lazy(() => import('./viewScreens/MrnNumber'));

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const componentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TrackingPage = () => {
  const [type, setType] = useState('');
  const [numberOptions, setNumberOptions] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState('');

  // Map route keys to display labels
  const typeOptions = [
    { value: 'request', label: 'Request Number' },
    { value: 'spl', label: 'SPL Number' },
    { value: 'po', label: 'PO Number' },
    { value: 'grn', label: 'GRN Number' },
    { value: 'mrn', label: 'MRN Number' },
    { value: 'stockTRF', label: 'StockTRF Number' },
  ];

  // Fetch data based on selected type
  useEffect(() => {
    if (!type) return;

    const fetchData = async () => {
      let url = '';
      switch (type) {
        case 'po':
          url = `${API_URL}/api/track/pono/all`;
          break;
        case 'grn':
          url = `${API_URL}/api/track/grnno/all`;
          break;
        case 'request':
          url = `${API_URL}/api/track/requestno/all`;
          break;
        case 'spl':
          url = `${API_URL}/api/track/splno/all`;
          break;
        case 'mrn':
          url = `${API_URL}/api/track/mrnno/all`;
          break;
        case 'stockTRF':
          url = `${API_URL}/api/track/stocktrfno/all`;
          break;
        default:
          return;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        setNumberOptions(data); // Assume API returns array of numbers
      } catch (error) {
        console.error('Failed to fetch numbers:', error);
        setNumberOptions([]);
      }
    };

    fetchData();
  }, [type]);

  // Render the appropriate JSX based on type
  const renderComponent = () => {
    switch (type) {
      case 'po':
        return <PoNum number={selectedNumber} />;
      case 'grn':
        return <GrnNum number={selectedNumber} />;
      case 'request':
        return <RequestNum number={selectedNumber} />;
      case 'spl':
        return <SplNum number={selectedNumber} />;
      case 'mrn':
        return <MrnNum number={selectedNumber} />;
      case 'stockTRF':
        return <StockTRFNum number={selectedNumber} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white select-none">
        Track / View Page
      </h2>

      {/* Dropdown 1: Type */}
      <label
        htmlFor="type-select"
        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Select Type:
      </label>
      <select
        id="type-select"
        className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                   transition duration-300 ease-in-out"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setSelectedNumber('');
          setNumberOptions([]);
        }}
      >
        <option value="" disabled>
          -- Select Type --
        </option>
        {typeOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Dropdown 2: Numbers based on type */}
      <AnimatePresence>
        {type && (
          <motion.div
            key="numberDropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-6"
          >
            <label
              htmlFor="number-select"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Select Number:
            </label>
            <select
              id="number-select"
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition duration-300 ease-in-out"
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(e.target.value)}
            >
              <option value="" disabled>
                -- Select Number --
              </option>
              {numberOptions.length > 0 ? (
                numberOptions.map((num, idx) => (
                  <option key={idx} value={num}>
                    {num}
                  </option>
                ))
              ) : (
                <option disabled>Loading or no options available</option>
              )}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Viewer */}
      <div className="mt-8 min-h-[250px]">
        <React.Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <AnimatePresence mode="wait">
            {selectedNumber && (
              <motion.div
                key={selectedNumber}
                variants={componentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 shadow-md"
              >
                {renderComponent()}
              </motion.div>
            )}
          </AnimatePresence>
        </React.Suspense>
      </div>
    </div>
  );
};

export default TrackingPage;
