// frontend/src/components/ats/ScoreOverview.jsx

import { useState, useEffect } from 'react';
import './ScoreOverview.css';

// Animated score ring using SVG
function ScoreRing({ score, size = 140, strokeWidth = 12 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius    = (size - strokeWidth) / 2;
  const circ      = 2 * Math.PI * radius;
  const offset    = circ - (animatedScore / 100) * circ;

  useEffect(() => {
    let frame;
    let current = 0;
    const target = score;
    const step = () => {
      current = Math.min(current + 1.5, target);
      setAnimatedScore(Math.round(current));
      if (current < target) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(step); }, 200);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [score]);

  const getColor = (s) => {
    if (s >= 75) return '#4caf50';
    if (s >= 50) return '#ff9800';
    return '#f44336';
  };

  const color = getColor(score);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.04s linear' }}
        />
      </svg>
      <div className="score-ring__label" style={{ color }}>
        <span className="score-ring__number">{animatedScore}</span>
        <span className="score-ring__max">/100</span>
      </div>
    </div>
  );
}

function ScoreOverview({ analysis }) {
  const isJobMatch    = analysis.analysis_type === 'job_match';
  const primaryScore  = isJobMatch ? analysis.match_score  : analysis.overall_score;
  const healthScore   = analysis.overall_score;

  const getGrade = (s) => {
    if (s >= 85) return { label: 'Excellent', color: '#4caf50', bg: '#e8f5e9' };
    if (s >= 70) return { label: 'Good',      color: '#8bc34a', bg: '#f1f8e9' };
    if (s >= 50) return { label: 'Fair',       color: '#ff9800', bg: '#fff3e0' };
    return              { label: 'Needs Work', color: '#f44336', bg: '#ffebee' };
  };

  const grade = getGrade(primaryScore);

  return (
    <div className="score-overview">
      {/* Primary score */}
      <div className="score-overview__primary">
        <ScoreRing score={primaryScore ?? 0} size={160} strokeWidth={14} />
        <div className="score-overview__primary-info">
          <span
            className="score-overview__grade-badge"
            style={{ color: grade.color, background: grade.bg }}
          >
            {grade.label}
          </span>
          <h3 className="score-overview__label">
            {isJobMatch ? 'Job Match Score' : 'ATS Health Score'}
          </h3>
          <p className="score-overview__desc">
            {isJobMatch
              ? 'How well your resume matches this specific job description'
              : 'Overall ATS compatibility score across 5 dimensions'}
          </p>
          {analysis.job_title && (
            <div className="score-overview__job-info">
              <strong>{analysis.job_title}</strong>
              {analysis.company && <span> at {analysis.company}</span>}
            </div>
          )}
        </div>
      </div>

      {/* If job match, also show the health score */}
      {isJobMatch && (
        <div className="score-overview__secondary">
          <div className="score-overview__secondary-item">
            <ScoreRing score={healthScore ?? 0} size={80} strokeWidth={8} />
            <div>
              <div className="score-overview__secondary-label">Resume Health</div>
              <div className="score-overview__secondary-desc">
                Overall resume quality score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp + type badge */}
      <div className="score-overview__meta">
        <span className={`score-overview__type-badge ${isJobMatch ? 'score-overview__type-badge--match' : 'score-overview__type-badge--health'}`}>
          {isJobMatch ? '🎯 Job Match' : '🩺 Health Check'}
        </span>
        <span className="score-overview__timestamp">
          Analyzed {new Date(analysis.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default ScoreOverview;
