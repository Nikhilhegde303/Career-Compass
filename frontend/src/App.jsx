// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Landing        from './pages/Landing';
import ResumeEntry    from './pages/ResumeEntry';
import ResumeBuilder  from './pages/ResumeBuilder';
import ATSAnalyzer    from './pages/ATSAnalyzer';
import ResumeOptimizer from './pages/ResumeOptimizer';
import RoleMatching from './pages/RoleMatching';
import ProtectedRoute from './components/ProtectedRoute';
import { authUtils }  from './utils/auth';
import './App.css';

// ── Must be defined BEFORE App so it's available when JSX is parsed ──
const ComingSoonPage = ({ title }) => (
  <div className="coming-soon-page">
    <div className="coming-soon-card">
      <div className="coming-soon-icon">🚧</div>
      <h2 className="coming-soon-title">{title}</h2>
      <p className="coming-soon-desc">
        We're building this feature for you! Check back soon for updates.
      </p>
      <a href="/dashboard" className="coming-soon-btn">
        ← Back to Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* All protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"          element={<Landing />}         />
          <Route path="/resume"             element={<ResumeEntry />}     />
          <Route path="/resume-builder"     element={<ResumeBuilder />}   />
          <Route path="/ats-analyzer"       element={<ATSAnalyzer />}     />
          <Route path="/resume/:id/analyze" element={<ATSAnalyzer />}     />
          <Route path="/optimizer"          element={<ResumeOptimizer />} />
          <Route path="/role-matching" element={<RoleMatching />} />
          {/* <Route path="/job-matching"       element={<ComingSoonPage title="Role & Job Matching" />}     />
          <Route path="/insights"           element={<ComingSoonPage title="Suggestions & Insights" />} /> */}
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            authUtils.isAuthenticated()
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login"    replace />
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;