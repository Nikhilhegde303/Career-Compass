// frontend/src/pages/ResumeOptimizer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Step flow:
//   PICK     → Select resume (saved or upload)
//   MODE     → Quick Optimize vs Job-Targeted
//   JD       → Paste job description (job_match only)
//   OPTIMIZE → AI section cards
//
// Smart entry:
//   URL has resumeId + analysisId  → skip to OPTIMIZE directly
//   URL has resumeId only          → skip to MODE
//   No params                      → start from PICK
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }        from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Step components
import ResumePickerPanel     from '../components/ats/ResumePickerPanel';
import JobDescriptionPanel   from '../components/ats/JobDescriptionPanel';
import OptimizeModeSelector  from '../components/optimizer/OptimizeModeSelector';

// Result components
import OptimizerHeader from '../components/optimizer/OptimizerHeader';
import SectionCard     from '../components/optimizer/SectionCard';
import BulletOptimizer from '../components/optimizer/BulletOptimizer';
import SkillsOptimizer from '../components/optimizer/SkillsOptimizer';

import optimizerService from '../services/optimizerService';
import './ResumeOptimizer.css';

// ── Step constants ────────────────────────────────────────────────────────────
const STEPS = {
  PICK:     'pick',
  MODE:     'mode',
  JD:       'jd',
  OPTIMIZE: 'optimize',
};

const STEP_LABELS = {
  [STEPS.PICK]:     'Select Resume',
  [STEPS.MODE]:     'Choose Mode',
  [STEPS.JD]:       'Job Details',
  [STEPS.OPTIMIZE]: 'Optimize',
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ResumeOptimizer() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  // URL params — present when coming from ATS Analyzer
  const urlResumeId   = searchParams.get('resumeId');
  const urlAnalysisId = searchParams.get('analysisId');
  const urlMode       = searchParams.get('mode');

  // ── Determine initial step based on URL params ────────────────────
  const getInitialStep = () => {
    if (urlResumeId && urlAnalysisId) return STEPS.OPTIMIZE; // from ATS
    if (urlResumeId)                  return STEPS.MODE;     // resume known, no analysis
    return STEPS.PICK;                                       // fresh entry
  };

  // ── State ─────────────────────────────────────────────────────────
  const [step, setStep]           = useState(getInitialStep);
  const [selectedResume, setSelectedResume] = useState(
    urlResumeId ? { id: urlResumeId } : null
  );
  const [analysisId, setAnalysisId] = useState(urlAnalysisId || null);
  const [mode, setMode]           = useState(urlMode || '');
  const [jdForm, setJdForm]       = useState({ jobDescription: '', jobTitle: '', company: '' });
  const [jdErrors, setJdErrors]   = useState({});

  // Optimize step state
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [pageData, setPageData]   = useState(null);
  const [acceptedCount, setAcceptedCount] = useState(0);

  // ── When step becomes OPTIMIZE, load eligible sections ────────────
  useEffect(() => {
    if (step !== STEPS.OPTIMIZE || !selectedResume?.id) return;
    loadSections();
  }, [step, selectedResume?.id]);

  const loadSections = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (analysisId)           params.set('analysisId',      analysisId);
      if (mode)                 params.set('mode',             mode);
      if (jdForm.jobDescription) params.set('jobDescription', jdForm.jobDescription);

      const data = await optimizerService.getEligibleSections(
        selectedResume.id,
        analysisId,
        mode,
        jdForm.jobDescription || undefined
      );
      setPageData(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load optimizer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step handlers ─────────────────────────────────────────────────
  const handleResumeSelected = (resume) => {
    setSelectedResume(resume);
    setStep(STEPS.MODE);
  };

  const handleModeNext = () => {
    if (!mode) return;
    if (mode === 'job_match') {
      setStep(STEPS.JD);
    } else {
      setStep(STEPS.OPTIMIZE);
    }
  };

  const handleJDNext = () => {
    const errors = {};
    if (!jdForm.jobDescription?.trim() || jdForm.jobDescription.trim().length < 50) {
      errors.jobDescription = 'Please paste a job description (at least 50 characters).';
    }
    if (Object.keys(errors).length > 0) {
      setJdErrors(errors);
      return;
    }
    setStep(STEPS.OPTIMIZE);
  };

  const handleBack = () => {
    setError('');
    if (step === STEPS.OPTIMIZE) {
      // If came from ATS, go back to ATS page
      if (urlResumeId && urlAnalysisId) { navigate(-1); return; }
      setPageData(null);
      setStep(mode === 'job_match' ? STEPS.JD : STEPS.MODE);
      return;
    }
    if (step === STEPS.JD)   { setStep(STEPS.MODE); return; }
    if (step === STEPS.MODE) {
      if (urlResumeId) { navigate(-1); return; }
      setStep(STEPS.PICK);
      return;
    }
    navigate(-1);
  };

  // ── Shared optimize handler ───────────────────────────────────────
  const handleOptimize = async (payload) => {
    return await optimizerService.optimizeSection({
      ...payload,
      resumeId:      selectedResume.id,
      analysisId:    analysisId || pageData?.analysis?.id,
      mode,
      jobDescription: jdForm.jobDescription || pageData?.analysis?.job_description || '',
      jobRole:        jdForm.jobTitle       || pageData?.analysis?.job_title        || '',
    });
  };

  // ── Accept handler ────────────────────────────────────────────────
  const handleAccepted = async (optimizationId) => {
    await optimizerService.acceptOptimization(optimizationId);
    setAcceptedCount((prev) => prev + 1);
  };

  // ── Render section body ───────────────────────────────────────────
  const renderSectionBody = (sectionData) => {
    const { section, current, bullets, projects } = sectionData;

    const commonProps = {
      resumeId:      selectedResume?.id,
      analysisId:    analysisId || pageData?.analysis?.id,
      mode,
      onOptimize:    handleOptimize,
      onAccepted:    handleAccepted,
    };

    switch (section) {
      case 'summary':
        return (
          <BulletOptimizer
            {...commonProps}
            section="summary"
            label="Professional Summary"
            currentText={current}
          />
        );

      case 'experience':
        if (!bullets?.length) {
          return (
            <p className="opt-page__empty-section">
              No achievement bullets found. Add them in the Resume Builder first.
            </p>
          );
        }
        return (
          <div className="opt-page__bullets">
            {bullets.map((bullet, idx) => (
              <div key={idx} className="opt-page__bullet-row">
                {(bullet.company || bullet.role) && (
                  <span className="opt-page__bullet-meta">
                    {bullet.company && <strong>{bullet.company}</strong>}
                    {bullet.role    && <span> · {bullet.role}</span>}
                  </span>
                )}
                <BulletOptimizer
                  {...commonProps}
                  section="experience"
                  label={`Bullet ${idx + 1}`}
                  currentText={bullet.text}
                  bulletIndex={idx}
                />
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <SkillsOptimizer
            {...commonProps}
            currentSkills={current}
          />
        );

      case 'projects':
        if (!projects?.length) {
          return (
            <p className="opt-page__empty-section">
              No project descriptions found.
            </p>
          );
        }
        return (
          <div className="opt-page__bullets">
            {projects.map((proj, idx) => (
              <div key={idx} className="opt-page__bullet-row">
                <span className="opt-page__bullet-meta">
                  <strong>{proj.name}</strong>
                  {proj.technologies?.length > 0 && (
                    <span> · {proj.technologies.join(', ')}</span>
                  )}
                </span>
                <BulletOptimizer
                  {...commonProps}
                  section="projects"
                  label={`Project: ${proj.name}`}
                  currentText={proj.description}
                  projectIndex={idx}
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // ── Breadcrumb steps visible based on mode ────────────────────────
  const visibleSteps = (() => {
    // Coming from ATS — no steps shown
    if (urlResumeId && urlAnalysisId) return [];
    if (mode === 'job_match') return [STEPS.PICK, STEPS.MODE, STEPS.JD,   STEPS.OPTIMIZE];
    if (mode === 'health')    return [STEPS.PICK, STEPS.MODE, STEPS.OPTIMIZE];
    // Mode not yet selected — show first 3
    return [STEPS.PICK, STEPS.MODE, STEPS.OPTIMIZE];
  })();

  const currentStepIndex = visibleSteps.indexOf(step);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="opt-page">

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="opt-page__topbar">
        <div className="opt-page__topbar-inner">
          <button className="opt-page__back-btn" onClick={handleBack}>
            ← Back
          </button>
          <span className="opt-page__topbar-title">Resume Optimizer</span>

          {/* Breadcrumb — only when navigating via steps */}
          {visibleSteps.length > 0 && (
            <div className="opt-page__stepper">
              {visibleSteps.map((s, i) => (
                <div key={s} className="opt-page__step-wrap">
                  {i > 0 && (
                    <div className={`opt-page__connector ${i <= currentStepIndex ? 'opt-page__connector--done' : ''}`} />
                  )}
                  <div className={`opt-page__step-dot ${i < currentStepIndex ? 'opt-page__step-dot--done' : ''} ${i === currentStepIndex ? 'opt-page__step-dot--active' : ''}`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className={`opt-page__step-label ${i === currentStepIndex ? 'opt-page__step-label--active' : ''}`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Open in builder button — only in optimize step */}
          {step === STEPS.OPTIMIZE && selectedResume?.id && (
            <button
              className="opt-page__builder-btn"
              onClick={() => navigate(`/resume-builder?id=${selectedResume.id}`)}
            >
              Open in Builder →
            </button>
          )}
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────── */}
      <main className="opt-page__content">

        {/* ── STEP: Pick Resume ─────────────────────────────────── */}
        {step === STEPS.PICK && (
          <ResumePickerPanel onResumeSelected={handleResumeSelected} />
        )}

        {/* ── STEP: Mode Selection ──────────────────────────────── */}
        {step === STEPS.MODE && (
          <div className="opt-page__step-content">
            <OptimizeModeSelector
              selectedMode={mode}
              onSelectMode={setMode}
            />
            <div className="opt-page__step-actions">
              <button
                className={`opt-page__next-btn ${!mode ? 'opt-page__next-btn--disabled' : ''}`}
                onClick={handleModeNext}
                disabled={!mode}
              >
                {mode === 'job_match' ? 'Next: Add Job Details →' : 'Start Optimizing →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Job Description ─────────────────────────────── */}
        {step === STEPS.JD && (
          <div className="opt-page__step-content">
            <JobDescriptionPanel
              formData={jdForm}
              onChange={setJdForm}
              errors={jdErrors}
            />
            <div className="opt-page__step-actions">
              <button className="opt-page__next-btn" onClick={handleJDNext}>
                Start Optimizing →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Optimize ────────────────────────────────────── */}
        {step === STEPS.OPTIMIZE && (
          <>
            {/* Loading */}
            {loading && (
              <div className="opt-page__loading">
                <div className="opt-page__spinner" />
                <p>Analyzing your resume...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="opt-page__error">
                <span>⚠ {error}</span>
                <button onClick={loadSections}>Retry</button>
              </div>
            )}

            {/* Sections loaded */}
            {!loading && !error && pageData && (
              <>
                {/* Header */}
                <OptimizerHeader
                  resume={pageData.resume}
                  analysis={pageData.analysis}
                  mode={mode}
                />

                {/* Missing keywords banner */}
                {mode === 'job_match' && pageData.analysis?.missing_keywords?.length > 0 && (
                  <div className="opt-page__keywords-banner">
                    <span className="opt-page__keywords-banner-title">
                      🔑 Missing Keywords from Job Description
                    </span>
                    <div className="opt-page__keywords-chips">
                      {pageData.analysis.missing_keywords.slice(0, 15).map((kw, i) => (
                        <span key={i} className="opt-page__keyword-chip">{kw}</span>
                      ))}
                    </div>
                    <p className="opt-page__keywords-hint">
                      These will be automatically injected when optimizing each section.
                    </p>
                  </div>
                )}

                {/* Weaknesses banner */}
                {pageData.analysis?.weaknesses?.length > 0 && (
                  <div className="opt-page__weaknesses-banner">
                    <span className="opt-page__weaknesses-title">⚠ Areas to Improve</span>
                    <ul className="opt-page__weaknesses-list">
                      {pageData.analysis.weaknesses.slice(0, 4).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section cards */}
                <div className="opt-page__sections">
                  {pageData.eligibleSections.length === 0 ? (
                    <div className="opt-page__no-sections">
                      <span className="opt-page__no-sections-icon">🎉</span>
                      <h3>Your resume looks great!</h3>
                      <p>No sections need significant improvement. Open the Resume Builder to make manual edits.</p>
                    </div>
                  ) : (
                    pageData.eligibleSections.map((sectionData) => (
                      <SectionCard
                        key={sectionData.section}
                        section={sectionData.section}
                        label={sectionData.label}
                        score={sectionData.score}
                        reason={sectionData.reason}
                        isEmpty={sectionData.isEmpty}
                      >
                        {renderSectionBody(sectionData)}
                      </SectionCard>
                    ))
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="opt-page__bottom-cta">
                  {acceptedCount > 0 && (
                    <span className="opt-page__accepted-count">
                      ✓ {acceptedCount} section{acceptedCount > 1 ? 's' : ''} optimized
                    </span>
                  )}
                  <button
                    className="opt-page__go-builder-btn"
                    onClick={() => navigate(`/resume-builder?id=${selectedResume.id}`)}
                  >
                    ✏ Open in Resume Builder →
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
