// frontend/src/components/ats/StrengthsWeaknesses.jsx

import './StrengthsWeaknesses.css';

function StrengthsWeaknesses({ strengths = [], weaknesses = [] }) {
  return (
    <div className="sw-panel">
      {/* Strengths */}
      <div className="sw-panel__column sw-panel__column--strengths">
        <div className="sw-panel__col-header sw-panel__col-header--strengths">
          <span className="sw-panel__col-icon">✅</span>
          <h3 className="sw-panel__col-title">Strengths</h3>
          <span className="sw-panel__count">{strengths.length}</span>
        </div>
        <ul className="sw-panel__list">
          {strengths.length === 0 ? (
            <li className="sw-panel__empty">No strengths detected yet. Complete your resume sections to improve your score.</li>
          ) : (
            strengths.map((item, i) => (
              <li key={i} className="sw-panel__item sw-panel__item--strength">
                <span className="sw-panel__item-icon">✓</span>
                <span className="sw-panel__item-text">{item}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="sw-panel__column sw-panel__column--weaknesses">
        <div className="sw-panel__col-header sw-panel__col-header--weaknesses">
          <span className="sw-panel__col-icon">⚠️</span>
          <h3 className="sw-panel__col-title">Areas to Improve</h3>
          <span className="sw-panel__count">{weaknesses.length}</span>
        </div>
        <ul className="sw-panel__list">
          {weaknesses.length === 0 ? (
            <li className="sw-panel__empty sw-panel__empty--success">
              No critical weaknesses found. Great work!
            </li>
          ) : (
            weaknesses.map((item, i) => (
              <li key={i} className="sw-panel__item sw-panel__item--weakness">
                <span className="sw-panel__item-icon">✗</span>
                <span className="sw-panel__item-text">{item}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default StrengthsWeaknesses;
