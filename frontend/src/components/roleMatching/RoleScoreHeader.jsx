// frontend/src/components/roleMatching/RoleScoreHeader.jsx

function DemandBadge({ demand }) {
  const classMap = {
    'Very High': 'badge-green',
    'High':      'badge-blue',
    'Medium':    'badge-yellow',
    'Low':       'badge-gray',
  };
  return (
    <span className={`rm-badge ${classMap[demand] || 'badge-blue'}`}>
      {demand} Demand
    </span>
  );
}

function ScoreCircle({ score }) {
  const colorClass =
    score >= 70 ? 'score-great' :
    score >= 45 ? 'score-good' :
    'score-low';

  return (
    <div className={`rm-score-circle ${colorClass}`}>
      <span className="rm-score-number">{score}</span>
      <span className="rm-score-pct">%</span>
    </div>
  );
}

function ScoreBar({ score }) {
  const color =
    score >= 70 ? '#22c55e' :
    score >= 45 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="rm-score-bar-wrap">
      <div className="rm-score-bar-track">
        <div
          className="rm-score-bar-fill"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="rm-score-label" style={{ color }}>
        {score}% match
      </span>
    </div>
  );
}

export default function RoleScoreHeader({ match }) {
  return (
    <div className="rm-score-header">
      <div className="rm-role-card-header">
        <div className="rm-role-emoji">{match.emoji}</div>
        <div className="rm-role-title-block">
          <h3 className="rm-role-name">{match.role}</h3>
          <p className="rm-role-desc">{match.description}</p>
          <div className="rm-role-meta">
            <span className="rm-salary">💰 {match.avgSalary}</span>
            <DemandBadge demand={match.demand} />
          </div>
        </div>
        <ScoreCircle score={match.score} />
      </div>
      <ScoreBar score={match.score} />
    </div>
  );
}
