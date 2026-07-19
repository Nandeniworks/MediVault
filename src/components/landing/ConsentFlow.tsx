import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Shield, Key, User, Lock } from 'lucide-react';
import './ConsentFlow.css';

export const ConsentFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Doctor requests access',
      desc: 'A clinical provider requests specific categories of your medical history by sharing their medical register number.',
      badge: 'Request Node'
    },
    {
      title: 'Patient reviews request',
      desc: 'You receive an instant alert on your dashboard with details of the doctor, their specialty, and why they need access.',
      badge: 'Review Stage'
    },
    {
      title: 'Patient selects records',
      desc: 'You decide exactly what to share. Choose to expose only a single blood test, a specific consultation note, or nothing.',
      badge: 'Filter Scope'
    },
    {
      title: 'Temporary access granted',
      desc: 'MediVault issues a single-use authorization token valid only for a defined period (e.g., 2 hours).',
      badge: 'Secure Session'
    },
    {
      title: 'Access expires or is revoked',
      desc: 'The authorization automatically expires, or you click "Revoke" instantly to terminate access and lock files.',
      badge: 'Session Closed'
    }
  ];

  const renderVisualState = () => {
    switch (activeStep) {
      case 0: // Request
        return (
          <div className="flow-visual-card request-visual animate-fade-in">
            <div className="doctor-tag">
              <User size={14} />
              <span>Dr. Emily Parker, Cardiology</span>
            </div>
            <div className="request-badge-row">
              <Badge variant="info">Requesting Read Access</Badge>
            </div>
            <p className="visual-details-text">
              "Seeking access to Cardiology consultation summaries and Lipid lab panels from the last 12 months for review."
            </p>
            <div className="pulse-circle-wrap">
              <div className="pulse-circle"></div>
              <span>Awaiting authorize...</span>
            </div>
          </div>
        );
      case 1: // Review
        return (
          <div className="flow-visual-card review-visual animate-fade-in">
            <div className="alert-header-visual text-warning">
              <Shield size={18} />
              <span>Authorization Requested</span>
            </div>
            <div className="review-table">
              <div className="review-row">
                <span className="lbl">Requester:</span>
                <span className="val">Dr. Emily Parker (ID: #43881)</span>
              </div>
              <div className="review-row">
                <span className="lbl">Scope:</span>
                <span className="val text-gradient">Cardiology Logs</span>
              </div>
              <div className="review-row">
                <span className="lbl">Action:</span>
                <span className="val">Authorize Sharing Link</span>
              </div>
            </div>
            <div className="review-actions-visual">
              <span className="btn-vis-deny">Decline</span>
              <span className="btn-vis-allow">Review Files</span>
            </div>
          </div>
        );
      case 2: // Filter Select
        return (
          <div className="flow-visual-card filter-visual animate-fade-in">
            <span className="filter-title-label">Scope Selection Ledger</span>
            <div className="filter-options-list">
              <div className="filter-item checked">
                <div className="checkbox-mock checked"></div>
                <div className="filter-info">
                  <span className="main">Quest Diagnostics - Lipid Panel</span>
                  <span className="sub">Dec 02, 2026</span>
                </div>
                <Badge variant="mint">Include</Badge>
              </div>
              <div className="filter-item checked">
                <div className="checkbox-mock checked"></div>
                <div className="filter-info">
                  <span className="main">Ashby Medical - Heart Rate Analysis</span>
                  <span className="sub">Nov 24, 2026</span>
                </div>
                <Badge variant="mint">Include</Badge>
              </div>
              <div className="filter-item text-muted">
                <div className="checkbox-mock"></div>
                <div className="filter-info">
                  <span className="main">Quest Labs - Blood Glucose Panel</span>
                  <span className="sub">Aug 14, 2026</span>
                </div>
                <Badge variant="info">Omit</Badge>
              </div>
            </div>
          </div>
        );
      case 3: // Temporary access
        return (
          <div className="flow-visual-card session-visual animate-fade-in">
            <div className="session-header-visual">
              <div className="key-spin-wrap">
                <Key size={18} className="text-mint animate-float" />
              </div>
              <div>
                <span className="tag text-mint">Access Authorized</span>
                <h4 className="title">Session Token Issued</h4>
              </div>
            </div>
            <div className="session-progress-mock">
              <div className="session-progress-line"></div>
            </div>
            <div className="session-details-row">
              <span className="lbl">Remaining:</span>
              <span className="val text-warning">01 hr 59 min</span>
            </div>
            <div className="session-actions-visual">
              <span className="btn-vis-revoke">Revoke Access Now</span>
            </div>
          </div>
        );
      case 4: // Expired/Revoked
      default:
        return (
          <div className="flow-visual-card revoked-visual animate-fade-in">
            <div className="revoked-header-visual text-danger">
              <Lock size={18} />
              <span>Access Terminated</span>
            </div>
            <p className="visual-details-text">
              The cryptographic sharing keys associated with Session Token MV-9823 have been purged. All sharing logs are permanently locked.
            </p>
            <div className="revoked-badge-status">
              <span className="indicator"></span>
              <span>Ledger: Revoked</span>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="consent-section" id="security-details">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <Badge variant="mint">Granular Permission Control</Badge>
          <h2 className="section-title">Your records. Your permission.</h2>
          <p className="section-desc">
            A digital Health ID does not automatically expose your records. Healthcare providers only see what you choose to release, when you choose to release it.
          </p>
        </div>

        {/* 2-column Consent Flow layout */}
        <div className="consent-flow-grid">
          
          {/* Left Column: Flow List */}
          <div className="consent-steps-col">
            <div className="steps-wrapper">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div 
                    key={idx} 
                    className={`step-interactive-node ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div className="step-number-circle">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="step-text-details">
                      <div className="step-header-title">
                        <h4 className="title">{step.title}</h4>
                        {isActive && <Badge variant="mint">{step.badge}</Badge>}
                      </div>
                      <p className="desc">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Stage Sandbox */}
          <div className="consent-visual-col">
            <div className="visual-panel-sticky">
              <Card className="visual-panel-card" padding="lg">
                
                {/* Header of Sandbox */}
                <div className="sandbox-header">
                  <div className="sandbox-dot red"></div>
                  <div className="sandbox-dot yellow"></div>
                  <div className="sandbox-dot green"></div>
                  <span className="sandbox-title">Sandbox Authorization ledger</span>
                </div>

                {/* State Screen Container */}
                <div className="sandbox-screen-body">
                  {renderVisualState()}
                </div>

                {/* Navigation indicators */}
                <div className="sandbox-footer-controls">
                  <span className="control-label">Click step index to preview flow state</span>
                  <div className="control-dots">
                    {steps.map((_, idx) => (
                      <button 
                        key={idx} 
                        className={`dot-indicator ${activeStep === idx ? 'active' : ''}`}
                        onClick={() => setActiveStep(idx)}
                        aria-label={`Go to step ${idx + 1}`}
                      ></button>
                    ))}
                  </div>
                </div>

              </Card>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
