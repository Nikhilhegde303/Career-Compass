import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test connection to backend
    fetch('http://localhost:5000')
      .then(response => response.json())
      .then(data => {
        setBackendStatus('✅ Connected: ' + data.message);
        setLoading(false);
      })
      .catch(error => {
        setBackendStatus('❌ Error: ' + error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Career Compass</h1>
        <p>AI-Powered Resume Intelligence Platform</p>
      </header>

      <main className="main">
        <div className="status-card">
          <h2>System Status</h2>
          <div className="status-item">
            <span>Frontend (React):</span>
            <span className="status-success">✅ Running</span>
          </div>
          <div className="status-item">
            <span>Backend (Node.js):</span>
            <span className={loading ? 'status-loading' : backendStatus.includes('✅') ? 'status-success' : 'status-error'}>
              {loading ? '🔄 Loading...' : backendStatus}
            </span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps to Build:</h3>
          <ol>
            <li>✅ Project Setup & GitHub</li>
            <li>✅ Backend Server Running</li>
            <li>✅ Frontend Connected</li>
            <li>📝 User Authentication</li>
            <li>📄 Resume Builder</li>
            <li>🔍 ATS Analyzer</li>
            <li>🎯 Job Matcher</li>
            <li>🚀 Deployment</li>
          </ol>
        </div>
      </main>

      <footer className="footer">
        <p>Building Career Compass - One step at a time 🚀</p>
      </footer>
    </div>
  );
}

export default App;