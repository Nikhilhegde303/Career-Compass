// frontend/src/pages/ATSAnalyzer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Main ATS Analyzer page. Orchestrates the full flow:
//   Step 1 (if no :id in URL): Pick a resume (saved or upload)
//   Step 2: Select analysis mode (health / job_match)
//   Step 3: If job_match, enter job description
//   Step 4: Show full analysis results
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ModeSelector        from '../components/ats/ModeSelector';
import ResumePickerPanel   from '../components/ats/ResumePickerPanel';
import JobDescriptionPanel from '../components/ats/JobDescriptionPanel';
import ScoreOverview       from '../components/ats/ScoreOverview';
import ScoreBreakdown      from '../components/ats/ScoreBreakdown';
import StrengthsWeaknesses from '../components/ats/StrengthsWeaknesses';
import SuggestionsList     from '../components/ats/SuggestionsList';
import KeywordAnalysis     from '../components/ats/KeywordAnalysis';
import AnalysisRadar       from '../components/ats/AnalysisRadar';

import analysisService from '../services/analysisService';
import resumeService   from '../services/resumeService';

import './ATSAnalyzer.css';

// ── Step definitions ─────────────────────────────────────────────────────────
// 'pick'   → select resume
// 'mode'   → choose health or job_match
// 'jd'     → job description form (only for job_match)
// 'results'→ show analysis output
const STEPS = {
  PICK:    'pick',
  MODE:    'mode',
  JD:      'jd',
  RESULTS: 'results',
};

function ATSAnalyzer() {
  const { id: resumeIdFromUrl } = useParams();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────
  const [step, setStep]             = useState(resumeIdFromUrl ? STEPS.MODE : STEPS.PICK);
  const [selectedResume, setSelectedResume] = useState(null);
  const [mode, setMode]             = useState('');     // 'health' | 'job_match'
  const [jdForm, setJdForm]         = useState({ jobDescription: '', jobTitle: '', company: '' });
  const [jdErrors, setJdErrors]     = useState({});
  const [analysis, setAnalysis]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('overview');

  // ── If URL has :id, load that resume ──────────────────────────────
  useEffect(() => {
    if (!resumeIdFromUrl) return;
    const loadResume = async () => {
      try {
        const response = await resumeService.getResume(resumeIdFromUrl);
        setSelectedResume(response.data);
      } catch (err) {
        setError('Could not load resume. Please go back and try again.');
      }
    };
    loadResume();
  }, [resumeIdFromUrl]);

  // ── Load analysis history when resume is selected ─────────────────
  useEffect(() => {
    if (!selectedResume?.id) return;
    analysisService.getAnalysisHistory(selectedResume.id)
      .then(setHistory)
      .catch(() => {});
  }, [selectedResume?.id]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleResumeSelected = (resume) => {
    setSelectedResume(resume);
    setStep(STEPS.MODE);
  };

  const handleModeSelected = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleModeNext = () => {
    if (!mode) return;
    if (mode === 'job_match') {
      setStep(STEPS.JD);
    } else {
      runAnalysis('health');
    }
  };

  const handleJDNext = () => {
    const errors = {};
    if (!jdForm.jobDescription?.trim() || jdForm.jobDescription.trim().length < 50) {
      errors.jobDescription = 'Please paste a job description with at least 50 characters.';
    }
    if (Object.keys(errors).length > 0) {
      setJdErrors(errors);
      return;
    }
    runAnalysis('job_match');
  };

  const runAnalysis = async (analysisMode) => {
    setError('');
    setLoading(true);
    try {
      let result;
      if (analysisMode === 'health') {
        result = await analysisService.runHealthAnalysis(selectedResume.id);
      } else {
        result = await analysisService.runJobMatchAnalysis(selectedResume.id, {
          job_description: jdForm.jobDescription,
          job_title:       jdForm.jobTitle,
          company:         jdForm.company,
        });
      }
      setAnalysis(result);
      setHistory((prev) => [result, ...prev].slice(0, 10));
      setStep(STEPS.RESULTS);
      setActiveTab('overview');
    } catch (err) {
      setError(err?.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = () => {
    setAnalysis(null);
    setMode('');
    setJdForm({ jobDescription: '', jobTitle: '', company: '' });
    setJdErrors({});
    setStep(STEPS.MODE);
  };

  const handleBack = () => {
    if (step === STEPS.RESULTS) { handleReAnalyze(); return; }
    if (step === STEPS.JD)      { setStep(STEPS.MODE); return; }
    if (step === STEPS.MODE)    {
      if (resumeIdFromUrl) { navigate(-1); } else { setStep(STEPS.PICK); }
      return;
    }
    navigate(-1);
  };

  // ── Tabs for results view ─────────────────────────────────────────
  const getTabs = () => {
    const tabs = [
      { key: 'overview',     label: 'Overview'     },
      { key: 'strengths',    label: 'Strengths & Weaknesses' },
      { key: 'suggestions',  label: 'Suggestions'  },
    ];
    if (analysis?.analysis_type === 'job_match') {
      tabs.push({ key: 'keywords', label: 'Keyword Analysis' });
    }
    return tabs;
  };

  // ── Step label for breadcrumb ─────────────────────────────────────
  const STEP_LABELS = {
    [STEPS.PICK]:    'Select Resume',
    [STEPS.MODE]:    'Choose Mode',
    [STEPS.JD]:      'Job Description',
    [STEPS.RESULTS]: 'Results',
  };

  const BREADCRUMB_STEPS = resumeIdFromUrl
    ? [STEPS.MODE, STEPS.JD, STEPS.RESULTS]
    : [STEPS.PICK, STEPS.MODE, STEPS.JD, STEPS.RESULTS];

  const visibleSteps = mode === 'health'
    ? BREADCRUMB_STEPS.filter((s) => s !== STEPS.JD)
    : BREADCRUMB_STEPS;

  const currentStepIndex = visibleSteps.indexOf(step);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="ats-page">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="ats-page__header">
        <div className="ats-page__header-inner">
          <div className="ats-page__header-left">
            <button className="ats-page__back-btn" onClick={handleBack}>
              ← Back
            </button>
            <div>
              <h1 className="ats-page__title">ATS Analyzer</h1>
              {selectedResume && (
                <span className="ats-page__resume-label">
                  {selectedResume.title || 'Untitled Resume'}
                </span>
              )}
            </div>
          </div>

          {/* Breadcrumb stepper */}
          <div className="ats-page__stepper">
            {visibleSteps.map((s, i) => (
              <div key={s} className="ats-page__step-wrapper">
                {i > 0 && <div className={`ats-page__step-connector ${i <= currentStepIndex ? 'ats-page__step-connector--done' : ''}`} />}
                <div className={`ats-page__step ${i < currentStepIndex ? 'ats-page__step--done' : ''} ${i === currentStepIndex ? 'ats-page__step--active' : ''}`}>
                  <div className="ats-page__step-dot">
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span className="ats-page__step-label">{STEP_LABELS[s]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <main className="ats-page__content">

        {/* Global error */}
        {error && (
          <div className="ats-page__error">
            ⚠ {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="ats-page__loading">
            <div className="ats-page__loading-card">
              <div className="ats-page__spinner" />
              <h3>Analyzing your resume...</h3>
              <p>This usually takes a few seconds</p>
            </div>
          </div>
        )}

        {/* ── STEP: Pick Resume ────────────────────────────────── */}
        {step === STEPS.PICK && !loading && (
          <ResumePickerPanel onResumeSelected={handleResumeSelected} />
        )}

        {/* ── STEP: Mode Selection ─────────────────────────────── */}
        {step === STEPS.MODE && !loading && (
          <div className="ats-page__step-wrapper-content">
            <ModeSelector selectedMode={mode} onSelectMode={handleModeSelected} />
            <div className="ats-page__step-actions">
              <button
                className={`ats-page__next-btn ${!mode ? 'ats-page__next-btn--disabled' : ''}`}
                onClick={handleModeNext}
                disabled={!mode}
              >
                {mode === 'job_match' ? 'Next: Add Job Description →' : 'Analyze Resume →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Job Description ────────────────────────────── */}
        {step === STEPS.JD && !loading && (
          <div className="ats-page__step-wrapper-content">
            <JobDescriptionPanel
              formData={jdForm}
              onChange={setJdForm}
              errors={jdErrors}
            />
            <div className="ats-page__step-actions">
              <button className="ats-page__next-btn" onClick={handleJDNext}>
                Analyze Resume →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Results ────────────────────────────────────── */}
        {step === STEPS.RESULTS && analysis && !loading && (
          <div className="ats-results">

            {/* Results header row */}
            <div className="ats-results__actions">
  <button className="ats-results__reanalyze-btn" onClick={handleReAnalyze}>
    ↺ Re-Analyze
  </button>
  <div className="ats-results__actions-right">
    {history.length > 1 && (
      <span className="ats-results__history-note">
        {history.length} analyses completed
      </span>
    )}
    <button
      className="ats-results__improve-btn"
      onClick={() => navigate(
  `/optimizer?resumeId=${selectedResume.id}&analysisId=${analysis.id}&mode=${analysis.analysis_type}`
)}
    >
      ✏ Work on Your Resume →
    </button>
  </div>
</div>

            {/* Results layout: left sidebar + main content */}
            <div className="ats-results__layout">

              {/* LEFT SIDEBAR */}
              <aside className="ats-results__sidebar">
                <ScoreOverview  analysis={analysis} />
                <ScoreBreakdown analysis={analysis} />
                <AnalysisRadar  analysis={analysis} />
              </aside>

              {/* MAIN CONTENT with tabs */}
              <div className="ats-results__main">

                {/* Tabs */}
                <div className="ats-results__tabs">
                  {getTabs().map((tab) => (
                    <button
                      key={tab.key}
                      className={`ats-results__tab ${activeTab === tab.key ? 'ats-results__tab--active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="ats-results__tab-content">

                  {/* Overview tab */}
                  {activeTab === 'overview' && (
                    <div className="ats-results__overview">
                      <div className="ats-results__overview-intro">
                        <h2 className="ats-results__overview-title">Analysis Summary</h2>
                        <p className="ats-results__overview-desc">
                          {analysis.analysis_type === 'job_match'
                            ? `Your resume was compared against the job description${analysis.job_title ? ` for ${analysis.job_title}` : ''}. Here's how you measure up.`
                            : 'Here is a complete breakdown of your resume quality across all 5 ATS dimensions.'}
                        </p>
                      </div>

                      {/* Quick summary cards */}
                      <div className="ats-overview__cards">
                        {[
                          { icon: '🏗', label: 'Structure',   score: analysis.structure_score,   tip: 'Sections present' },
                          { icon: '🎯', label: 'Impact',      score: analysis.impact_score,      tip: 'Achievement quality' },
                          { icon: '⚡', label: 'Skills',      score: analysis.skills_score,      tip: 'Technical coverage' },
                          { icon: '🔑', label: 'Keywords',    score: analysis.keyword_score,     tip: 'Industry terms' },
                        ].map(({ icon, label, score, tip }) => {
                          const color = (score ?? 0) >= 75 ? '#4caf50' : (score ?? 0) >= 50 ? '#ff9800' : '#f44336';
                          return (
                            <div key={label} className="ats-overview__card">
                              <div className="ats-overview__card-icon">{icon}</div>
                              <div className="ats-overview__card-info">
                                <div className="ats-overview__card-label">{label}</div>
                                <div className="ats-overview__card-tip">{tip}</div>
                              </div>
                              <div className="ats-overview__card-score" style={{ color }}>
                                {score ?? 0}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Top suggestions preview */}
                      {analysis.suggestions?.length > 0 && (
                        <div className="ats-overview__top-suggestions">
                          <h4 className="ats-overview__top-suggestions-title">
                            🚀 Top Priorities
                          </h4>
                          <ul className="ats-overview__top-suggestions-list">
                            {analysis.suggestions
                              .filter((s) => s.priority === 'high')
                              .slice(0, 3)
                              .map((s, i) => (
                                <li key={i} className="ats-overview__top-suggestion-item">
                                  <span className="ats-overview__bullet">→</span>
                                  {s.text}
                                </li>
                              ))}
                          </ul>
                          <button
                            className="ats-overview__see-all-btn"
                            onClick={() => setActiveTab('suggestions')}
                          >
                            See all suggestions →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strengths & Weaknesses tab */}
                  {activeTab === 'strengths' && (
                    <StrengthsWeaknesses
                      strengths={analysis.strengths  ?? []}
                      weaknesses={analysis.weaknesses ?? []}
                    />
                  )}

                  {/* Suggestions tab */}
                  {activeTab === 'suggestions' && (
                    <SuggestionsList suggestions={analysis.suggestions ?? []} />
                  )}

                  {/* Keywords tab (job match only) */}
                  {activeTab === 'keywords' && analysis.analysis_type === 'job_match' && (
                    <KeywordAnalysis analysis={analysis} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ATSAnalyzer;
