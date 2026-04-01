// frontend/src/components/roleMatching/AIInsightPanel.jsx

import { useState } from 'react';

export default function AIInsightPanel({ explanation, autoExpand }) {
  const [expanded, setExpanded] = useState(autoExpand || false);

  if (!explanation) return null;

  return (
    <div className="rm-ai-wrapper">
      <button
        className="rm-expand-btn rm-btn-ai"
        onClick={() => setExpanded(v => !v)}
      >
        <span>{expanded ? '▲' : '▼'}</span>
        <span>{expanded ? 'Hide AI Insight' : '✨ View AI Career Insight'}</span>
      </button>

      {expanded && (
        <div className="rm-ai-block">
          {/* Raw fallback if parsing failed */}
          {explanation.raw && (
            <p className="rm-ai-raw">{explanation.raw}</p>
          )}

          {explanation.fit && (
            <div className="rm-ai-section">
              <span className="rm-ai-label rm-ai-fit">Why You Fit</span>
              <p>{explanation.fit}</p>
            </div>
          )}

          {explanation.gap && (
            <div className="rm-ai-section">
              <span className="rm-ai-label rm-ai-gap">Key Gap</span>
              <p>{explanation.gap}</p>
            </div>
          )}

          {explanation.roadmap && explanation.roadmap.length > 0 && (
            <div className="rm-ai-section">
              <span className="rm-ai-label rm-ai-road">Learning Roadmap</span>
              <ul className="rm-roadmap-list">
                {explanation.roadmap.map((step, i) => (
                  <li key={i} className="rm-roadmap-item">
                    {step.replace(/^•\s*/, '')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {explanation.motivation && (
            <div className="rm-ai-section rm-motivation">
              <p>💪 {explanation.motivation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
