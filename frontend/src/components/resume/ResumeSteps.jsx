import './ResumeSteps.css';

function ResumeSteps({ steps, currentStep, onStepClick, completionStatus = {} }) {
  return (
    <div className="resume-steps">
      <h3>Resume Sections</h3>
      <div className="steps-list">
        {steps.map((step, index) => {
          const isCompleted = completionStatus[step.id];
          const isCurrent = index === currentStep;
          
          return (
            <div
              key={step.id}
              className={`step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepClick(index)}
            >
              <div className="step-number">
                {isCompleted ? '✓' : index + 1}
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                {step.required && !isCompleted && (
                  <span className="required-badge">Required</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeSteps;