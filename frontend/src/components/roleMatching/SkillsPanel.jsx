// frontend/src/components/roleMatching/SkillsPanel.jsx

export default function SkillsPanel({ matchedSkills, missingSkills }) {
  return (
    <div className="rm-skills-grid">
      <div className="rm-skills-col">
        <h4 className="rm-skills-heading rm-matched-heading">
          ✅ Matched Skills ({matchedSkills.length})
        </h4>
        <div className="rm-skill-tags">
          {matchedSkills.length > 0 ? (
            matchedSkills.map(s => (
              <span key={s} className="rm-skill-tag rm-skill-matched">
                {s}
              </span>
            ))
          ) : (
            <span className="rm-no-skills">None detected yet</span>
          )}
        </div>
      </div>

      <div className="rm-skills-col">
        <h4 className="rm-skills-heading rm-missing-heading">
          ❌ Missing Skills ({missingSkills.length})
        </h4>
        <div className="rm-skill-tags">
          {missingSkills.length > 0 ? (
            missingSkills.map(s => (
              <span key={s} className="rm-skill-tag rm-skill-missing">
                {s}
              </span>
            ))
          ) : (
            <span className="rm-skill-tag rm-skill-matched">
              You're all set! 🎉
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
