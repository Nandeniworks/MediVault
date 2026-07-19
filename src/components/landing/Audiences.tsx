import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Check, Heart, ClipboardList, HelpCircle } from 'lucide-react';
import './Audiences.css';

export const Audiences: React.FC = () => {
  const patientCapabilities = [
    { label: 'Store clinical reports', desc: 'Securely archive lab results, blood panels, vaccination histories, and treatment summaries.' },
    { label: 'Organize medical history', desc: 'Synthesize data into a single continuous clinical ledger timeline.' },
    { label: 'Retrieve past diagnostics', desc: 'Search previous exams or consult logs to avoid costly repeat testing.' },
    { label: 'Control sharing permissions', desc: 'Decide precisely which providers gain access and for how long.' }
  ];

  const doctorCapabilities = [
    { label: 'Request access seamlessly', desc: 'Submit immediate authorization requests directly using your clinician credential ID.' },
    { label: 'Review shared histories', desc: 'Inspect patient-released records in a clean structured layout.' },
    { label: 'View previous diagnostics', desc: 'Examine previous labs or scan results without duplicate diagnostic steps.' },
    { label: 'Map patient timelines', desc: 'Gain longitudinal clinical context including past medications and diagnoses.' }
  ];

  return (
    <section className="audiences-section" id="audiences">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <Badge variant="violet">Dual Infrastructure</Badge>
          <h2 className="section-title">Designed for Patient Autonomy & Clinical Speed</h2>
          <p className="section-desc">
            MediVault bridges patient control and physician context, creating an efficient channel for diagnostic data exchange.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="audiences-grid">
          
          {/* Patient Card */}
          <Card className="audience-card audience-patients" padding="lg" hoverable interactiveGlow>
            <div className="audience-card-header">
              <div className="audience-icon-badge bg-lavender">
                <Heart size={20} />
              </div>
              <Badge variant="lavender">For Patients</Badge>
            </div>
            <h3 className="audience-card-title">One history that moves with you.</h3>
            <p className="audience-card-intro">
              Never request physical files or log into dozens of portal accounts again. Your digital profile remains under your key authorization.
            </p>

            <div className="capability-box">
              <span className="capability-group-label">Platform Capabilities</span>
              <div className="capability-list">
                {patientCapabilities.map((cap, idx) => (
                  <div key={idx} className="capability-item">
                    <div className="item-bullet bg-lav">
                      <Check size={12} />
                    </div>
                    <div className="item-text">
                      <span className="name">{cap.label}</span>
                      <span className="desc">{cap.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Doctor Card */}
          <Card className="audience-card audience-doctors" padding="lg" hoverable interactiveGlow>
            <div className="audience-card-header">
              <div className="audience-icon-badge bg-mint">
                <ClipboardList size={20} />
              </div>
              <Badge variant="mint">For Doctors</Badge>
            </div>
            <h3 className="audience-card-title">Context when the patient chooses to share it.</h3>
            <p className="audience-card-intro">
              Access the clinical history you need in seconds. Spend less time hunting for documents and more time diagnosing patients.
            </p>

            <div className="capability-box">
              <span className="capability-group-label">Platform Capabilities</span>
              <div className="capability-list">
                {doctorCapabilities.map((cap, idx) => (
                  <div key={idx} className="capability-item">
                    <div className="item-bullet bg-mnt">
                      <Check size={12} />
                    </div>
                    <div className="item-text">
                      <span className="name">{cap.label}</span>
                      <span className="desc">{cap.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>

        {/* Phase Notification note */}
        <div className="prototype-capability-note">
          <HelpCircle size={16} className="text-muted" />
          <span>Note: The features outlined above represent the ultimate platform capabilities. In Phase 1, only the visual landing preview and core UI components are active.</span>
        </div>

      </div>
    </section>
  );
};
