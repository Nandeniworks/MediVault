/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Menu, Bell, Shield, Info, Check, AlertCircle } from 'lucide-react';
import { PatientSidebar } from './PatientSidebar';
import type { UserProfile } from '../../services/authService';
import { accessRequestService } from '../../services/accessRequestService';

interface LayoutProps {
  user: UserProfile | null;
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onSignOut: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  children: React.ReactNode;
}

export const PatientWorkspaceLayout: React.FC<LayoutProps> = ({
  user,
  currentTab,
  onTabChange,
  onSignOut,
  isDemoMode,
  onToggleDemoMode,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);
  const patientEmail = user?.email || '';

  useEffect(() => {
    const checkAlerts = () => {
      const all = accessRequestService.getRequestsForPatient(patientEmail);
      setEmergencyAlerts(all.filter(r => r.status === 'pending' && r.isEmergency));
    };
    checkAlerts();
    const iv = setInterval(checkAlerts, 3000);
    return () => clearInterval(iv);
  }, [patientEmail]);

  // Dynamic Time-of-Day Greeting
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const patientName = isDemoMode ? 'Aarav' : (user?.name?.split(' ')[0] || 'Patient');

  return (
    <div className="patient-workspace-layout">
      {/* Background Ambient Glows */}
      <div className="glow-ambient ws-glow-1"></div>
      <div className="glow-ambient ws-glow-2"></div>
      
      {/* Left Sidebar - Persistent on Desktop, hidden on Mobile */}
      <div className="sidebar-desktop-wrapper">
        <PatientSidebar 
          currentTab={currentTab}
          onTabChange={onTabChange}
          onSignOut={onSignOut}
        />
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="sidebar-mobile-drawer animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <PatientSidebar 
              currentTab={currentTab}
              onTabChange={onTabChange}
              onSignOut={onSignOut}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Right Column: Top Bar + Main Content Area */}
      <div className="workspace-main-wrapper">
        
        {/* Top Context Bar */}
        <header className="workspace-top-bar">
          <div className="top-bar-left">
            {/* Hamburger menu button for Mobile/Tablet */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Title Greeting */}
            <div className="greeting-container">
              <h1 className="greeting-title">
                {greeting}, <span className="text-gradient">{patientName}</span>
              </h1>
              <p className="greeting-subtitle">
                Your health history is organized and ready when you need it.
              </p>
            </div>
          </div>

          <div className="top-bar-right">
            
            {/* Demo / Sandbox Switch */}
            <div className="demo-toggle-pill">
              <button 
                onClick={() => onToggleDemoMode(false)}
                className={`demo-pill-btn ${!isDemoMode ? 'active' : ''}`}
                title="View empty state with your actual account data"
              >
                {!isDemoMode && <Check size={12} style={{ marginRight: '4px' }} />}
                Real Vault
              </button>
              <button 
                onClick={() => onToggleDemoMode(true)}
                className={`demo-pill-btn ${isDemoMode ? 'active' : ''}`}
                title="View populated workspace with mock demonstration data"
              >
                {isDemoMode && <Check size={12} style={{ marginRight: '4px' }} />}
                Demo Preview
              </button>
            </div>

            {/* Notification Center */}
            <div className="notification-center-wrapper">
              <button 
                className={`icon-circle-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
              >
                <Bell size={18} />
                <span className="notification-badge"></span>
              </button>

              {showNotifications && (
                <>
                  <div className="dropdown-overlay" onClick={() => setShowNotifications(false)}></div>
                  <div className="notification-dropdown animate-fade-in">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <span className="clear-btn">Mark read</span>
                    </div>
                    <div className="dropdown-content">
                      {isDemoMode ? (
                        <div className="notification-item unread">
                          <div className="item-icon-wrapper cardiology">
                            <Shield size={14} />
                          </div>
                          <div className="item-details">
                            <p className="item-text">
                              <strong>Dr. Ananya Sharma</strong> requested access permission for your records.
                            </p>
                            <span className="item-time">10 minutes ago</span>
                          </div>
                        </div>
                      ) : (
                        <div className="notification-empty-state">
                          <AlertCircle size={28} className="text-muted" />
                          <p>No new notifications</p>
                          <span>Updates on access requests or security logs will appear here.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar / Quick Context */}
            <div className="top-profile-badge" onClick={() => onTabChange('profile')}>
              <div className="avatar-circle">
                {patientName.charAt(0)}
              </div>
              <div className="profile-text-info">
                <span className="profile-name">{patientName}</span>
                <span className="profile-role">Patient</span>
              </div>
            </div>

          </div>
        </header>

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="demo-notice-banner animate-fade-in">
            <Info size={14} style={{ color: 'var(--accent-lavender)', flexShrink: 0 }} />
            <span>
              <strong>Demo Preview Active:</strong> Displaying fictional health files for <strong>Aarav Sharma</strong>. Toggle <strong>&ldquo;Real Vault&rdquo;</strong> to inspect your personal empty vault state.
            </span>
          </div>
        )}

        {/* Main Scrollable Content Pane */}
        <main className="workspace-content-pane">
          {emergencyAlerts.map(alert => (
            <div key={alert.id} className="emergency-alert-banner" style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.18) 0%, rgba(244,63,94,0.06) 100%)',
              border: '1.5px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 0 15px rgba(244,63,94,0.25)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(244,63,94,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-danger)',
                  boxShadow: '0 0 8px rgba(244,63,94,0.3)',
                  flexShrink: 0
                }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.98rem', letterSpacing: '0.5px' }}>⚠️ CRITICAL ACCESS ALERT</h4>
                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Dr. <strong>{alert.doctorName}</strong> at <strong>{alert.hospital}</strong> has initiated a high-priority emergency consent request. Action is required immediately.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onTabChange('consent')}
                style={{ 
                  background: 'var(--color-danger)', 
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 1rem',
                  boxShadow: '0 0 8px rgba(244,63,94,0.4)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  flexShrink: 0 
                }}
              >
                Review Consent
              </button>
            </div>
          ))}
          {children}
        </main>

      </div>
    </div>
  );
};
