import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description, route, status = 'active', ctaText }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (status === 'active') {
      navigate(route);
    }
  };

  return (
    <div 
      className={`feature-card ${status === 'coming-soon' ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      {status === 'coming-soon' && (
        <div className="coming-soon-badge">Coming Soon</div>
      )}
      
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      
      <button className={`feature-cta ${status === 'coming-soon' ? 'disabled' : ''}`}>
        {ctaText}
      </button>
    </div>
  );
};

export default FeatureCard;