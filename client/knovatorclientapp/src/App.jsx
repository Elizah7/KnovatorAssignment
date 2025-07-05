// App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ImportHistoryTable from './components/ImportHistoryTable';

// Main App component
const App = () => {
  // State variables for import logs, loading status, and error messages
  const [importLogs, setImportLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the backend API URL. Make sure this matches your Node.js server's address.
  // If your frontend is served from a different domain/port, ensure CORS is enabled on your backend.
  const BACKEND_API_URL =  'http://localhost:5000/api/imports';

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchImportLogs = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null);   // Clear any previous errors

        const response = await fetch(BACKEND_API_URL);
        console.log("Response from API:", response); // Debugging log to check the response
        // Check if the response was successful (status code 2xx)
        if (!response.ok) {
          // If not successful, throw an error with the status text
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // --- START OF MODIFICATION ---
        // Ensure data is an array before attempting to sort it
        if (!Array.isArray(data.logs)) {
          console.warn("API response data is not an array:", data);
          // If it's not an array, treat it as an empty array to prevent crash
          setImportLogs([]);
          return; // Exit the function early
        }
        // --- END OF MODIFICATION ---

        // Sort logs by importDateTime in descending order (most recent first)
        const sortedData = data.logs.sort((a, b) => new Date(b.importDateTime) - new Date(a.importDateTime));
        setImportLogs(sortedData); // Update the state with the fetched and sorted data
      } catch (err) {
        // Catch any errors during the fetch operation and set the error state
        console.error("Failed to fetch import logs:", err);
        setError(`Failed to load import history: ${err.message}. Please ensure the backend server is running and accessible at ${BACKEND_API_URL}.`);
      } finally {
        setLoading(false); // Set loading to false after fetch attempt (success or failure)
      }
    };

    fetchImportLogs(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs only once after the initial render

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
        <Header /> {/* Render the Header component */}

        {loading && <LoadingSpinner />} {/* Render LoadingSpinner if loading */}

        {error && <ErrorMessage message={error} />} {/* Render ErrorMessage if there's an error */}

        {!loading && !error && (
          <ImportHistoryTable importLogs={importLogs} formatDateTime={formatDateTime} />
        )}
      </div>
    </div>
  );
};

export default App; // Export the App component as default
