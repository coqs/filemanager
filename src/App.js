import { useState, useEffect } from 'react';
import FileItem from './components/FileItemMeow.jsx';

const API_URL = "http://localhost:3125";

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]); // State for our notification log

  // Function to add a new log entry
  const addLog = (message, type) => {
    const newLog = { message, type, id: Date.now() };
    // Add new log to the beginning of the array, and keep the list short
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 4)]);
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${API_URL}/requestBeginning`);
        if (!response.ok) {
          throw new Error(`failed to connect to server: ${response.statusText}`);
        }
        const data = await response.json();
        setFiles(data.array || []);
        addLog("file list loaded from server.", "success");
      } catch (err) {
        console.error("fetch error:", err);
        setError("could not fetch files. is the backend server running?");
        addLog("failed to connect to server.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-400">loading files...</p>;
    }
    if (error) {
      return <p className="text-red-400 font-bold">{error}</p>;
    }
    if (files.length === 0) {
      return <p className="text-gray-500">no files found in the database directory.</p>;
    }
    return (
      <div className="flex flex-col w-full gap-3">
        {files.map((filename) => (
          <FileItem
            key={filename}
            filename={filename}
            addLog={addLog} // Pass the addLog function as a prop
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 font-mono text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">database</h1>
          <p className="text-lg text-gray-400 mt-2">
            database files
          </p>
        </header>

        {/* System Log Section */}
        <section className="mb-8 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg">
          <h2 className="text-xl text-gray-300 border-b border-gray-600 pb-2 mb-3">// system Log</h2>
          <div className="flex flex-col gap-1">
            {logs.length === 0 && <p className="text-gray-500">[system ready... waiting for action.]</p>}
            {logs.map(log => {
              const logColor = log.type === 'success' ? 'text-green-400' : 'text-red-400';
              return (
                <p key={log.id} className={logColor}>
                  <span className="font-bold">{log.type === 'success' ? '[OK]  ' : '[ERR] '}</span>
                  {log.message}
                </p>
              );
            })}
          </div>
        </section>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;