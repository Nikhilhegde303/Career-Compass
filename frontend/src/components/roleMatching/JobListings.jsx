// frontend/src/components/roleMatching/JobListings.jsx

import { useState } from 'react';
import JobCard from './JobCard';

export default function JobListings({ jobs, roleName }) {
  const [expanded, setExpanded] = useState(false);

  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="rm-jobs-section">
      <button
        className="rm-expand-btn rm-btn-jobs"
        onClick={() => setExpanded(v => !v)}
      >
        <span>{expanded ? '▲' : '▼'}</span>
        <span>
          {expanded
            ? 'Hide Job Listings'
            : `💼 View ${jobs.length} Open Positions for ${roleName}`}
        </span>
      </button>

      {expanded && (
        <div className="rm-jobs-grid">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
