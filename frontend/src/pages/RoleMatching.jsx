// frontend/src/pages/RoleMatching.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pure orchestration page — state, API calls, layout only.
// All UI lives in frontend/src/components/roleMatching/
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate }      from 'react-router-dom';
import api                                   from '../services/api';

import LoadingScreen  from '../components/roleMatching/LoadingScreen';
import ResumeSelector from '../components/roleMatching/ResumeSelector';
import CareerBanner   from '../components/roleMatching/CareerBanner';
import RoleCard       from '../components/roleMatching/RoleCard';
import SkillCloud     from '../components/roleMatching/SkillCloud';

import './RoleMatching.css';

export default function RoleMatching() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();

  const [resumes,        setResumes]        = useState([]);
  const [selectedResume, setSelectedResume] = useState(searchParams.get('resumeId') || '');
  const [loading,        setLoading]        = useState(false);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState('');

  // ── Fetch user's resumes for the selector ──────────────────────────────────
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/roles/resumes');
        setResumes(res.data.resumes || []);

        // Auto-select if resumeId already in URL
        const urlId = searchParams.get('resumeId');
        if (urlId && res.data.resumes.some(r => r.id === urlId)) {
          setSelectedResume(urlId);
        } else if (res.data.resumes.length === 1) {
          // Auto-select if user only has one resume
          setSelectedResume(res.data.resumes[0].id);
        }
      } catch {
        setError('Failed to load your resumes. Please log in and try again.');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // ── Run analysis ───────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!selectedResume) return;
    setLoading(true);
    setResult(null);
    setError('');
    navigate(`/role-matching?resumeId=${selectedResume}`, { replace: true });

    try {
      const res = await api.get(`/roles/match/${selectedResume}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedResume, navigate]);

  // Auto-run if resumeId was pre-set in URL
  useEffect(() => {
    if (selectedResume && !resumesLoading && !result && !loading) {
      runAnalysis();
    }
  }, [selectedResume, resumesLoading]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  return (
    <div className="rm-page">

      {/* ── Page Header ── */}
      <div className="rm-header">
        <div className="rm-header-content">
          <h1 className="rm-page-title">
            <span className="rm-compass-icon">🧭</span>
            Career Intelligence
          </h1>
          <p className="rm-page-subtitle">
            Discover your best-fit roles using ML-powered matching,
            real job listings, and AI career guidance.
          </p>
        </div>
      </div>

      <div className="rm-container">

        {/* ── Resume Selector ── */}
        {!resumesLoading && (
          <ResumeSelector
            resumes={resumes}
            selectedResume={selectedResume}
            onSelect={setSelectedResume}
            onAnalyze={runAnalysis}
            loading={loading}
            hasResult={!!result}
          />
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rm-error-box">⚠️ {error}</div>
        )}

        {/* ── Results ── */}
        {result && (
          <>
            <CareerBanner
              trajectory={result.trajectory}
              careerSummary={result.careerSummary}
              candidateSkillCount={result.candidateSkills?.length || 0}
              totalRolesAnalyzed={result.totalRolesAnalyzed}
            />

            {result.roles?.length > 0 ? (
              <section className="rm-roles-section">
                <h2 className="rm-section-title">Your Top Role Matches</h2>
                <div className="rm-roles-list">
                  {result.roles.map((match, index) => (
                    <RoleCard key={match.id} match={match} rank={index} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="rm-no-matches">
                <p>
                  🤔 No strong matches found. Try adding more skills and
                  project details to your resume, then re-analyze.
                </p>
              </div>
            )}

            <SkillCloud skills={result.candidateSkills} />

            <p className="rm-footer-note">
              Analysis generated on{' '}
              {new Date(result.generatedAt).toLocaleString('en-IN')} ·
              Resume: <strong>{result.resumeTitle}</strong>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
