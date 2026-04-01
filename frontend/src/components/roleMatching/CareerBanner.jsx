// frontend/src/components/roleMatching/CareerBanner.jsx

export default function CareerBanner({
  trajectory,
  careerSummary,
  candidateSkillCount,
  totalRolesAnalyzed,
}) {
  return (
    <div className="rm-career-banner">
      <div className="rm-banner-left">
        <span className="rm-trajectory-label">Detected Trajectory</span>
        <h2 className="rm-trajectory">{trajectory}</h2>
        <p className="rm-skills-detected">
          <strong>{candidateSkillCount}</strong> skills detected ·{' '}
          <strong>{totalRolesAnalyzed}</strong> roles analyzed
        </p>
      </div>

      {careerSummary && (
        <div className="rm-banner-right">
          <span className="rm-ai-summary-label">✨ AI Career Summary</span>
          <p className="rm-career-summary-text">{careerSummary}</p>
        </div>
      )}
    </div>
  );
}
