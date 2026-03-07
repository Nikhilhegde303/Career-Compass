import { useState } from 'react';
import './ResumeForm.css';

function ResumeForm({ currentStep, data, onUpdateData }) {
  const renderPersonalInfo = () => {
    const personal = data.personal || {};
    
    return (
      <div className="form-content">
        <h2>Personal Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={personal.fullName || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={personal.email || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={personal.phone || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={personal.location || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, location: e.target.value })}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              value={personal.linkedin || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, linkedin: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
          <div className="form-group">
            <label>Portfolio/Website</label>
            <input
              type="url"
              value={personal.portfolio || ''}
              onChange={(e) => onUpdateData('personal', { ...personal, portfolio: e.target.value })}
              placeholder="johndoe.com"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Professional Summary</label>
          <textarea
            value={personal.summary || ''}
            onChange={(e) => onUpdateData('personal', { ...personal, summary: e.target.value })}
            placeholder="Brief overview of your professional background and goals..."
            rows="4"
          />
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const education = data.education || [];

    const addEducation = () => {
      const newEducation = {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        achievements: []
      };
      onUpdateData('education', [...education, newEducation]);
    };

    const updateEducation = (index, field, value) => {
      const updated = [...education];
      updated[index] = { ...updated[index], [field]: value };
      onUpdateData('education', updated);
    };

    const removeEducation = (index) => {
      const updated = education.filter((_, i) => i !== index);
      onUpdateData('education', updated);
    };

    const addAchievement = (eduIndex) => {
      const updated = [...education];
      updated[eduIndex].achievements = [...(updated[eduIndex].achievements || []), ''];
      onUpdateData('education', updated);
    };

    const updateAchievement = (eduIndex, achIndex, value) => {
      const updated = [...education];
      updated[eduIndex].achievements[achIndex] = value;
      onUpdateData('education', updated);
    };

    const removeAchievement = (eduIndex, achIndex) => {
      const updated = [...education];
      updated[eduIndex].achievements = updated[eduIndex].achievements.filter((_, i) => i !== achIndex);
      onUpdateData('education', updated);
    };

    return (
      <div className="form-content">
        <div className="section-header">
          <h2>Education</h2>
          <button onClick={addEducation} className="btn-add">+ Add Education</button>
        </div>
        {education.length === 0 ? (
          <p className="empty-state">No education entries yet. Click "Add Education" to get started.</p>
        ) : (
          education.map((edu, index) => (
            <div key={edu.id} className="entry-card">
              <div className="entry-header">
                <h3>Education {index + 1}</h3>
                <button onClick={() => removeEducation(index)} className="btn-remove">Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Institution *</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                </div>
                <div className="form-group">
                  <label>Degree *</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div className="form-group">
                  <label>Field of Study</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                    placeholder="Boston, MA"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>GPA (optional)</label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    placeholder="3.8/4.0"
                  />
                </div>
              </div>
              <div className="achievements-section">
                <div className="achievements-header">
                  <label>Achievements/Honors</label>
                  <button onClick={() => addAchievement(index)} className="btn-add-small">+ Add</button>
                </div>
                {edu.achievements?.map((achievement, achIndex) => (
                  <div key={achIndex} className="achievement-item">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                      placeholder="Dean's List, Scholarship, etc."
                    />
                    <button onClick={() => removeAchievement(index, achIndex)} className="btn-remove-small">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderExperience = () => {
    const experience = data.experience || [];

    const addExperience = () => {
      const newExp = {
        id: Date.now().toString(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        achievements: []
      };
      onUpdateData('experience', [...experience, newExp]);
    };

    const updateExperience = (index, field, value) => {
      const updated = [...experience];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'current' && value) {
        updated[index].endDate = '';
      }
      onUpdateData('experience', updated);
    };

    const removeExperience = (index) => {
      const updated = experience.filter((_, i) => i !== index);
      onUpdateData('experience', updated);
    };

    const addAchievement = (expIndex) => {
      const updated = [...experience];
      updated[expIndex].achievements = [...(updated[expIndex].achievements || []), ''];
      onUpdateData('experience', updated);
    };

    const updateAchievement = (expIndex, achIndex, value) => {
      const updated = [...experience];
      updated[expIndex].achievements[achIndex] = value;
      onUpdateData('experience', updated);
    };

    const removeAchievement = (expIndex, achIndex) => {
      const updated = [...experience];
      updated[expIndex].achievements = updated[expIndex].achievements.filter((_, i) => i !== achIndex);
      onUpdateData('experience', updated);
    };

    return (
      <div className="form-content">
        <div className="section-header">
          <h2>Work Experience</h2>
          <button onClick={addExperience} className="btn-add">+ Add Experience</button>
        </div>
        {experience.length === 0 ? (
          <p className="empty-state">No experience entries yet. Click "Add Experience" to get started.</p>
        ) : (
          experience.map((exp, index) => (
            <div key={exp.id} className="entry-card">
              <div className="entry-header">
                <h3>Experience {index + 1}</h3>
                <button onClick={() => removeExperience(index)} className="btn-remove">Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    disabled={exp.current}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                    />
                    Currently working here
                  </label>
                </div>
              </div>
              <div className="achievements-section">
                <div className="achievements-header">
                  <label>Key Achievements & Responsibilities</label>
                  <button onClick={() => addAchievement(index)} className="btn-add-small">+ Add</button>
                </div>
                {exp.achievements?.map((achievement, achIndex) => (
                  <div key={achIndex} className="achievement-item">
                    <textarea
                      value={achievement}
                      onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                      placeholder="Describe your achievement or responsibility..."
                      rows="2"
                    />
                    <button onClick={() => removeAchievement(index, achIndex)} className="btn-remove-small">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderSkills = () => {
  const skills = data.skills || { technical: [], soft: [], languages: [] };

  const updateSkillCategory = (category, value) => {
    // Split by newlines first, then by commas, then filter empty
    const skillsArray = value
      .split(/[\n,]+/) // Split by newline OR comma
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    onUpdateData('skills', { ...skills, [category]: skillsArray });
  };

  const getSkillsDisplayValue = (skillsArray) => {
    // Display each skill on a new line
    return skillsArray?.join('\n') || '';
  };

  return (
    <div className="form-content">
      <h2>Skills</h2>
      <p className="skills-helper-text">
        💡 <strong>Tip:</strong> Press <kbd>Enter</kbd> after each skill, or separate with commas
      </p>
      
      <div className="form-group">
        <label>Technical Skills</label>
        <textarea
          value={getSkillsDisplayValue(skills.technical)}
          onChange={(e) => updateSkillCategory('technical', e.target.value)}
          placeholder="JavaScript&#10;React&#10;Node.js&#10;Python&#10;SQL"
          rows="5"
          className="skills-textarea"
        />
        <small>Press Enter after each skill or use commas to separate</small>
      </div>

      <div className="form-group">
        <label>Soft Skills</label>
        <textarea
          value={getSkillsDisplayValue(skills.soft)}
          onChange={(e) => updateSkillCategory('soft', e.target.value)}
          placeholder="Leadership&#10;Communication&#10;Problem Solving&#10;Team Collaboration"
          rows="4"
          className="skills-textarea"
        />
        <small>Press Enter after each skill or use commas to separate</small>
      </div>

      <div className="form-group">
        <label>Languages</label>
        <textarea
          value={getSkillsDisplayValue(skills.languages)}
          onChange={(e) => updateSkillCategory('languages', e.target.value)}
          placeholder="English (Native)&#10;Spanish (Fluent)&#10;French (Intermediate)"
          rows="3"
          className="skills-textarea"
        />
        <small>Press Enter after each language or use commas to separate</small>
      </div>
    </div>
  );
};

  const renderProjects = () => {
    const projects = data.projects || [];

    const addProject = () => {
      const newProject = {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: [],
        link: '',
        startDate: '',
        endDate: ''
      };
      onUpdateData('projects', [...projects, newProject]);
    };

    const updateProject = (index, field, value) => {
      const updated = [...projects];
      if (field === 'technologies') {
        updated[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
      } else {
        updated[index][field] = value;
      }
      onUpdateData('projects', updated);
    };

    const removeProject = (index) => {
      const updated = projects.filter((_, i) => i !== index);
      onUpdateData('projects', updated);
    };

    return (
      <div className="form-content">
        <div className="section-header">
          <h2>Projects</h2>
          <button onClick={addProject} className="btn-add">+ Add Project</button>
        </div>
        {projects.length === 0 ? (
          <p className="empty-state">No projects yet. Click "Add Project" to showcase your work.</p>
        ) : (
          projects.map((project, index) => (
            <div key={project.id} className="entry-card">
              <div className="entry-header">
                <h3>Project {index + 1}</h3>
                <button onClick={() => removeProject(index)} className="btn-remove">Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div className="form-group">
                  <label>Project Link</label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => updateProject(index, 'link', e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="month"
                    value={project.startDate}
                    onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="month"
                    value={project.endDate}
                    onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe what the project does and your role..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Technologies Used</label>
                <input
                  type="text"
                  value={project.technologies?.join(', ') || ''}
                  onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                  placeholder="React, Node.js, MongoDB (separate with commas)"
                />
                <small>Separate technologies with commas</small>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return renderPersonalInfo();
      case 'education':
        return renderEducation();
      case 'experience':
        return renderExperience();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      default:
        return null;
    }
  };

  return (
    <div className="resume-form">
      {renderCurrentStep()}
    </div>
  );
}

export default ResumeForm;