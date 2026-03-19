// frontend/src/components/optimizer/OptimizeModeSelector.jsx

import './OptimizeModeSelector.css';

function OptimizeModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="opt-mode-selector">
      <div className="opt-mode-selector__header">
        <h2 className="opt-mode-selector__title">How would you like to optimize?</h2>
        <p className="opt-mode-selector__subtitle">
          Choose a mode based on what you're preparing for
        </p>
      </div>

      <div className="opt-mode-selector__cards">

        {/* Quick Optimize */}
        <div
          className={`opt-mode-card ${selectedMode === 'health' ? 'opt-mode-card--selected' : ''}`}
          onClick={() => onSelectMode('health')}
        >
          <div className="opt-mode-card__icon">🩺</div>
          <h3 className="opt-mode-card__title">Quick Optimize</h3>
          <p className="opt-mode-card__desc">
            Improve your resume based on general ATS best practices.
            Great for strengthening your resume before applying to multiple roles.
          </p>
          <ul className="opt-mode-card__points">
            <li>Improve professional summary</li>
            <li>Strengthen bullet points</li>
            <li>Organize and expand skills</li>
            <li>Improve project descriptions</li>
          </ul>
          <div className={`opt-mode-card__cta ${selectedMode === 'health' ? 'opt-mode-card__cta--active' : ''}`}>
            {selectedMode === 'health' ? '✓ Selected' : 'Select Quick Optimize'}
          </div>
        </div>

        {/* Job-Targeted */}
        <div
          className={`opt-mode-card ${selectedMode === 'job_match' ? 'opt-mode-card--selected' : ''}`}
          onClick={() => onSelectMode('job_match')}
        >
          <div className="opt-mode-card__icon">🎯</div>
          <h3 className="opt-mode-card__title">Job-Targeted Optimize</h3>
          <p className="opt-mode-card__desc">
            Tailor your resume for a specific job description.
            AI will inject relevant keywords and align your content to the role.
          </p>
          <ul className="opt-mode-card__points">
            <li>Match keywords from job description</li>
            <li>Fill skill gaps for the role</li>
            <li>Align experience to requirements</li>
            <li>Role-specific summary rewrite</li>
          </ul>
          <div className={`opt-mode-card__cta ${selectedMode === 'job_match' ? 'opt-mode-card__cta--active' : ''}`}>
            {selectedMode === 'job_match' ? '✓ Selected' : 'Select Job-Targeted'}
          </div>
        </div>

      </div>
    </div>
  );
}

export default OptimizeModeSelector;
