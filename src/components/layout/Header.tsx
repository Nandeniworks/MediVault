import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '../common/Button';
import { useRouter } from '../../context/RouterContext';
import './Header.css';

export const Header: React.FC = () => {
  const { navigate, user } = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMobileMenu();
    navigate('/');
  };

  const handleSignIn = () => {
    closeMobileMenu();
    navigate('/auth/sign-in');
  };

  const handleCreateVault = () => {
    closeMobileMenu();
    navigate('/auth/select-role');
  };

  const handleWorkspaceRedirect = () => {
    closeMobileMenu();
    if (user) {
      navigate(user.role === 'patient' ? '/patient' : '/doctor');
    }
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container header-container">
        {/* Logo */}
        <a href="/" className="header-logo" onClick={handleLogoClick}>
          <div className="logo-icon-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V16" stroke="var(--accent-mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16" stroke="var(--accent-mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">Medi<span className="logo-accent">Vault</span></span>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#security" className="nav-link">Security</a>
          <a href="#audiences" className="nav-link">For Patients</a>
          <a href="#audiences" className="nav-link">For Doctors</a>
        </nav>

        {/* CTAs */}
        <div className="header-ctas">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleWorkspaceRedirect}>
              Enter Workspace
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="btn-signin-desktop" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateVault}>
                Create Health Vault
              </Button>
            </>
          )}
          
          {/* Mobile menu toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay animate-fade-in">
          <nav className="mobile-nav-links">
            <a href="#how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>How It Works</a>
            <a href="#security" className="mobile-nav-link" onClick={closeMobileMenu}>Security</a>
            <a href="#audiences" className="mobile-nav-link" onClick={closeMobileMenu}>For Patients</a>
            <a href="#audiences" className="mobile-nav-link" onClick={closeMobileMenu}>For Doctors</a>
            <div className="mobile-nav-actions">
              {user ? (
                <Button variant="primary" size="md" className="mobile-cta-btn" onClick={handleWorkspaceRedirect}>
                  Enter Workspace
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="md" className="mobile-cta-btn" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button variant="primary" size="md" className="mobile-cta-btn" onClick={handleCreateVault}>
                    Create Health Vault
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
