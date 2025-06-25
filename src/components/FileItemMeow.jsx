import React from 'react';

const API_URL = "http://localhost:3125";

const FileItem = ({ filename, addLog }) => {
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop().toUpperCase() : 'zip';

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/requestFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileNameRequested: filename }),
      });

      // If the response is OK (status 200-299), proceed to download
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename; // The filename for the downloaded file
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        addLog(`'${filename}' downloaded successfully.`, 'success');
      } 
      // Specifically check for the "Forbidden" status
      else if (response.status === 403) {
        addLog("naughty!!! don't do that again!", 'error');
      } 
      // Handle other potential errors
      else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      addLog(`Failed to download '${filename}'.`, 'error');
    }
  };

  return (
    <div className="flex items-center w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg transition-colors duration-200">
      {/* Thumbnail Box */}
      <div className="flex-shrink-0 w-20 h-12 flex items-center justify-center bg-gray-900 border border-gray-600 rounded-md">
        <span className="font-bold text-cyan-400 text-lg">{extension}</span>
      </div>

      {/* Filename */}
      <span className="ml-4 text-lg text-gray-200 truncate">{filename}</span>

      {/* Download Button - pushed to the right */}
      <button
        onClick={handleDownload}
        className="ml-auto flex-shrink-0 px-4 py-2 bg-cyan-700 text-white font-bold rounded-md hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        download
      </button>
    </div>
  );
};

export default FileItem;