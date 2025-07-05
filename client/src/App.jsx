// App.js
import React, { useState, useEffect } from 'react';
import Header from './Components/Header.jsx';
import LoadingSpinner from './Components/LoadingSpinner.jsx';
import ErrorMessage from './Components/ErrorMessage.jsx';
import ImportHistoryTable from './Components/ImportHistoryTable.jsx';

// Main App component
const App = () => {

  const [importLogs, setImportLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_API_URL = "https://knovatorassignment-2.onrender.com/api/imports";

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchImportLogs = async () => {
      try {
        setLoading(true); 
        setError(null);   

        const response = await fetch(BACKEND_API_URL);
        console.log("Response from API:", response); 
        if (!response.ok) {

          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // --- START OF MODIFICATION ---

        if (!Array.isArray(data.logs)) {
          console.warn("API response data is not an array:", data);
        
          setImportLogs([]);
          return; 
        }
        // --- END OF MODIFICATION ---

        // Sorting logs by importDateTime in descending order (most recent first)
        const sortedData = data.logs.sort((a, b) => new Date(b.importDateTime) - new Date(a.importDateTime));
        setImportLogs(sortedData); // Update the state with the fetched and sorted data
      } catch (err) {
        // Catching any errors during the fetch operation and set the error state
        console.error("Failed to fetch import logs:", err);
        setError(`Failed to load import history: ${err.message}. Please ensure the backend server is running and accessible at ${BACKEND_API_URL}.`);
      } finally {
        setLoading(false); 
      }
    };

    fetchImportLogs(); 
  }, []); 

  // Helper function to format date and time for display
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    // Options for date and time formatting
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return `${date.toLocaleDateString(undefined, dateOptions)} ${date.toLocaleTimeString(undefined, timeOptions)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <Header /> 

        {loading && <LoadingSpinner />} 

        {error && <ErrorMessage message={error} />} 

        {!loading && !error && (
          <ImportHistoryTable importLogs={importLogs} formatDateTime={formatDateTime} />
        )}
      </div>
    </div>
  );
};

export default App; 
