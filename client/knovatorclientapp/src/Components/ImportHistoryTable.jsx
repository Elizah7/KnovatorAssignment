// client/src/components/ImportHistoryTable.js
import React from 'react';

const ImportHistoryTable = ({ importLogs, formatDateTime }) => {
  if (importLogs.length === 0) {
    return (
      <p className="text-center text-gray-600 text-lg py-10">
        No import history found. Run a cron job or trigger a manual import from the backend.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
              File Name (Source URL)
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Import Date/Time
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Fetched
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              New Jobs
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated Jobs
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              Failed Jobs
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {importLogs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 truncate max-w-xs">
                <a href={log.fileName} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {log.fileName}
                </a>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                {formatDateTime(log.importDateTime)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                {log.totalFetched}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">
                {log.newJobs}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600 font-semibold">
                {log.updatedJobs}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold">
                {log.failedJobs ? log.failedJobs.length : 0}
                {log.failedJobs && log.failedJobs.length > 0 && (
                  <span
                    className="ml-2 cursor-pointer text-blue-500 hover:underline"
                    title={log.failedJobs.map(f => `Reason: ${f.reason || 'N/A'}\nJob Data: ${JSON.stringify(f.jobData || {})}`).join('\n\n')}
                  >
                    (details)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportHistoryTable;
