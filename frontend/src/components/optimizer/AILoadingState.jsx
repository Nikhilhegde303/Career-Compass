// frontend/src/components/optimizer/AILoadingState.jsx

import { useState, useEffect } from 'react';
import './AILoadingState.css';

const MESSAGE_SETS = {
  summary: [
    'Reading your summary...',
    'Identifying ATS gaps...',
    'Crafting better language...',
    'Injecting keywords naturally...',
    'Finalizing your summary...',
  ],
  experience: [
    'Analyzing your bullet point...',
    'Finding stronger action verbs...',
    'Improving impact language...',
    'Finalizing improvement...',
  ],
  skills: [
    'Scanning your skills...',
    'Identifying missing keywords...',
    'Organizing categories...',
    'Finalizing skill set...',
  ],
  projects: [
    'Reading your project...',
    'Identifying technical depth...',
    'Improving description...',
    'Finalizing...',
  ],
  default: [
    'Analyzing content...',
    'Applying improvements...',
    'Almost done...',
  ],
};

function AILoadingState({ section = 'default' }) {
  const messages = MESSAGE_SETS[section] || MESSAGE_SETS.default;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="ai-loading">
      <div className="ai-loading__animation">
        <div className="ai-loading__dot" style={{ animationDelay: '0ms'   }} />
        <div className="ai-loading__dot" style={{ animationDelay: '160ms' }} />
        <div className="ai-loading__dot" style={{ animationDelay: '320ms' }} />
      </div>
      <span className="ai-loading__message" key={msgIndex}>
        {messages[msgIndex]}
      </span>
    </div>
  );
}

export default AILoadingState;
