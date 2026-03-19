// frontend/src/components/optimizer/BulletOptimizer.jsx

import { useState } from 'react';
import AILoadingState  from './AILoadingState';
import BeforeAfterView from './BeforeAfterView';
import './BulletOptimizer.css';

function BulletOptimizer({
  label, currentText, section,
  bulletIndex, projectIndex,
  resumeId, analysisId, mode,
  jobDescription, jobRole,
  onAccepted, onOptimize,
}) {
  const [state, setState]         = useState('idle');
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  // Track how many times optimize/regenerate has been called
  // This is passed to the backend so AI uses a different angle each time
  const [variation, setVariation] = useState(0);

  const runOptimize = async (currentVariation) => {
    setError('');
    setState('loading');
    try {
      const data = await onOptimize({
        resumeId, analysisId, section,
        bulletIndex, projectIndex,
        mode, jobDescription, jobRole,
        variation: currentVariation,
      });
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not optimize. Please try again.');
      setState('error');
    }
  };

  const handleOptimize = () => {
    setVariation(0);
    runOptimize(0);
  };

  const handleRegenerate = () => {
    // Increment variation so backend uses different angle + higher temperature
    const nextVariation = variation + 1;
    setVariation(nextVariation);
    setResult(null);
    runOptimize(nextVariation);
  };

  const handleAccept = async () => {
    if (!result?.optimizationId) return;
    setIsAccepting(true);
    try {
      await onAccepted(result.optimizationId, section, result.optimized);
      setState('accepted');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDiscard = () => {
    setResult(null);
    setState('idle');
    setError('');
    setVariation(0);
  };

  return (
    <div className="bullet-opt">
      {/* Current content preview */}
      <div className="bullet-opt__current">
        <span className="bullet-opt__current-label">Current</span>
        <p className="bullet-opt__current-text">
          {currentText || <em className="bullet-opt__empty">No content yet</em>}
        </p>
      </div>

      {state === 'idle' && (
        <button className="bullet-opt__btn" onClick={handleOptimize}>
          ✨ Optimize with AI
        </button>
      )}

      {state === 'loading' && (
        <AILoadingState section={section} />
      )}

      {state === 'error' && (
        <div className="bullet-opt__error">
          <span>{error}</span>
          <button className="bullet-opt__retry-btn" onClick={handleOptimize}>
            Try again
          </button>
        </div>
      )}

      {state === 'result' && result && (
        <>
          {variation > 0 && (
            <div className="bullet-opt__variation-badge">
              Variation {variation} — different angle
            </div>
          )}
          <BeforeAfterView
            original={result.original}
            optimized={result.optimized}
            onAccept={handleAccept}
            onRegenerate={handleRegenerate}
            onDiscard={handleDiscard}
            isAccepting={isAccepting}
          />
        </>
      )}

      {state === 'accepted' && (
        <div className="bullet-opt__accepted">
          <span className="bullet-opt__accepted-icon">✓</span>
          Resume updated with optimized content
          <button className="bullet-opt__redo-btn" onClick={handleDiscard}>
            Redo
          </button>
        </div>
      )}
    </div>
  );
}

export default BulletOptimizer;
