import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="#" className="footer-logo">
            <div className="logo-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16" stroke="var(--accent-mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="var(--accent-mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-text">Medi<span className="logo-accent">Vault</span></span>
          </a>
          <p className="footer-tagline">
            Your patient-controlled personal digital health vault.
          </p>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">Platform</h4>
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <a href="#security" className="footer-link">Security Structure</a>
            <a href="#" className="footer-link">Developer API</a>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Audiences</h4>
            <a href="#for-patients" className="footer-link">For Patients</a>
            <a href="#for-doctors" className="footer-link">For Healthcare Providers</a>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Security & Legal</h4>
            <a href="#" className="footer-link">Privacy Protocol</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Data Sovereignty</a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="disclaimer-card">
          <span className="disclaimer-badge">Disclaimer</span>
          <p className="disclaimer-text">
            MediVault is currently a prototype for secure medical information organization and patient-controlled sharing. It is not a substitute for professional medical advice, clinical diagnostics, treatment recommendations, or emergency medical services.
          </p>
        </div>
        <div className="footer-copyright">
          &copy; {currentYear} MediVault Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
