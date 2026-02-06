import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import ResumeBuilder from './pages/ResumeBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import { authUtils } from './utils/auth';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Landing />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
        </Route>

        {/* Coming Soon - Placeholder Routes */}
        <Route 
          path="/resume-optimizer" 
          element={
            <ProtectedRoute>
              <ComingSoonPage title="Resume Optimizer" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ats-analyzer" 
          element={
            <ProtectedRoute>
              <ComingSoonPage title="ATS Analyzer" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/job-matching" 
          element={
            <ProtectedRoute>
              <ComingSoonPage title="Role & Job Matching" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/insights" 
          element={
            <ProtectedRoute>
              <ComingSoonPage title="Suggestions & Insights" />
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to dashboard if authenticated, else to login */}
        <Route 
          path="/" 
          element={
            authUtils.isAuthenticated() 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />

        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Simple Coming Soon Component (inline)
const ComingSoonPage = ({ title }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1a1a1a',
          marginBottom: '1rem'
        }}>
          {title}
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We're building this feature for you! Check back soon for updates.
        </p>
        <a 
          href="/dashboard" 
          style={{
            display: 'inline-block',
            background: '#2196f3',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1976d2'}
          onMouseOut={(e) => e.target.style.background = '#2196f3'}
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default App;