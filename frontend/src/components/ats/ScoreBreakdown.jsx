// frontend/src/components/ats/ScoreBreakdown.jsx

import { useState, useEffect } from 'react';
import './ScoreBreakdown.css';

const SCORE_DIMENSIONS = [
  {
    key: 'structure_score',
    label: 'Structure',
    icon: '🏗',
    desc: 'Section completeness & organization',
  },
  {
    key: 'skills_score',
    label: 'Skills',
    icon: '⚡',
    desc: 'Technical depth & categorization',
  },
  {
    key: 'impact_score',
    label: 'Impact',
    icon: '🎯',
    desc: 'Achievement quality & action verbs',
  },
  {
    key: 'keyword_score',
    label: 'Keywords',
    icon: '🔑',
    desc: 'Industry keyword coverage',
  },
  {
    key: 'readability_score',
    label: 'Readability',
    icon: '📖',
    desc: 'Balance, length & bullet usage',
  },
];

function AnimatedBar({ score, delay }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 400 + delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const getColor = (s) => {
    if (s >= 75) return '#4caf50';
    if (s >= 50) return '#ff9800';
    return '#f44336';
  };

  const color = getColor(score);

  return (
    <div className="score-bar">
      <div className="score-bar__track">
        <div
          className="score-bar__fill"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 6px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

function ScoreBreakdown({ analysis }) {
  return (
    <div className="score-breakdown">
      <h3 className="score-breakdown__title">Score Breakdown</h3>

      <div className="score-breakdown__list">
        {SCORE_DIMENSIONS.map(({ key, label, icon, desc }, index) => {
          const score = analysis[key] ?? 0;
          const getColor = (s) => {
            if (s >= 75) return '#4caf50';
            if (s >= 50) return '#ff9800';
            return '#f44336';
          };
          const color = getColor(score);

          return (
            <div key={key} className="score-breakdown__item">
              <div className="score-breakdown__item-header">
                <div className="score-breakdown__item-left">
                  <span className="score-breakdown__icon">{icon}</span>
                  <div>
                    <div className="score-breakdown__label">{label}</div>
                    <div className="score-breakdown__desc">{desc}</div>
                  </div>
                </div>
                <span
                  className="score-breakdown__score"
                  style={{ color }}
                >
                  {score}
                  <span className="score-breakdown__max">/100</span>
                </span>
              </div>
              <AnimatedBar score={score} delay={index * 80} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScoreBreakdown;
