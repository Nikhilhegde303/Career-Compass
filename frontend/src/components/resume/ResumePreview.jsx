import { forwardRef } from 'react';
import './ResumePreview.css';

const ResumePreview = forwardRef(({ data, templateId }, ref) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Helper to check if section has content
  const hasPersonalInfo = data.personal?.fullName || data.personal?.email;
  const hasExperience = data.experience?.length > 0;
  const hasEducation = data.education?.length > 0;
  const hasSkills = data.skills?.technical?.length > 0 || data.skills?.soft?.length > 0 || data.skills?.languages?.length > 0;
  const hasProjects = data.projects?.length > 0;

  const renderModernTemplate = () => (
    <div className="resume-template modern">
      {/* Header */}
      {hasPersonalInfo && (
      <div className="resume-header modern-header">
        <h1>{data.personal?.fullName || 'Your Name'}</h1>
        <div className="contact-info">
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.location && <span>{data.personal.location}</span>}
        </div>
        {(data.personal?.linkedin || data.personal?.portfolio) && (
          <div className="links">
            {data.personal?.linkedin && (
              <span className="link-text">{data.personal.linkedin}</span>
            )}
            {data.personal?.portfolio && (
              <span className="link-text">{data.personal.portfolio}</span>
            )}
          </div>
        )}
      </div>
    )}

      {/* Summary */}
      {data.personal?.summary && (
        <div className="resume-section">
          <h2>Professional Summary</h2>
          <p className="summary-text">{data.personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="resume-section">
          <h2>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="entry">
              <div className="entry-header">
                <div className="entry-left">
                  <h3>{exp.position}</h3>
                  <div className="company">{exp.company}</div>
                </div>
                <div className="entry-right">
                  <div className="date-text">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                  {exp.location && <div className="location-text">{exp.location}</div>}
                </div>
              </div>
              {exp.achievements?.length > 0 && (
                <ul className="achievements-list">
                  {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {hasEducation && (
        <div className="resume-section">
          <h2>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="entry">
              <div className="entry-header">
                <div className="entry-left">
                  <h3>{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                  <div className="company">{edu.institution}</div>
                </div>
                <div className="entry-right">
                  <div className="date-text">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                  {edu.location && <div className="location-text">{edu.location}</div>}
                </div>
              </div>
              {edu.gpa && <div className="gpa-text">GPA: {edu.gpa}</div>}
              {edu.achievements?.length > 0 && (
                <ul className="achievements-list">
                  {edu.achievements.filter(a => a.trim()).map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {hasProjects && (
        <div className="resume-section">
          <h2>Projects</h2>
          {data.projects.map((project) => (
            <div key={project.id} className="entry">
              <div className="entry-header">
                <div className="entry-left">
                  <h3>{project.name}</h3>
                  {project.link && (
                    <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                      {project.link}
                    </a>
                  )}
                </div>
                {(project.startDate || project.endDate) && (
                  <div className="entry-right">
                    <div className="date-text">
                      {formatDate(project.startDate)} {project.endDate && `- ${formatDate(project.endDate)}`}
                    </div>
                  </div>
                )}
              </div>
              {project.description && <p className="project-description">{project.description}</p>}
              {project.technologies?.length > 0 && (
                <div className="technologies">
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {hasSkills && (
        <div className="resume-section">
          <h2>Skills</h2>
          <div className="skills-grid">
            {data.skills.technical?.length > 0 && (
              <div className="skill-category">
                <strong>Technical:</strong> {data.skills.technical.join(', ')}
              </div>
            )}
            {data.skills.soft?.length > 0 && (
              <div className="skill-category">
                <strong>Soft Skills:</strong> {data.skills.soft.join(', ')}
              </div>
            )}
            {data.skills.languages?.length > 0 && (
              <div className="skill-category">
                <strong>Languages:</strong> {data.skills.languages.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasPersonalInfo && !hasExperience && !hasEducation && !hasSkills && !hasProjects && (
        <div className="empty-preview">
          <p>Start filling in your information to see your resume preview</p>
        </div>
      )}
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="resume-template classic">
      {/* Header */}
      {hasPersonalInfo && (
        <div className="resume-header classic-header">
          <h1>{data.personal?.fullName || 'Your Name'}</h1>
          <div className="contact-bar">
            {data.personal?.email && <span>✉ {data.personal.email}</span>}
            {data.personal?.phone && <span>☎ {data.personal.phone}</span>}
            {data.personal?.location && <span>📍 {data.personal.location}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.personal?.summary && (
        <div className="resume-section">
          <div className="section-title">SUMMARY</div>
          <p className="summary-text">{data.personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {hasExperience && (
        <div className="resume-section">
          <div className="section-title">PROFESSIONAL EXPERIENCE</div>
          {data.experience.map((exp) => (
            <div key={exp.id} className="classic-entry">
              <div className="classic-entry-header">
                <strong>{exp.position}</strong>
                <span className="date-range">
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <div className="classic-subheader">
                {exp.company}{exp.location && ` • ${exp.location}`}
              </div>
              {exp.achievements?.length > 0 && (
                <ul className="classic-list">
                  {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {hasEducation && (
        <div className="resume-section">
          <div className="section-title">EDUCATION</div>
          {data.education.map((edu) => (
            <div key={edu.id} className="classic-entry">
              <div className="classic-entry-header">
                <strong>{edu.degree}{edu.field && ` in ${edu.field}`}</strong>
                <span className="date-range">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </span>
              </div>
              <div className="classic-subheader">
                {edu.institution}{edu.location && ` • ${edu.location}`}
              </div>
              {edu.gpa && <div className="gpa-line">GPA: {edu.gpa}</div>}
              {edu.achievements?.length > 0 && (
                <ul className="classic-list">
                  {edu.achievements.filter(a => a.trim()).map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {hasProjects && (
        <div className="resume-section">
          <div className="section-title">PROJECTS</div>
          {data.projects.map((project) => (
            <div key={project.id} className="classic-entry">
              <div className="classic-entry-header">
                <strong>{project.name}</strong>
                {(project.startDate || project.endDate) && (
                  <span className="date-range">
                    {formatDate(project.startDate)} {project.endDate && `- ${formatDate(project.endDate)}`}
                  </span>
                )}
              </div>
              {project.description && <p className="project-desc">{project.description}</p>}
              {project.technologies?.length > 0 && (
                <div className="tech-tags">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {hasSkills && (
        <div className="resume-section">
          <div className="section-title">SKILLS</div>
          {data.skills.technical?.length > 0 && (
            <div className="classic-skills">
              <strong>Technical:</strong> {data.skills.technical.join(' • ')}
            </div>
          )}
          {data.skills.soft?.length > 0 && (
            <div className="classic-skills">
              <strong>Soft Skills:</strong> {data.skills.soft.join(' • ')}
            </div>
          )}
          {data.skills.languages?.length > 0 && (
            <div className="classic-skills">
              <strong>Languages:</strong> {data.skills.languages.join(' • ')}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasPersonalInfo && !hasExperience && !hasEducation && !hasSkills && !hasProjects && (
        <div className="empty-preview">
          <p>Start filling in your information to see your resume preview</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="resume-preview">
      <div className="preview-header">
        <h3>Preview</h3>
      </div>
      <div className="preview-content">
        <div ref={ref}>
          {templateId === 'classic' ? renderClassicTemplate() : renderModernTemplate()}
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;