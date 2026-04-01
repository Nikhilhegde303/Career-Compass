// frontend/src/components/roleMatching/JobCard.jsx

export default function JobCard({ job }) {
  return (
    <div className="rm-job-card">
      <div className="rm-job-header">
        <div className="rm-job-logo">{job.logo}</div>
        <div className="rm-job-info">
          <h4 className="rm-job-title">{job.title}</h4>
          <span className="rm-job-company">{job.company}</span>
        </div>
        <div className="rm-job-type-wrap">
          <span
            className={`rm-job-type ${
              job.type === 'Internship' ? 'type-intern' : 'type-fulltime'
            }`}
          >
            {job.type}
          </span>
          <span className="rm-job-mode">{job.mode}</span>
        </div>
      </div>

      <p className="rm-job-desc">{job.description}</p>

      <div className="rm-job-meta">
        <span className="rm-job-meta-item">📍 {job.location}</span>
        <span className="rm-job-meta-item">💰 {job.salary}</span>
        <span className="rm-job-meta-item">🕐 {job.posted}</span>
      </div>

      <div className="rm-job-skills">
        {(job.skills || []).slice(0, 4).map(s => (
          <span key={s} className="rm-job-skill-tag">
            {s}
          </span>
        ))}
      </div>

      <a
        href={job.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="rm-apply-btn"
      >
        Apply Now →
      </a>
    </div>
  );
}
