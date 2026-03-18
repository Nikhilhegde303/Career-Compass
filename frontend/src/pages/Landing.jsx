import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { authUtils } from '../utils/auth';
import FeatureCard from '../components/FeatureCard';
import './Landing.css';

const FEATURES = [
  {
    icon: '📝',
    title: 'Resume Builder',
    description: 'Create and manage professional resumes with multiple templates and live preview',
    route: '/resume',  // CHANGED from /resume-builder
    ctaText: 'Build Resume',
    status: 'active'
  },
  {
    icon: '🎯',
    title: 'ATS Analyzer',
    description: 'Check how Applicant Tracking Systems parse and score your resume',
    route: '/ats-analyzer',
    ctaText: 'Analyze ATS',
    status: 'active'
  },
  {
    icon: '✨',
    title: 'Resume Optimizer',
    description: 'Tailor your resume for specific jobs with AI-powered suggestions',
    route: '/resume-optimizer',
    ctaText: 'Optimize Resume',
    status: 'coming-soon'
  },
  {
    icon: '🔍',
    title: 'Role & Job Matching',
    description: 'Discover roles and job openings that match your skills and experience',
    route: '/job-matching',
    ctaText: 'Discover Roles',
    status: 'coming-soon'
  },
  {
    icon: '💡',
    title: 'Suggestions & Insights',
    description: 'Get actionable recommendations to improve your career profile',
    route: '/insights',
    ctaText: 'View Suggestions',
    status: 'coming-soon'
  }
];

const HOW_IT_HELPS = [
  'Build ATS-friendly resumes with professional templates',
  'Optimize content for specific job descriptions',
  'Track your application success rate and improve over time',
  'Discover hidden opportunities that match your skillset'
];

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.data?.user);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        if (error.status === 401) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    authUtils.removeToken();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="landing-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <h1 className="app-name">Career Compass</h1>
          <div className="header-actions">
            <span className="user-greeting">
              {user?.name || 'User'}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h2 className="hero-title">Welcome back, {user?.name || 'there'}!</h2>
        <p className="hero-subtitle">
          Navigate your career journey with confidence. Build resumes, optimize applications, 
          and discover opportunities tailored to your goals.
        </p>
      </section>

      {/* Feature Cards Grid */}
      <section className="features-section">
        <h3 className="section-title">Your Career Tools</h3>
        <div className="features-grid">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="info-section">
        <h3 className="section-title">How Career Compass Helps You</h3>
        <div className="info-content">
          <ul className="info-list">
            {HOW_IT_HELPS.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 Career Compass. Your career, your compass.</p>
      </footer>
    </div>
  );
};

export default Landing;