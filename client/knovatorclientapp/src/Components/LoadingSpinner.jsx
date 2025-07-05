// client/src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p className="ml-4 text-gray-700 text-lg">Loading import history...</p>
    </div>
  );
};

export default LoadingSpinner;
