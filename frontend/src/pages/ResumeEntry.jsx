import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resumeService from '../services/resumeService';
import './ResumeEntry.css';

function ResumeEntry() {
  const navigate = useNavigate();
  const [uploadStage, setUploadStage] = useState('idle'); // idle, reviewing, greeting, feedback
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateNew = async () => {
    try {
      const response = await resumeService.createResume({
        title: 'Untitled Resume',
        templateId: 'modern',
        content: {
          personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', summary: '' },
          education: [],
          experience: [],
          skills: { technical: [], soft: [], languages: [] },
          projects: []
        }
      });

      navigate(`/resume-builder?id=${response.data.id}`);
    } catch (error) {
      console.error('Failed to create resume:', error);
      alert('Failed to create resume. Please try again.');
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setUploadedFile(file);
    setError(null);
    await processUpload(file);
  };

  const processUpload = async (file) => {
  try {
    setUploadStage('reviewing');
    const startTime = Date.now();

    // Use the service which already handles auth
    const result = await resumeService.uploadResume(file);

    const elapsed = Date.now() - startTime;
    if (elapsed < 1200) {
      await new Promise(resolve => setTimeout(resolve, 1200 - elapsed));
    }

    setParseResult(result.data);
    setUploadStage('greeting');
  } catch (error) {
    console.error('Upload error:', error);
    
    // Better error handling
    if (error.response?.status === 401) {
      setError('Your session has expired. Please login again.');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(error.response?.data?.message || 'Failed to process your resume. Please try again.');
    }
    
    setUploadStage('idle');
  }
};

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleContinueToFeedback = () => {
    setUploadStage('feedback');
  };

  const handleContinueToBuilder = () => {
    navigate(`/resume-builder?id=${parseResult.resumeId}`);
  };

  const handleRetry = () => {
    setError(null);
    setUploadStage('idle');
    setUploadedFile(null);
    setParseResult(null);
  };

  // Render stages
  if (uploadStage === 'reviewing') {
    return (
      <div className="resume-entry-container">
        <div className="reviewing-screen">
          <div className="reviewing-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2196f3" strokeWidth="2" opacity="0.2"/>
              <path d="M12 2 A 10 10 0 0 1 22 12" stroke="#2196f3" strokeWidth="2" strokeLinecap="round">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
              <path d="M8 12 L11 15 L16 9" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Reviewing your resume</h2>
          <p>Please wait while we analyze your document...</p>
        </div>
      </div>
    );
  }

  if (uploadStage === 'greeting') {
    return (
      <div className="resume-entry-container">
        <div className="greeting-screen">
          <div className="greeting-illustration">
            <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
              {/* Simple illustration placeholder */}
              <circle cx="120" cy="100" r="60" fill="#FFE4B5"/>
              <circle cx="105" cy="90" r="8" fill="#333"/>
              <circle cx="135" cy="90" r="8" fill="#333"/>
              <path d="M 100 110 Q 120 120 140 110" stroke="#333" strokeWidth="3" fill="none"/>
              <rect x="60" y="140" width="120" height="80" rx="10" fill="#4FC3F7"/>
            </svg>
          </div>
          <h1>Nice to meet you, {parseResult?.firstName || 'there'}!</h1>
          <div className="greeting-content">
            {parseResult?.degree && parseResult?.institution && (
              <p>
                As a recent graduate with a <strong>{parseResult.degree}</strong> from <strong>{parseResult.institution}</strong>
                {parseResult.gpa && `, you have demonstrated strong academic performance with a GPA of ${parseResult.gpa}`}.
              </p>
            )}
            {parseResult?.topSkills && parseResult.topSkills.length > 0 && (
              <p>
                Your technical skills in <strong>{parseResult.topSkills.slice(0, 3).join(', ')}</strong> highlight your capabilities.
              </p>
            )}
            <p>
              We will tailor your resume-building experience to emphasize your strengths and showcase your potential to future employers.
            </p>
          </div>
          <button onClick={handleContinueToFeedback} className="btn-continue">
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (uploadStage === 'feedback') {
    return (
      <div className="resume-entry-container">
        <div className="feedback-screen">
          <div className="feedback-illustration">
            <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
              <circle cx="120" cy="100" r="60" fill="#FFE4B5"/>
              <circle cx="105" cy="90" r="8" fill="#333"/>
              <circle cx="135" cy="90" r="8" fill="#333"/>
              <path d="M 100 110 Q 120 120 140 110" stroke="#333" strokeWidth="3" fill="none"/>
              <rect x="60" y="140" width="120" height="80" rx="10" fill="#4FC3F7"/>
              <rect x="150" y="60" width="60" height="80" rx="8" fill="white" stroke="#333" strokeWidth="2"/>
              <line x1="160" y1="75" x2="200" y2="75" stroke="#333" strokeWidth="2"/>
              <line x1="160" y1="90" x2="200" y2="90" stroke="#333" strokeWidth="2"/>
              <line x1="160" y1="105" x2="180" y2="105" stroke="#333" strokeWidth="2"/>
            </svg>
          </div>

          <h1>You're off to a great start!</h1>
          <p className="feedback-subtitle">Here's what you got right and some areas we'll help you improve.</p>

          <div className="feedback-grid">
            <div className="feedback-section positive">
              <div className="feedback-header">
                <span className="feedback-icon">🏆</span>
                <h3>You got it right</h3>
              </div>
              <ul className="feedback-list">
                {parseResult?.detectedSections.map((section, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    You included these key sections: {section}
                  </li>
                ))}
                {parseResult?.stats.skillsCount >= 6 && (
                  <li>
                    <span className="check-icon">✓</span>
                    You listed {parseResult.stats.skillsCount} skills. Great job! Employers like to see at least 6.
                  </li>
                )}
              </ul>
            </div>

            <div className="feedback-section improvement">
              <div className="feedback-header">
                <span className="feedback-icon">💡</span>
                <h3>How we'll help you improve</h3>
              </div>
              <ul className="feedback-list">
                {parseResult?.missingSections.map((section, idx) => (
                  <li key={idx}>
                    <span className="star-icon">⭐</span>
                    Add these key sections: {section}
                  </li>
                ))}
                {parseResult?.stats.skillsCount < 6 && (
                  <li>
                    <span className="star-icon">⭐</span>
                    Add more skills to strengthen your profile
                  </li>
                )}
                {!parseResult?.stats.hasSummary && (
                  <li>
                    <span className="star-icon">⭐</span>
                    AI-enhance your summary to align with best practices
                  </li>
                )}
              </ul>
            </div>
          </div>

          <button onClick={handleContinueToBuilder} className="btn-continue">
            Continue to Editor
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="resume-entry-container">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Could not process your resume</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="btn-retry">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main entry screen (idle)
  return (
    <div className="resume-entry-container">
      <header className="entry-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back-link">
          ← Back to templates
        </button>
      </header>

      <div className="entry-content">
        <h1 className="entry-title">How would you like to build your resume?</h1>

        <div className="entry-options">
          {/* Option 1: Create New */}
          <div className="entry-option">
            <div className="option-icon create-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="#4caf50" strokeWidth="2" fill="none"/>
                <line x1="12" y1="8" x2="12" y2="16" stroke="#4caf50" strokeWidth="2"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="#4caf50" strokeWidth="2"/>
              </svg>
            </div>
            <h2>Start with a new resume</h2>
            <p>Get step-by-step support with expert content suggestions at your fingertips!</p>
            <button onClick={handleCreateNew} className="btn-create">
              Create new
            </button>
          </div>

          {/* Option 2: Upload Existing */}
          <div className="entry-option">
            <div className="option-icon upload-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="#2196f3" strokeWidth="2" fill="none"/>
                <path d="M12 14 L12 8 M12 8 L9 11 M12 8 L15 11" stroke="#2196f3" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>Upload an existing resume</h2>
            <p>Edit your resume using expertly generated content in a fresh, new design.</p>
            
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="resume-upload" className="btn-upload">
                📤 Choose file
              </label>
              <p className="upload-hint">or drag and drop here</p>
            </div>

            <p className="file-types-hint">
              Acceptable file types: DOC, DOCX, PDF, HTML, RTF, TXT
            </p>
          </div>
        </div>
      </div>

      <footer className="entry-footer">
        <p>© 2026, Career Compass. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ResumeEntry;