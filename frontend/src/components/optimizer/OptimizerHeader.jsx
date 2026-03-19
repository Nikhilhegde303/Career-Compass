// frontend/src/components/optimizer/OptimizerHeader.jsx

import './OptimizerHeader.css';

function ScorePill({ score, label }) {
  const getColor = (s) => {
    if (s >= 75) return { color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9' };
    if (s >= 50) return { color: '#e65100', bg: '#fff3e0', border: '#ffe0b2' };
    return              { color: '#c62828', bg: '#ffebee', border: '#ffcdd2' };
  };
  const c = getColor(score ?? 0);
  return (
    <div className="score-pill" style={{ color: c.color, background: c.bg, borderColor: c.border }}>
      <span className="score-pill__number">{score ?? '–'}</span>
      <span className="score-pill__label">{label}</span>
    </div>
  );
}

function OptimizerHeader({ resume, analysis, mode }) {
  const isJobMatch = analysis?.analysis_type === 'job_match';

  return (
    <div className="opt-header">
      <div className="opt-header__left">
        <div className="opt-header__icon">✏️</div>
        <div>
          <h1 className="opt-header__title">Resume Optimizer</h1>
          <p className="opt-header__resume-name">
            {resume?.title || 'Untitled Resume'}
          </p>
        </div>
      </div>

      <div className="opt-header__scores">
        {analysis ? (
          <>
            <ScorePill
              score={analysis.overall_score}
              label="ATS Score"
            />
            {isJobMatch && analysis.match_score != null && (
              <ScorePill
                score={analysis.match_score}
                label="Job Match"
              />
            )}
          </>
        ) : (
          <span className="opt-header__no-analysis">
            No analysis found — results may be limited
          </span>
        )}

        {isJobMatch && (
          <span className="opt-header__mode-badge opt-header__mode-badge--match">
            🎯 Job Match Mode
          </span>
        )}
        {!isJobMatch && analysis && (
          <span className="opt-header__mode-badge opt-header__mode-badge--health">
            🩺 Health Mode
          </span>
        )}
      </div>
    </div>
  );
}

export default OptimizerHeader;
