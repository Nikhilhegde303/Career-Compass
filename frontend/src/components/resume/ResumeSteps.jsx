import './ResumeSteps.css';

function ResumeSteps({ steps, currentStep, onStepClick }) {
  return (
    <div className="resume-steps">
      <h3>Resume Sections</h3>
      <div className="steps-list">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => onStepClick(index)}
          >
            <div className="step-number">
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResumeSteps;