// frontend/src/components/ats/ModeSelector.jsx

import './ModeSelector.css';

const HEALTH_CHECKS = [
  'Section completeness & structure',
  'Skills density & categorization',
  'Achievement impact & action verbs',
  'Industry keyword coverage',
  'Readability & balance',
];

const MATCH_CHECKS = [
  'Keyword overlap with job description',
  'Missing skills & technologies',
  'Role relevance score',
  'Tailoring recommendations',
  'All health checks included',
];

function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="mode-selector">
      <div className="mode-selector__header">
        <h2 className="mode-selector__title">What would you like to do?</h2>
        <p className="mode-selector__subtitle">
          Choose an analysis mode to get started
        </p>
      </div>

      <div className="mode-selector__cards">
        {/* Health Check Card */}
        <div
          className={`mode-card ${selectedMode === 'health' ? 'mode-card--selected' : ''}`}
          onClick={() => onSelectMode('health')}
        >
          <div className="mode-card__icon">🩺</div>
          <h3 className="mode-card__title">Resume Health Check</h3>
          <p className="mode-card__desc">
            Evaluate your resume quality independently. Get a full ATS compatibility
            score with detailed feedback across 5 key dimensions.
          </p>
          <ul className="mode-card__checks">
            {HEALTH_CHECKS.map((check, i) => (
              <li key={i} className="mode-card__check-item">
                <span className="mode-card__check-icon">✓</span>
                {check}
              </li>
            ))}
          </ul>
          <div className={`mode-card__cta ${selectedMode === 'health' ? 'mode-card__cta--active' : ''}`}>
            {selectedMode === 'health' ? '✓ Selected' : 'Select Health Check'}
          </div>
        </div>

        {/* Job Match Card */}
        <div
          className={`mode-card ${selectedMode === 'job_match' ? 'mode-card--selected' : ''}`}
          onClick={() => onSelectMode('job_match')}
        >
          <div className="mode-card__icon">🎯</div>
          <h3 className="mode-card__title">Job Match Analysis</h3>
          <p className="mode-card__desc">
            Compare your resume against a specific job description. Find keyword
            gaps and get targeted recommendations to improve your match score.
          </p>
          <ul className="mode-card__checks">
            {MATCH_CHECKS.map((check, i) => (
              <li key={i} className="mode-card__check-item">
                <span className="mode-card__check-icon">✓</span>
                {check}
              </li>
            ))}
          </ul>
          <div className={`mode-card__cta ${selectedMode === 'job_match' ? 'mode-card__cta--active' : ''}`}>
            {selectedMode === 'job_match' ? '✓ Selected' : 'Select Job Match'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModeSelector;
