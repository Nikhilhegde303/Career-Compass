// frontend/src/components/optimizer/SectionCard.jsx

import './SectionCard.css';

const SCORE_LABELS = {
  summary:    { icon: '📝', color: '#7b1fa2' },
  experience: { icon: '💼', color: '#1565c0' },
  skills:     { icon: '⚡', color: '#e65100' },
  projects:   { icon: '🚀', color: '#2e7d32' },
};

function SectionCard({ section, label, score, reason, isEmpty, children }) {
  const meta  = SCORE_LABELS[section] || { icon: '📄', color: '#555' };

  const getScoreStyle = (s) => {
    if (s >= 75) return { color: '#2e7d32', bg: '#e8f5e9' };
    if (s >= 50) return { color: '#e65100', bg: '#fff3e0' };
    return              { color: '#c62828', bg: '#ffebee' };
  };

  const scoreStyle = getScoreStyle(score);

  return (
    <div className="section-card">
      {/* Card header */}
      <div className="section-card__header">
        <div className="section-card__header-left">
          <span className="section-card__icon">{meta.icon}</span>
          <div>
            <h3 className="section-card__title">{label}</h3>
            <p className="section-card__reason">{reason}</p>
          </div>
        </div>

        <div className="section-card__score-wrap">
          {isEmpty ? (
            <span className="section-card__empty-badge">Missing</span>
          ) : (
            <div
              className="section-card__score"
              style={{ color: scoreStyle.color, background: scoreStyle.bg }}
            >
              <span className="section-card__score-num">{score}</span>
              <span className="section-card__score-max">/100</span>
            </div>
          )}
        </div>
      </div>

      {/* Card body — passed as children */}
      <div className="section-card__body">
        {children}
      </div>
    </div>
  );
}

export default SectionCard;
