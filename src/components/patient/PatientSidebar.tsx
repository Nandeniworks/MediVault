import React from 'react';
import { 
  LayoutDashboard, FolderHeart, CalendarClock, FileHeart, 
  Pill, ShieldAlert, Key, Share2, History, User, Settings, LogOut, X, TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onSignOut: () => void;
  onCloseMobile?: () => void;
}

export const PatientSidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onSignOut,
  onCloseMobile
}) => {

  const primaryNav = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'passport', label: 'Medical Passport', icon: <User size={18} /> },
    { id: 'vault', label: 'Health Vault', icon: <FolderHeart size={18} /> },
    { id: 'timeline', label: 'Medical Timeline', icon: <CalendarClock size={18} /> },
    { id: 'analytics', label: 'Health Analytics', icon: <TrendingUp size={18} /> },
    { id: 'tests', label: 'Test History', icon: <FileHeart size={18} /> },
    { id: 'meds', label: 'Medications', icon: <Pill size={18} /> },
    { id: 'allergies', label: 'Allergies', icon: <ShieldAlert size={18} /> },
  ];

  const privacyNav = [
    { id: 'requests', label: 'Access Requests', icon: <Key size={18} /> },
    { id: 'shared', label: 'Shared Access', icon: <Share2 size={18} /> },
    { id: 'activity', label: 'Activity Log', icon: <History size={18} /> },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="patient-sidebar">
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" fill="var(--accent-violet)" stroke="var(--accent-lavender)" strokeWidth="2"/>
            <path d="M9 12H15M12 9V15" stroke="var(--bg-main)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="logo-text">Medi<span className="text-gradient">Vault</span></span>
        </div>
        
        {onCloseMobile && (
          <button className="mobile-close-btn" onClick={onCloseMobile} aria-label="Close menu">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Sidebar Nav Content */}
      <div className="sidebar-nav-sections">
        
        {/* Primary Navigation */}
        <div className="sidebar-nav-section">
          <span className="section-label">Medical Workspace</span>
          <nav className="section-links">
            {primaryNav.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Privacy Section */}
        <div className="sidebar-nav-section">
          <span className="section-label">Privacy & Security</span>
          <nav className="section-links">
            {privacyNav.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`nav-link ${currentTab === item.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

      </div>

      {/* Sidebar Bottom / Profile & System */}
      <div className="sidebar-footer">
        <nav className="footer-links">
          <button
            onClick={() => handleTabClick('profile')}
            className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`}
          >
            <span className="nav-icon"><User size={18} /></span>
            <span className="nav-label">Profile</span>
          </button>
          
          <button
            onClick={() => handleTabClick('settings')}
            className={`nav-link ${currentTab === 'settings' ? 'active' : ''}`}
          >
            <span className="nav-icon"><Settings size={18} /></span>
            <span className="nav-label">Settings</span>
          </button>

          <button
            onClick={onSignOut}
            className="nav-link nav-link-signout"
          >
            <span className="nav-icon text-danger"><LogOut size={18} /></span>
            <span className="nav-label">Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};
