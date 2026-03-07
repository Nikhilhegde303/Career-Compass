import './TemplateSelector.css';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with color accents and compact spacing',
    preview: 'modern'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif-based format with professional structure',
    preview: 'classic'
  }
];

function TemplateSelector({ currentTemplate, onSelectTemplate, onClose }) {
  const handleSelect = (templateId) => {
    onSelectTemplate(templateId);
  };

  return (
    <div className="template-selector-overlay" onClick={onClose}>
      <div className="template-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a Template</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        <div className="template-grid">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`template-card ${currentTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleSelect(template.id)}
            >
              <div className="template-preview-box">
                <div className={`template-mock ${template.id}`}>
                  {template.id === 'modern' ? (
                    <>
                      <div className="mock-header modern-mock"></div>
                      <div className="mock-line blue"></div>
                      <div className="mock-content">
                        <div className="mock-section">
                          <div className="mock-title blue"></div>
                          <div className="mock-text"></div>
                          <div className="mock-text short"></div>
                        </div>
                        <div className="mock-section">
                          <div className="mock-title blue"></div>
                          <div className="mock-text"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mock-header classic-mock"></div>
                      <div className="mock-line black"></div>
                      <div className="mock-content">
                        <div className="mock-section">
                          <div className="mock-title black"></div>
                          <div className="mock-text"></div>
                          <div className="mock-text short"></div>
                        </div>
                        <div className="mock-section">
                          <div className="mock-title black"></div>
                          <div className="mock-text"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                {currentTemplate === template.id && (
                  <span className="current-badge">✓ Current</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;