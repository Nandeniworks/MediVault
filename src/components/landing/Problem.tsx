import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText, ArrowRight, RefreshCw, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import './Problem.css';

export const Problem: React.FC = () => {
  return (
    <section className="problem-section" id="security">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <Badge variant="danger">The Friction in Healthcare</Badge>
          <h2 className="section-title">
            Your health history shouldn't restart<br />
            when your doctor changes.
          </h2>
          <p className="section-desc">
            Medical information is isolated in local systems. Transferring providers often results in missing diagnostics, repeat lab tests, and disconnected records.
          </p>
        </div>

        {/* Visual Problem Flowchart */}
        <div className="flowchart-container">
          
          {/* Step 1: Hospital A */}
          <Card className="flowchart-node node-danger" padding="md">
            <div className="node-badge-wrapper">
              <span className="node-num">01</span>
              <span className="node-site">Hospital A (Origin)</span>
            </div>
            <h4 className="node-title">Records Created</h4>
            <p className="node-description">
              Diagnostic tests, blood panels, scans, and doctor prescriptions are generated.
            </p>
            <div className="node-items">
              <div className="node-item">
                <FileText size={14} className="node-item-icon" />
                <span>MRI Scan Report.pdf</span>
              </div>
              <div className="node-item">
                <FileText size={14} className="node-item-icon" />
                <span>Metabolic Panel.csv</span>
              </div>
            </div>
          </Card>

          {/* Connector 1 */}
          <div className="flowchart-connector">
            <div className="connector-line"></div>
            <div className="connector-badge badge-err">
              <XCircle size={14} />
              <span>Records Blocked</span>
            </div>
            <ArrowRight className="connector-arrow" size={16} />
          </div>

          {/* Step 2: The Transfer Barrier */}
          <Card className="flowchart-node node-warning" padding="md">
            <div className="node-badge-wrapper">
              <span className="node-num">02</span>
              <span className="node-site">Patient Relocates</span>
            </div>
            <h4 className="node-title">Provider Changes</h4>
            <p className="node-description">
              The patient visits a new hospital system. Hospital B has no access to previous digital archives.
            </p>
            <div className="node-barrier-status">
              <AlertCircle size={16} className="text-warning" />
              <span>History Unavailable</span>
            </div>
          </Card>

          {/* Connector 2 */}
          <div className="flowchart-connector">
            <div className="connector-line"></div>
            <div className="connector-badge badge-warn">
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Redundant Tests</span>
            </div>
            <ArrowRight className="connector-arrow" size={16} />
          </div>

          {/* Step 3: Hospital B */}
          <Card className="flowchart-node node-danger" padding="md">
            <div className="node-badge-wrapper">
              <span className="node-num">03</span>
              <span className="node-site">Hospital B (Destination)</span>
            </div>
            <h4 className="node-title">Repeated Work</h4>
            <p className="node-description">
              Doctors are forced to make decisions with incomplete data or repeat scans.
            </p>
            <div className="node-actions-err">
              <div className="node-error-badge">
                <span>Duplicate Lab Panels Requested</span>
              </div>
            </div>
          </Card>

        </div>

        {/* The MediVault Bridge Solution */}
        <div className="solution-bridge-box">
          <div className="solution-glow"></div>
          <div className="solution-card-inner">
            <div className="solution-brand-header">
              <div className="solution-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="solution-title-text">MediVault Unifies the Fragmented Chain</h3>
            </div>
            <p className="solution-description-text">
              By putting the patient in control of their digital vault, records are stored in a personal sandbox indexing ledger. When you change providers, your verified timeline moves with you instantly—giving your new doctor context in seconds, under your strict authorization.
            </p>
            <div className="solution-highlights">
              <div className="sol-highlight">
                <ShieldCheck size={16} className="text-mint" />
                <span>Single Patient Registry</span>
              </div>
              <div className="sol-highlight">
                <ShieldCheck size={16} className="text-mint" />
                <span>Revocable Provider Permissions</span>
              </div>
              <div className="sol-highlight">
                <ShieldCheck size={16} className="text-mint" />
                <span>Life-Long Clinical Timeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer Callout */}
        <div className="clinical-disclaimer-callout">
          <AlertCircle size={16} className="disclaimer-icon-alert" />
          <p className="clinical-disclaimer-copy">
            <strong>Clinical Consideration:</strong> While preventing unnecessary duplicates saves time and cost, healthcare professionals may still determine that repeating specific diagnostic tests is clinically necessary for accuracy, active monitoring, or immediate assessment.
          </p>
        </div>

      </div>
    </section>
  );
};
