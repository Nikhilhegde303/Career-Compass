// frontend/src/components/roleMatching/ResumeSelector.jsx

import { useNavigate } from 'react-router-dom';

export default function ResumeSelector({
  resumes,
  selectedResume,
  onSelect,
  onAnalyze,
  loading,
  hasResult,
}) {
  const navigate = useNavigate();

  return (
    <div className="rm-selector-card">
      <label className="rm-selector-label">Select a Resume to Analyze</label>

      {resumes.length === 0 ? (
        <div className="rm-empty-resumes">
          <p>You haven't built or uploaded a resume yet.</p>
          <button
            className="rm-btn rm-btn-primary"
            onClick={() => navigate('/resume-builder')}
          >
            Build a Resume
          </button>
        </div>
      ) : (
        <div className="rm-selector-row">
          <select
            className="rm-selector"
            value={selectedResume}
            onChange={e => onSelect(e.target.value)}
          >
            <option value="">— Choose a resume —</option>
            {resumes.map(r => (
              <option key={r.id} value={r.id}>
                {r.title} · Updated{' '}
                {new Date(r.updated_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>

          <button
            className="rm-analyze-btn"
            onClick={onAnalyze}
            disabled={!selectedResume || loading}
          >
            {hasResult ? '🔄 Re-analyze' : '🚀 Analyze Career Path'}
          </button>
        </div>
      )}
    </div>
  );
}
