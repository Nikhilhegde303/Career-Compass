// frontend/src/components/optimizer/BeforeAfterView.jsx

import { useState } from 'react';
import './BeforeAfterView.css';

function BeforeAfterView({ original, optimized, onAccept, onRegenerate, onDiscard, isAccepting }) {
  const [view, setView] = useState('optimized'); // 'original' | 'optimized' | 'diff'

  // Simple word-level diff highlight
  const renderDiff = () => {
    if (!original || !optimized) return optimized;

    const origWords = original.split(/\s+/);
    const optWords  = optimized.split(/\s+/);
    const origSet   = new Set(origWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, '')));

    return optWords.map((word, i) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isNew = clean.length > 2 && !origSet.has(clean);
      return isNew
        ? <mark key={i} className="before-after__highlight">{word} </mark>
        : <span key={i}>{word} </span>;
    });
  };

  return (
    <div className="before-after">
      {/* View toggle */}
      <div className="before-after__toggle">
        <button
          className={`before-after__toggle-btn ${view === 'original'  ? 'before-after__toggle-btn--active' : ''}`}
          onClick={() => setView('original')}
        >
          Before
        </button>
        <button
          className={`before-after__toggle-btn ${view === 'optimized' ? 'before-after__toggle-btn--active' : ''}`}
          onClick={() => setView('optimized')}
        >
          After
        </button>
        <button
          className={`before-after__toggle-btn ${view === 'diff'      ? 'before-after__toggle-btn--active' : ''}`}
          onClick={() => setView('diff')}
        >
          Changes
        </button>
      </div>

      {/* Content area */}
      <div className="before-after__content">
        {view === 'original' && (
          <p className="before-after__text before-after__text--original">
            {original || <em className="before-after__empty">No original content</em>}
          </p>
        )}
        {view === 'optimized' && (
          <p className="before-after__text before-after__text--optimized">
            {optimized}
          </p>
        )}
        {view === 'diff' && (
          <p className="before-after__text before-after__text--diff">
            {renderDiff()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="before-after__actions">
        <button
          className="before-after__btn before-after__btn--accept"
          onClick={onAccept}
          disabled={isAccepting}
        >
          {isAccepting ? 'Saving...' : '✓ Accept'}
        </button>
        <button
          className="before-after__btn before-after__btn--regenerate"
          onClick={onRegenerate}
          disabled={isAccepting}
        >
          ↺ Regenerate
        </button>
        <button
          className="before-after__btn before-after__btn--discard"
          onClick={onDiscard}
          disabled={isAccepting}
        >
          ✕ Discard
        </button>
      </div>
    </div>
  );
}

export default BeforeAfterView;
