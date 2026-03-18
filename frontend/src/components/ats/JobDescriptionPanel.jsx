// frontend/src/components/ats/JobDescriptionPanel.jsx

import './JobDescriptionPanel.css';

function JobDescriptionPanel({ formData, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="jd-panel">
      <div className="jd-panel__header">
        <h2 className="jd-panel__title">Enter Job Details</h2>
        <p className="jd-panel__subtitle">
          Paste the job description to compare your resume against this specific role
        </p>
      </div>

      <div className="jd-panel__form">
        {/* Optional fields row */}
        <div className="jd-panel__row">
          <div className="jd-panel__group">
            <label className="jd-panel__label">
              Job Title <span className="jd-panel__optional">(optional)</span>
            </label>
            <input
              type="text"
              className="jd-panel__input"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.jobTitle || ''}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
            />
          </div>
          <div className="jd-panel__group">
            <label className="jd-panel__label">
              Company <span className="jd-panel__optional">(optional)</span>
            </label>
            <input
              type="text"
              className="jd-panel__input"
              placeholder="e.g. Google, Infosys, Startup"
              value={formData.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>
        </div>

        {/* Job Description textarea */}
        <div className="jd-panel__group">
          <label className="jd-panel__label">
            Job Description <span className="jd-panel__required">*</span>
          </label>
          <p className="jd-panel__hint">
            💡 Paste the complete job description including responsibilities,
            required skills, and qualifications for the most accurate analysis.
          </p>
          <textarea
            className={`jd-panel__textarea ${errors?.jobDescription ? 'jd-panel__textarea--error' : ''}`}
            placeholder="Paste the full job description here...

Example:
We are looking for a Software Engineer with experience in React, Node.js, and PostgreSQL.
Responsibilities include building scalable web applications, collaborating with cross-functional teams...
Requirements: 2+ years of experience, strong knowledge of JavaScript, REST APIs..."
            value={formData.jobDescription || ''}
            onChange={(e) => handleChange('jobDescription', e.target.value)}
            rows={12}
          />
          {errors?.jobDescription && (
            <span className="jd-panel__error-msg">{errors.jobDescription}</span>
          )}
          <div className="jd-panel__char-count">
            {(formData.jobDescription || '').length} characters
            {(formData.jobDescription || '').length < 100 && (
              <span className="jd-panel__char-warn"> · Minimum 100 characters recommended</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDescriptionPanel;
