// frontend/src/components/roleMatching/LoadingScreen.jsx

import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '📄', text: 'Reading your resume...' },
  { icon: '🧠', text: 'Running TF-IDF vectorization...' },
  { icon: '📊', text: 'Computing role similarity scores...' },
  { icon: '💼', text: 'Fetching job listings...' },
  { icon: '✨', text: 'Generating AI career insights...' },
];

export default function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(s => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rm-loading-screen">
      <div className="rm-loading-card">
        <div className="rm-loading-compass">🧭</div>
        <h2 className="rm-loading-title">Analyzing Your Career Path</h2>
        <p className="rm-loading-subtitle">
          Our ML engine is matching your resume against {' '}
          <strong>10 role profiles</strong> using TF-IDF similarity
        </p>
        <div className="rm-loading-steps">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`rm-loading-step ${
                i < activeStep ? 'done' : i === activeStep ? 'active' : ''
              }`}
            >
              <span className="rm-step-icon">{step.icon}</span>
              <span className="rm-step-text">{step.text}</span>
              {i < activeStep && <span className="rm-step-check">✓</span>}
              {i === activeStep && <span className="rm-step-spinner" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
