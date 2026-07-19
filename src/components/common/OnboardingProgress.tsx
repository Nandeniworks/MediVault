import React from 'react';
import './OnboardingProgress.css';

interface Step {
  title: string;
}

interface OnboardingProgressProps {
  currentStep: number;
  steps: Step[];
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="progress-indicator-container">
      <div className="progress-steps-row">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <div className={`progress-step-connector ${stepNum <= currentStep ? 'active' : ''}`}></div>
              )}
              <div className={`progress-step-circle-wrap ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className="step-title-text">{step.title}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
