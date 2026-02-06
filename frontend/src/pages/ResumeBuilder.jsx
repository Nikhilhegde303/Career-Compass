import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import resumeService from '../services/resumeService';
import ResumeSteps from '../components/resume/ResumeSteps';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import TemplateSelector from '../components/resume/TemplateSelector';
import './ResumeBuilder.css';

const STEPS = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' }
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
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState(EMPTY_RESUME);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [templateId, setTemplateId] = useState('modern');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Load existing resume if ID provided
  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setLoading(false);
        return;
      }

      try {
        // Line ~60 - loadResume function
const response = await resumeService.getResume(resumeId);
setResumeData(response.data.content);
setResumeTitle(response.data.title);
setTemplateId(response.data.template_id);  // CHANGE: was templateId
setLastSaved(new Date(response.data.updated_at));  // CHANGE: was updatedAt
      } catch (error) {
        console.error('Failed to load resume:', error);
        alert('Failed to load resume');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId, navigate]);

  // Autosave logic with debouncing
  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(async () => {
      await saveResume();
    }, 3000); // 3 second debounce

    return () => clearTimeout(timer);
  }, [resumeData, resumeTitle, templateId]);

  const saveResume = async () => {
    try {
      setSaving(true);
      
      // Line ~80 - saveResume function
if (resumeId) {
  await resumeService.updateResume(resumeId, {
    title: resumeTitle,
    templateId,  // Frontend sends camelCase, backend converts
    content: resumeData
  });
} else {
        // Create new and redirect to edit mode
        const response = await resumeService.createResume({
          title: resumeTitle,
          templateId,
          content: resumeData
        });
        navigate(`/resume-builder?id=${response.data.id}`, { replace: true });
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save resume:', error);
    } finally {
      setSaving(false);
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

  const handleExport = () => {
    // Placeholder for export functionality
    alert('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="resume-builder-loading">
        <div className="spinner"></div>
        <p>Loading resume...</p>
      </div>
    );
  }

  return (
    <div className="resume-builder">
      <div className="resume-builder-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="resume-title-input"
            placeholder="Resume Title"
          />
        </div>
        <div className="header-right">
          <div className="save-status">
            {saving ? (
              <span className="saving">Saving...</span>
            ) : lastSaved ? (
              <span className="saved">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <button 
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            className="btn-template"
          >
            Template: {templateId}
          </button>
          <button onClick={handleExport} className="btn-export">
            Export PDF
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