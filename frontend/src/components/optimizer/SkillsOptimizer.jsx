// frontend/src/components/optimizer/SkillsOptimizer.jsx

import { useState } from 'react';
import AILoadingState from './AILoadingState';
import './SkillsOptimizer.css';

function SkillChip({ skill, isNew }) {
  return (
    <span className={`skill-chip ${isNew ? 'skill-chip--new' : ''}`}>
      {skill}
      {isNew && <span className="skill-chip__new-badge">+</span>}
    </span>
  );
}

function SkillsOptimizer({
  currentSkills, resumeId, analysisId,
  mode, jobDescription, jobRole,
  onAccepted, onOptimize,
}) {
  const [state, setState]         = useState('idle');
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [variation, setVariation] = useState(0);

  const findNewSkills = (original, optimized) => {
    const newSet = new Set();
    Object.keys(optimized).forEach((cat) => {
      const origSet = new Set((original[cat] || []).map((s) => s.toLowerCase()));
      (optimized[cat] || []).forEach((skill) => {
        if (!origSet.has(skill.toLowerCase())) newSet.add(skill);
      });
    });
    return newSet;
  };

  const runOptimize = async (currentVariation) => {
    setError('');
    setState('loading');
    try {
      const data = await onOptimize({
        resumeId, analysisId, section: 'skills',
        mode, jobDescription, jobRole,
        variation: currentVariation,
      });
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not optimize skills. Please try again.');
      setState('error');
    }
  };

  const handleOptimize = () => {
    setVariation(0);
    runOptimize(0);
  };

  const handleRegenerate = () => {
    const next = variation + 1;
    setVariation(next);
    setResult(null);
    runOptimize(next);
  };

  const handleAccept = async () => {
    if (!result?.optimizationId) return;
    setIsAccepting(true);
    try {
      await onAccepted(result.optimizationId, 'skills', result.parsedValue);
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

  const parsedOptimized = result?.parsedValue;
  const newSkills = parsedOptimized
    ? findNewSkills(currentSkills || {}, parsedOptimized)
    : new Set();

  const renderCategory = (label, skills, orig) => {
    if (!skills?.length) return null;
    const origSet = new Set((orig || []).map((s) => s.toLowerCase()));
    return (
      <div className="skills-opt__category">
        <span className="skills-opt__cat-label">{label}</span>
        <div className="skills-opt__chips">
          {skills.map((skill, i) => (
            <SkillChip key={i} skill={skill} isNew={!origSet.has(skill.toLowerCase())} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="skills-opt">
      {/* Current skills */}
      <div className="skills-opt__current">
        <span className="skills-opt__section-label">Current Skills</span>
        {Object.entries(currentSkills || {}).map(([cat, arr]) =>
          arr?.length > 0 ? (
            <div key={cat} className="skills-opt__category">
              <span className="skills-opt__cat-label">{cat}</span>
              <div className="skills-opt__chips">
                {arr.map((skill, i) => <SkillChip key={i} skill={skill} />)}
              </div>
            </div>
          ) : null
        )}
      </div>

      {state === 'idle' && (
        <button className="skills-opt__btn" onClick={handleOptimize}>
          ✨ Optimize Skills with AI
        </button>
      )}

      {state === 'loading' && <AILoadingState section="skills" />}

      {state === 'error' && (
        <div className="skills-opt__error">
          <span>{error}</span>
          <button className="skills-opt__retry" onClick={handleOptimize}>Try again</button>
        </div>
      )}

      {state === 'result' && parsedOptimized && (
        <div className="skills-opt__result">
          <div className="skills-opt__result-header">
            <span className="skills-opt__result-label">
              ✨ Optimized Skills
              {variation > 0 && (
                <span className="skills-opt__variation"> · Variation {variation}</span>
              )}
            </span>
            {newSkills.size > 0 && (
              <span className="skills-opt__new-count">
                +{newSkills.size} new skill{newSkills.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="skills-opt__optimized">
            {renderCategory('Technical', parsedOptimized.technical, currentSkills?.technical)}
            {renderCategory('Soft Skills', parsedOptimized.soft, currentSkills?.soft)}
            {renderCategory('Languages', parsedOptimized.languages, currentSkills?.languages)}
          </div>
          <div className="skills-opt__actions">
            <button className="skills-opt__accept-btn" onClick={handleAccept} disabled={isAccepting}>
              {isAccepting ? 'Saving...' : '✓ Accept Changes'}
            </button>
            <button className="skills-opt__regenerate-btn" onClick={handleRegenerate} disabled={isAccepting}>
              ↺ Regenerate
            </button>
            <button className="skills-opt__discard-btn" onClick={handleDiscard} disabled={isAccepting}>
              ✕ Discard
            </button>
          </div>
        </div>
      )}

      {state === 'accepted' && (
        <div className="skills-opt__accepted">
          <span>✓</span> Skills updated successfully
          <button className="skills-opt__redo" onClick={handleDiscard}>Redo</button>
        </div>
      )}
    </div>
  );
}

export default SkillsOptimizer;
