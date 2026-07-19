import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Shield, ShieldAlert, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import './Hero.css';

interface HeroProps {
  onCreateVaultClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCreateVaultClick }) => {
  return (
    <section className="hero">
      <div className="glow-ambient hero-glow-1"></div>
      <div className="glow-ambient hero-glow-2"></div>
      
      <div className="container hero-grid">
        {/* Left Side: Headline Copy */}
        <div className="hero-text-block">
          <div className="hero-badge-row">
            <span className="hero-badge">
              <Shield size={12} className="hero-badge-icon" />
              Self-Custodial Health Identity
            </span>
          </div>
          <h1 className="hero-title">
            Your medical history.<br />
            <span className="text-gradient">One secure place.</span><br />
            Always with you.
          </h1>
          <p className="hero-description">
            Store, organize, and securely share your medical records across healthcare providers—while staying in absolute control of your clinical data.
          </p>
          <div className="hero-actions">
            <Button 
              variant="primary" 
              size="lg" 
              icon={<ArrowRight size={18} />} 
              iconPosition="right"
              onClick={onCreateVaultClick}
            >
              Create Your Health Vault
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              as="a"
              href="#how-it-works"
            >
              See How It Works
            </Button>
          </div>
          <div className="hero-metadata">
            <span className="metadata-item">
              <CheckCircle size={14} className="metadata-check" /> Zero-knowledge encryption
            </span>
            <span className="metadata-item">
              <CheckCircle size={14} className="metadata-check" /> Patient-authorized access
            </span>
          </div>
        </div>

        {/* Right Side: Layered Floating UI Preview */}
        <div className="hero-preview-container">
          <div className="hero-preview-wrapper animate-float">
            
            {/* UI Fragment 1: Digital Health ID */}
            <Card className="preview-element health-id-card" padding="sm" glow>
              <div className="id-card-header">
                <div className="id-card-logo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5"/>
                  </svg>
                  <span>MediVault ID</span>
                </div>
                <Badge variant="mint">Active</Badge>
              </div>
              <div className="id-card-user">
                <div className="user-avatar-placeholder">ER</div>
                <div className="user-info">
                  <span className="user-name">Ellen Ross</span>
                  <span className="user-dob">DOB: Dec 07, 1972</span>
                </div>
              </div>
              <div className="id-card-footer">
                <span className="vault-id-label">Vault ID</span>
                <span className="vault-id-val">MV-9823-110</span>
              </div>
            </Card>

            {/* UI Fragment 2: Clinical Report Status */}
            <Card className="preview-element report-card animate-float-slow" padding="sm">
              <div className="report-card-top">
                <div className="report-icon-wrapper">
                  <Activity size={16} />
                </div>
                <div className="report-info">
                  <span className="report-title">Lipid Panel Report</span>
                  <span className="report-source">Quest Diagnostics</span>
                </div>
              </div>
              <div className="report-card-bottom">
                <Badge variant="success">Securely Indexed</Badge>
                <span className="report-date">Jun 24, 2026</span>
              </div>
            </Card>

            {/* UI Fragment 3: Access Authorization Request Popup */}
            <Card className="preview-element request-card" padding="md" glow>
              <div className="request-header">
                <ShieldAlert size={20} className="request-alert-icon" />
                <div>
                  <h4 className="request-title">Access Requested</h4>
                  <p className="request-desc">Dr. Emily Parker requests temporary access</p>
                </div>
              </div>
              <div className="request-details">
                <div className="details-row">
                  <span className="details-label">Requested Scope</span>
                  <span className="details-val">Hematology Reports</span>
                </div>
                <div className="details-row">
                  <span className="details-label">Duration</span>
                  <span className="details-val text-warning">2 Hours Only</span>
                </div>
              </div>
              <div className="request-actions">
                <button className="req-btn req-btn-deny" type="button">Decline</button>
                <button className="req-btn req-btn-allow" type="button">Approve Share</button>
              </div>
            </Card>

            {/* UI Fragment 4: Medical Timeline Node */}
            <Card className="preview-element timeline-card animate-float" padding="sm">
              <div className="timeline-node">
                <div className="timeline-bullet"></div>
                <div className="timeline-content">
                  <span className="timeline-label">Cardiology Consultation</span>
                  <span className="timeline-sub">Ashby Medical Center</span>
                  <span className="timeline-date">May 15, 2026</span>
                </div>
              </div>
            </Card>
            
          </div>
        </div>
      </div>
    </section>
  );
};
