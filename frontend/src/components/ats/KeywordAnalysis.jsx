// frontend/src/components/ats/KeywordAnalysis.jsx

import './KeywordAnalysis.css';

function KeywordAnalysis({ analysis }) {
  const matchScore      = analysis.match_score      ?? 0;
  const matchedKeywords = analysis.matched_keywords ?? [];
  const missingKeywords = analysis.missing_keywords ?? [];

  const getMatchColor = (s) => {
    if (s >= 70) return { color: '#4caf50', bg: '#e8f5e9' };
    if (s >= 45) return { color: '#ff9800', bg: '#fff3e0' };
    return              { color: '#f44336', bg: '#ffebee' };
  };

  const matchStyle = getMatchColor(matchScore);

  return (
    <div className="keyword-analysis">
      {/* Match score header */}
      <div className="keyword-analysis__match-bar">
        <div className="keyword-analysis__match-score" style={{ color: matchStyle.color }}>
          <span className="keyword-analysis__match-number">{matchScore}%</span>
          <span className="keyword-analysis__match-label">Keyword Match Rate</span>
        </div>
        <div className="keyword-analysis__match-track">
          <div
            className="keyword-analysis__match-fill"
            style={{
              width: `${matchScore}%`,
              background: matchStyle.color,
            }}
          />
        </div>
        <div className="keyword-analysis__match-stats">
          <span style={{ color: '#4caf50' }}>✓ {matchedKeywords.length} matched</span>
          <span style={{ color: '#f44336' }}>✗ {missingKeywords.length} missing</span>
        </div>
      </div>

      {/* Matched keywords */}
      <div className="keyword-analysis__section">
        <h4 className="keyword-analysis__section-title keyword-analysis__section-title--matched">
          ✅ Matched Keywords
          <span className="keyword-analysis__count keyword-analysis__count--matched">
            {matchedKeywords.length}
          </span>
        </h4>
        {matchedKeywords.length === 0 ? (
          <p className="keyword-analysis__empty">
            No keyword matches found. Try adding more relevant terms from the job description.
          </p>
        ) : (
          <div className="keyword-analysis__chips">
            {matchedKeywords.map((kw, i) => (
              <span key={i} className="keyword-chip keyword-chip--matched">{kw}</span>
            ))}
          </div>
        )}
      </div>

      {/* Missing keywords */}
      <div className="keyword-analysis__section">
        <h4 className="keyword-analysis__section-title keyword-analysis__section-title--missing">
          ❌ Missing Keywords
          <span className="keyword-analysis__count keyword-analysis__count--missing">
            {missingKeywords.length}
          </span>
        </h4>
        <p className="keyword-analysis__section-hint">
          Consider incorporating these terms naturally into your resume to improve your match score.
        </p>
        {missingKeywords.length === 0 ? (
          <p className="keyword-analysis__empty keyword-analysis__empty--success">
            You're covering all major keywords from this job description!
          </p>
        ) : (
          <div className="keyword-analysis__chips">
            {missingKeywords.map((kw, i) => (
              <span key={i} className="keyword-chip keyword-chip--missing">{kw}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KeywordAnalysis;
