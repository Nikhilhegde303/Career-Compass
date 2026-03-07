import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import resumeService from '../services/resumeService';
import pdfService from '../services/pdfService';
import ResumeSteps from '../components/resume/ResumeSteps';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import TemplateSelector from '../components/resume/TemplateSelector';
import './ResumeBuilder.css';

const STEPS = [
  { id: 'personal', label: 'Personal Info', required: true },
  { id: 'education', label: 'Education', required: false },
  { id: 'experience', label: 'Experience', required: false },
  { id: 'skills', label: 'Skills', required: false },
  { id: 'projects', label: 'Projects', required: false }
];

const EMPTY_RESUME = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: {
    technical: [],
    soft: [],
    languages: []
  },
  projects: []
};

function ResumeBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const previewRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(EMPTY_RESUME);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [templateId, setTemplateId] = useState('modern');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({});

  // Load existing resume if ID provided
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setLoading(false);
        return;
      }

      try {
        const response = await resumeService.getResume(resumeId);
        setResumeData(response.data.content);
        setResumeTitle(response.data.title);
        setTemplateId(response.data.templateId);
        setLastSaved(new Date(response.data.updatedAt));
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to load resume:', error);
        alert('Failed to load resume. Redirecting to dashboard...');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId, navigate]);

  // Calculate completion status
  useEffect(() => {
    const status = {};
    
    // Personal info
    const personal = resumeData.personal;
    status.personal = !!(personal.fullName && personal.email);
    
    // Education
    status.education = resumeData.education.length > 0 && 
      resumeData.education.every(edu => edu.institution && edu.degree);
    
    // Experience
    status.experience = resumeData.experience.length > 0 && 
      resumeData.experience.every(exp => exp.company && exp.position);
    
    // Skills
    status.skills = resumeData.skills.technical.length > 0 || 
      resumeData.skills.soft.length > 0;
    
    // Projects
    status.projects = resumeData.projects.length > 0 && 
      resumeData.projects.every(proj => proj.name);
    
    setCompletionStatus(status);
  }, [resumeData]);

  // Track unsaved changes
  useEffect(() => {
    if (!loading) {
      setHasUnsavedChanges(true);
      setSaveError(null);
    }
  }, [resumeData, resumeTitle, templateId]);

  // Autosave with debouncing
  useEffect(() => {
    if (loading || !hasUnsavedChanges) return;

    const timer = setTimeout(async () => {
      await autosave();
    }, 3000); // 3 second debounce

    return () => clearTimeout(timer);
  }, [resumeData, resumeTitle, templateId, hasUnsavedChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const autosave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      if (resumeId) {
        await resumeService.updateResume(resumeId, {
          title: resumeTitle,
          templateId,
          content: resumeData
        });
      } else {
        const response = await resumeService.createResume({
          title: resumeTitle,
          templateId,
          content: resumeData
        });
        navigate(`/resume-builder?id=${response.data.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Autosave failed:', error);
      setSaveError('Autosave failed. Your changes may not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      if (resumeId) {
        await resumeService.updateResume(resumeId, {
          title: resumeTitle,
          templateId,
          content: resumeData
        });
      } else {
        const response = await resumeService.createResume({
          title: resumeTitle,
          templateId,
          content: resumeData
        });
        navigate(`/resume-builder?id=${response.data.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Success feedback
      const originalText = 'Save';
      setSaving('Saved!');
      setTimeout(() => setSaving(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveError('Failed to save resume. Please try again.');
    } finally {
      setTimeout(() => setSaving(false), 2000);
    }
  };

  const updateResumeData = useCallback((section, data) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate('/dashboard');
  };

  const handleExport = async () => {
  if (!resumeId) {
    alert('Please save your resume before exporting.');
    return;
  }

  if (hasUnsavedChanges) {
    const confirmExport = window.confirm(
      'You have unsaved changes. Save before exporting?'
    );
    if (confirmExport) {
      await handleSave();
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      return;
    }
  }

  try {
    setExporting(true);
    
    // Get the actual resume template element (not the wrapper)
    const previewElement = previewRef.current?.querySelector('.resume-template');
    if (!previewElement) {
      throw new Error('Preview element not found');
    }

    const filename = `${resumeTitle.replace(/\s+/g, '_')}.pdf`;
    const result = await pdfService.generatePDF(previewElement, filename);
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Show success message
    alert(`PDF generated successfully! (${result.pages} page${result.pages > 1 ? 's' : ''})`);
  } catch (error) {
    console.error('Export failed:', error);
    alert(`Failed to export PDF: ${error.message}`);
  } finally {
    setExporting(false);
  }
};

  const handleDuplicate = async () => {
    if (!resumeId) {
      alert('Please save your resume before duplicating.');
      return;
    }

    try {
      setSaving(true);
      const response = await resumeService.duplicateResume(resumeId);
      navigate(`/resume-builder?id=${response.data.id}`);
      window.location.reload(); // Reload to fetch duplicated resume
    } catch (error) {
      console.error('Duplication failed:', error);
      alert('Failed to duplicate resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    const completed = Object.values(completionStatus).filter(Boolean).length;
    const total = Object.keys(completionStatus).length;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="resume-builder-loading">
        <div className="spinner"></div>
        <p>Loading resume...</p>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="resume-builder">
      <div className="resume-builder-header">
        <div className="header-left">
          <button onClick={handleBack} className="btn-back">
            ← Back to Dashboard
          </button>
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="resume-title-input"
            placeholder="Resume Title"
          />
          <span className="resume-status">
            {resumeId ? '(Editing)' : '(New Resume)'}
          </span>
        </div>
        <div className="header-right">
          <div className="progress-indicator">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{progress}% Complete</span>
          </div>
          <div className="save-status">
            {saveError ? (
              <span className="save-error">{saveError}</span>
            ) : saving === 'Saved!' ? (
              <span className="save-success">✓ Saved!</span>
            ) : saving ? (
              <span className="saving">Saving...</span>
            ) : hasUnsavedChanges ? (
              <span className="unsaved">Unsaved changes</span>
            ) : lastSaved ? (
              <span className="saved">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <button 
            onClick={handleSave}
            className="btn-save"
            disabled={saving || !hasUnsavedChanges}
          >
            {saving === 'Saved!' ? 'Saved!' : saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={handleDuplicate}
            className="btn-duplicate"
            disabled={!resumeId || saving}
            title="Duplicate this resume"
          >
            Duplicate
          </button>
          <button 
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            className="btn-template"
          >
            Template: {templateId}
          </button>
          <button 
            onClick={handleExport} 
            className="btn-export"
            disabled={!resumeId || exporting || hasUnsavedChanges}
          >
            {exporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          currentTemplate={templateId}
          onSelectTemplate={(template) => {
            setTemplateId(template);
            setShowTemplateSelector(false);
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      <div className="resume-builder-content">
        <div className="builder-sidebar">
          <ResumeSteps
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completionStatus={completionStatus}
          />
        </div>

        <div className="builder-main">
          <div className="form-section">
            <ResumeForm
              currentStep={STEPS[currentStep].id}
              data={resumeData}
              onUpdateData={updateResumeData}
            />
            <div className="form-navigation">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="btn-nav"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === STEPS.length - 1}
                className="btn-nav btn-primary"
              >
                Next
              </button>
            </div>
          </div>

          <div className="preview-section">
            <ResumePreview
              ref={previewRef}
              data={resumeData}
              templateId={templateId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;