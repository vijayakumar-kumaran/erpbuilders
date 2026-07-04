import React from 'react';

const Content = ({ children }) => {
  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </main>
  );
};

export default Content;