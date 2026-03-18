// frontend/src/components/ats/SuggestionsList.jsx

import './SuggestionsList.css';

const PRIORITY_CONFIG = {
  high:   { label: 'HIGH',   className: 'suggestion-badge--high',   order: 0 },
  medium: { label: 'MEDIUM', className: 'suggestion-badge--medium', order: 1 },
  low:    { label: 'LOW',    className: 'suggestion-badge--low',    order: 2 },
};

const CATEGORY_ICONS = {
  structure:  '🏗',
  impact:     '🎯',
  skills:     '⚡',
  keywords:   '🔑',
  readability:'📖',
  job_match:  '🎯',
};

function SuggestionsList({ suggestions = [] }) {
  // Sort by priority: high → medium → low
  const sorted = [...suggestions].sort((a, b) => {
    const orderA = PRIORITY_CONFIG[a.priority]?.order ?? 3;
    const orderB = PRIORITY_CONFIG[b.priority]?.order ?? 3;
    return orderA - orderB;
  });

  const highCount   = sorted.filter((s) => s.priority === 'high').length;
  const mediumCount = sorted.filter((s) => s.priority === 'medium').length;

  return (
    <div className="suggestions">
      <div className="suggestions__header">
        <h3 className="suggestions__title">Actionable Improvements</h3>
        <div className="suggestions__summary">
          {highCount > 0 && (
            <span className="suggestions__summary-pill suggestions__summary-pill--high">
              {highCount} High Priority
            </span>
          )}
          {mediumCount > 0 && (
            <span className="suggestions__summary-pill suggestions__summary-pill--medium">
              {mediumCount} Medium
            </span>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="suggestions__empty">
          <span className="suggestions__empty-icon">🎉</span>
          <p>No suggestions — your resume looks great!</p>
        </div>
      ) : (
        <ol className="suggestions__list">
          {sorted.map((suggestion, i) => {
            const priorityConfig = PRIORITY_CONFIG[suggestion.priority] ?? PRIORITY_CONFIG.low;
            const categoryIcon   = CATEGORY_ICONS[suggestion.category] ?? '💡';

            return (
              <li key={i} className="suggestion-item">
                <div className="suggestion-item__number">{i + 1}</div>
                <div className="suggestion-item__body">
                  <div className="suggestion-item__meta">
                    <span className={`suggestion-badge ${priorityConfig.className}`}>
                      {priorityConfig.label}
                    </span>
                    {suggestion.category && (
                      <span className="suggestion-item__category">
                        {categoryIcon} {suggestion.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="suggestion-item__text">{suggestion.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default SuggestionsList;
