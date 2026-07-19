import React, { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ShieldCheck, Copy, Check, Share2, Eye } from 'lucide-react';
import type { UserProfile } from '../../services/authService';

interface HealthIdCardProps {
  user: UserProfile | null;
  isDemoMode: boolean;
  onShareClick?: () => void;
}

export const HealthIdCard: React.FC<HealthIdCardProps> = ({
  user,
  isDemoMode,
  onShareClick
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Profile data mapping
  const displayName = isDemoMode ? 'Aarav Sharma' : (user?.name || 'Patient User');
  const displayId = isDemoMode ? 'MV-2026-7A9K2X' : (user?.healthId || 'MV-2026-PENDING');
  const memberSince = isDemoMode ? '2026' : '2026';
  
  // Custom interactive Cursor Sheen handler
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cardRef.current.style.setProperty('--sheen-x', `${x}px`);
    cardRef.current.style.setProperty('--sheen-y', `${y}px`);
    cardRef.current.style.setProperty('--sheen-opacity', '0.15');
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--sheen-opacity', '0');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (onShareClick) {
      onShareClick();
    } else {
      alert(`Sharing details for Health ID: ${displayId}`);
    }
  };

  return (
    <>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="digital-health-id-card-wrapper animate-fade-in"
      >
        <Card className="health-id-card-front" padding="none">
          {/* Card Cursor Sheen Layer */}
          <div className="card-sheen-layer"></div>
          
          <div className="card-glass-glow"></div>
          
          <div className="card-layout-content">
            {/* Header branding */}
            <div className="card-row-top">
              <div className="card-brand-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>MediVault</span>
              </div>
              <Badge variant="mint" className="status-badge-pulse">Active ID</Badge>
            </div>

            {/* Middle body info */}
            <div className="card-row-middle">
              <div className="avatar-placeholder-wrapper">
                <div className="avatar-graphic">
                  {displayName.charAt(0)}
                </div>
                <div className="role-ribbon">Patient</div>
              </div>
              
              <div className="identity-block">
                <span className="id-sublabel">Personal Health ID</span>
                <h2 className="id-name-title">{displayName}</h2>
                <div className="id-code text-gradient">{displayId}</div>
              </div>
            </div>

            {/* Footer rows */}
            <div className="card-row-bottom">
              <div className="footer-details-grid">
                <div className="detail-item">
                  <span className="det-label">Member Since</span>
                  <span className="det-val">{memberSince}</span>
                </div>
                <div className="detail-item">
                  <span className="det-label">Clearance</span>
                  <span className="det-val">Level 1 (Patient)</span>
                </div>
                <div className="detail-item text-right">
                  <span className="det-label">Identity Status</span>
                  <span className="det-val text-mint">Active</span>
                </div>
              </div>
              
              <div className="card-tagline-text">
                Your health. Your history. Your control.
              </div>
            </div>
          </div>
        </Card>

        {/* View Actions Overlay */}
        <div className="health-card-actions-bar">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={<Eye size={14} />}
            className="action-btn-card"
          >
            View Health ID
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCopyId}
            icon={copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            className="action-btn-card"
          >
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
        </div>
      </div>

      {/* Expanded Health ID Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Digital Patient Health ID"
      >
        <div className="health-id-modal-layout">
          
          <div className="modal-card-display">
            {/* Matte representation of ID Card inside Modal */}
            <div className="mini-id-card">
              <div className="mini-card-header">
                <span className="brand">🛡️ MEDIVAULT</span>
                <span className="pill">PATIENT CREDENTIAL</span>
              </div>
              <div className="mini-card-body">
                <div className="avatar-circle-mini">{displayName.charAt(0)}</div>
                <div className="mini-info">
                  <div className="name">{displayName}</div>
                  <div className="code text-gradient">{displayId}</div>
                </div>
              </div>
              <div className="mini-card-footer">
                <span>Member Since: {memberSince}</span>
                <span className="status">● Active</span>
              </div>
            </div>
          </div>

          <div className="modal-interactive-section">
            
            {/* Copy / Share Actions Box */}
            <div className="actions-header-box">
              <div className="code-display-box">
                <span className="field-label">Your Health ID</span>
                <div className="code-row">
                  <code className="health-code-literal">{displayId}</code>
                  <button 
                    onClick={handleCopyId} 
                    className="copy-bubble-btn"
                    title="Copy Health ID"
                  >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Secure QR Code graphic */}
              <div className="qr-container-box">
                <div className="qr-wrapper">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Mock secure QR pattern */}
                    <rect width="100" height="100" rx="12" fill="rgba(255, 255, 255, 0.03)" />
                    <rect x="10" y="10" width="25" height="25" rx="3" stroke="var(--accent-lavender)" strokeWidth="3" fill="none" />
                    <rect x="16" y="16" width="13" height="13" rx="1.5" fill="var(--accent-lavender)" />
                    <rect x="65" y="10" width="25" height="25" rx="3" stroke="var(--accent-lavender)" strokeWidth="3" fill="none" />
                    <rect x="71" y="16" width="13" height="13" rx="1.5" fill="var(--accent-lavender)" />
                    <rect x="10" y="65" width="25" height="25" rx="3" stroke="var(--accent-lavender)" strokeWidth="3" fill="none" />
                    <rect x="16" y="71" width="13" height="13" rx="1.5" fill="var(--accent-lavender)" />
                    {/* Small noise code points */}
                    <rect x="45" y="10" width="8" height="8" rx="1" fill="var(--text-secondary)" />
                    <rect x="45" y="25" width="12" height="6" rx="1" fill="var(--accent-mint)" />
                    <rect x="65" y="45" width="8" height="12" rx="1" fill="var(--text-secondary)" />
                    <rect x="10" y="45" width="16" height="8" rx="1" fill="var(--accent-lavender)" opacity="0.8" />
                    <rect x="35" y="45" width="20" height="20" rx="2" fill="var(--text-primary)" opacity="0.9" />
                    <rect x="65" y="65" width="10" height="10" rx="1" fill="var(--accent-mint)" />
                    <rect x="80" y="80" width="10" height="10" rx="1" fill="var(--accent-lavender)" />
                    <rect x="80" y="65" width="8" height="8" rx="1" fill="var(--text-secondary)" />
                    <rect x="65" y="80" width="8" height="8" rx="1" fill="var(--text-secondary)" />
                    {/* Safe middle shield icon anchor */}
                    <rect x="42" y="42" width="16" height="16" rx="4" fill="var(--bg-surface)" stroke="var(--accent-lavender)" strokeWidth="1.5" />
                    <path d="M50 47.5L46.5 49V52.5C46.5 54.5 50 56.5 50 56.5C50 56.5 53.5 54.5 53.5 52.5V49L50 47.5Z" stroke="var(--accent-lavender)" strokeWidth="1" fill="none"/>
                  </svg>
                </div>
                <span className="qr-caption">Encrypted ID Scan QR</span>
              </div>
            </div>

            {/* Educational Disclaimer */}
            <div className="security-notice-card">
              <ShieldCheck className="notice-icon text-mint" size={20} />
              <div className="notice-text">
                <h4>Secure Consent Verification</h4>
                <p>
                  Sharing your Health ID does <strong>NOT</strong> share your medical records. Healthcare professionals must request access, and you decide what to approve.
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="modal-action-row">
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleShare}
                icon={<Share2 size={16} />}
                className="modal-share-btn"
              >
                Share Health ID
              </Button>
              <Button 
                variant="secondary" 
                size="md" 
                onClick={() => setModalOpen(false)}
              >
                Close View
              </Button>
            </div>

          </div>

        </div>
      </Modal>
    </>
  );
};
