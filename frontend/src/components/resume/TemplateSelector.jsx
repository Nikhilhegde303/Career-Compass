import './TemplateSelector.css';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, professional design with color accents',
    preview: '/templates/modern-preview.png'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, serif-based professional format',
    preview: '/templates/classic-preview.png'
  }
];

function TemplateSelector({ currentTemplate, onSelectTemplate, onClose }) {
  return (
    <div className="template-selector-overlay">
      <div className="template-selector-modal">
        <div className="modal-header">
          <h2>Choose a Template</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        <div className="template-grid">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`template-card ${currentTemplate === template.id ? 'selected' : ''}`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="template-preview-box">
                <div className={`template-mock ${template.id}`}>
                  <div className="mock-line"></div>
                  <div className="mock-line short"></div>
                  <div className="mock-section"></div>
                  <div className="mock-line"></div>
                  <div className="mock-line"></div>
                </div>
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                {currentTemplate === template.id && (
                  <span className="current-badge">Current</span>
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