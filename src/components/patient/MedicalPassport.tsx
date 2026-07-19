import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  ShieldCheck, AlertTriangle, Printer, Download,
  Heart, Phone, User
} from 'lucide-react';

export const MedicalPassport: React.FC = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Mock download helper
  const handleDownload = () => {
    const passportData = `
MEDICAL PASSPORT
================
Name: Aarav Sharma
ABHA ID: 91-4402-9811-2026
Blood Group: O+
Age: 33
Height: 178 cm
Weight: 74 kg
Emergency Contact: Priya Sharma (+91 98765 43210)
Primary Doctor: Dr. Sarah Jenkins
Insurance: Star Health Insurance (SHI-9921-2026)
Allergies: Penicillin (Severe), Peanuts (Moderate)
Active Meds: Iron Supplement, Lipitor
Conditions: Mild Anemia
    `;
    const blob = new Blob([passportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Medical_Passport_Aarav_Sharma.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="health-vault-container">
      {/* CSS Styles for Passport & Print & Animations */}
      <style>{`
        /* Glow animations */
        @keyframes emergencyPulse {
          0% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.8);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8), 0 0 50px rgba(239, 68, 68, 0.4);
            border-color: rgba(239, 68, 68, 1);
          }
          100% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.8);
          }
        }

        .emergency-active {
          animation: emergencyPulse 2s infinite ease-in-out !important;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(185, 28, 28, 0.15) 100%) !important;
          border-color: #ef4444 !important;
        }

        /* Passport security guilloche pattern overlay */
        .passport-pattern-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 0);
          background-size: 16px 16px;
          pointer-events: none;
          z-index: 1;
        }

        /* Print media styles */
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .health-vault-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            alignItems: center;
            justifyContent: center;
            background: none !important;
          }
          .passport-card-element {
            width: 85mm !important;
            height: 130mm !important;
            border: 2px solid #000 !important;
            border-radius: 12px !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .passport-card-element * {
            color: #000 !important;
            text-shadow: none !important;
          }
          .passport-header-title {
            color: #000 !important;
          }
          .passport-pattern-overlay {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="vault-header-row no-print">
        <div>
          <h2 className="vault-title-text text-gradient">Medical Passport</h2>
          <p className="vault-sub-text">Generate, print, or download your digital Apple Wallet-style emergency health credential card.</p>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setEmergencyMode(!emergencyMode)}
            className="btn-danger-hover"
            style={{ 
              borderColor: emergencyMode ? '#ef4444' : 'rgba(239, 68, 68, 0.4)',
              background: emergencyMode ? 'rgba(239, 68, 68, 0.15)' : 'none',
              color: emergencyMode ? '#ef4444' : 'var(--color-danger)',
              fontWeight: 700
            }}
            icon={<AlertTriangle size={16} />}
          >
            {emergencyMode ? 'Emergency Active' : 'Emergency Mode'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            icon={<Printer size={16} />}
          >
            Generate PDF
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            icon={<Download size={16} />}
          >
            Download Passport
          </Button>
        </div>
      </div>

      {/* Main card viewport wrap */}
      <div className="print-card-wrapper" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 0'
      }}>
        {/* Apple Wallet style card body */}
        <div 
          className={`passport-card-element ${emergencyMode ? 'emergency-active' : ''}`}
          style={{
            width: '420px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Guilloche style security security mesh overlay */}
          <div className="passport-pattern-overlay" />

          {/* Card Header (Apple Wallet style header logo & verification indicator) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} className={emergencyMode ? 'text-danger' : 'text-violet-400'} style={{ fill: emergencyMode ? '#ef4444' : 'none' }} />
              <span className="passport-header-title" style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
                {emergencyMode ? 'Emergency Medical Passport' : 'MediVault Health Pass'}
              </span>
            </div>
            <Badge variant={emergencyMode ? 'danger' : 'mint'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <ShieldCheck size={12} /> Verified
            </Badge>
          </div>

          {/* Biographical Identity Section (Left: Photo, Right: Core bio credentials) */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            {/* Avatar Photo */}
            <div style={{
              width: '90px',
              height: '110px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '2rem',
              fontWeight: 700,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}>
              AS
            </div>

            {/* Core credentials */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Aarav Sharma</h3>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ABHA Health ID</span>
                <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600, fontFamily: 'monospace' }}>
                  91-4402-9811-2026
                </code>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Blood Type</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: emergencyMode ? '#ef4444' : 'var(--accent-mint)' }}>O Positive (O+)</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Age</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>33 Years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biometrics Specs Card Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.015)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Height</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>178 cm</span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Weight</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>74 kg</span>
            </div>
          </div>

          {/* Clinical summary (Allergies, Medications, emergency details) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            {/* Emergency Contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Phone size={14} className="text-muted" />
              <span style={{ color: 'var(--text-secondary)' }}>Emergency Contact: <strong>Priya Sharma (+91 98765 43210)</strong></span>
            </div>

            {/* Primary Physician */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <User size={14} className="text-muted" />
              <span style={{ color: 'var(--text-secondary)' }}>Primary Doctor: <strong>Dr. Sarah Jenkins (MediLab)</strong></span>
            </div>

            {/* Insurance details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <ShieldCheck size={14} className="text-muted" />
              <span style={{ color: 'var(--text-secondary)' }}>Insurance: <strong>Star Health (SHI-9921-2026)</strong></span>
            </div>

            {/* Clinical Alerts Box */}
            <div style={{
              background: emergencyMode ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.01)',
              border: emergencyMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Known Allergies</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: emergencyMode ? '#ef4444' : '#fff' }}>
                  Penicillin (Severe), Peanuts (Moderate)
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Current Medicines</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
                  Iron Supplement (1 Tablet daily), Lipitor
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Medical Conditions</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
                  Mild Anemia
                </span>
              </div>
            </div>
          </div>

          {/* Card Footer (QR Verification Code, Latest reports badge, and legal scan text) */}
          <div style={{
            borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            <div>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Security Vault Pass</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Scan QR to review verified reports</span>
            </div>

            {/* Passport verification QR Code */}
            <div style={{
              background: '#fff',
              padding: '0.3rem',
              borderRadius: '6px',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              {/* Mock QR Code representation */}
              <svg width="48" height="48" viewBox="0 0 100 100">
                <rect x="0" y="0" width="30" height="30" fill="#000" />
                <rect x="5" y="5" width="20" height="20" fill="#fff" />
                <rect x="10" y="10" width="10" height="10" fill="#000" />

                <rect x="70" y="0" width="30" height="30" fill="#000" />
                <rect x="75" y="5" width="20" height="20" fill="#fff" />
                <rect x="80" y="10" width="10" height="10" fill="#000" />

                <rect x="0" y="70" width="30" height="30" fill="#000" />
                <rect x="5" y="75" width="20" height="20" fill="#fff" />
                <rect x="10" y="80" width="10" height="10" fill="#000" />

                <rect x="40" y="40" width="20" height="20" fill="#000" />
                <rect x="45" y="45" width="10" height="10" fill="#fff" />
                
                <rect x="40" y="10" width="10" height="20" fill="#000" />
                <rect x="10" y="40" width="20" height="10" fill="#000" />
                <rect x="70" y="45" width="20" height="15" fill="#000" />
                <rect x="45" y="70" width="15" height="20" fill="#000" />
                <rect x="80" y="80" width="10" height="10" fill="#000" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
