// frontend/src/components/roleMatching/SkillCloud.jsx

export default function SkillCloud({ skills }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="rm-skill-cloud-card">
      <h3 className="rm-skill-cloud-title">📋 Your Detected Skill Portfolio</h3>
      <div className="rm-skill-cloud">
        {skills.map(skill => (
          <span key={skill} className="rm-cloud-skill">
            {skill}
          </span>
        ))}
      </div>
      <p className="rm-skill-cloud-hint">
        These were extracted from your resume's skills, projects, and education
        sections. Add more to your resume to improve your match scores.
      </p>
    </div>
  );
}
