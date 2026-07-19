import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  FolderHeart, Activity, ShieldCheck, Settings, 
  HelpCircle, Search, Bell, Clock, FileSpreadsheet, Lock
} from 'lucide-react';
import './DashboardPreview.css';

export const DashboardPreview: React.FC = () => {
  return (
    <section className="preview-section-wrapper" id="dashboard-preview">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <Badge variant="mint">Platform Preview</Badge>
          <h2 className="section-title">Your Health Vault Dashboard</h2>
          <p className="section-desc">
            A secure digital control center. Keep a running ledger of verify-locked clinical archives and set instant keys.
          </p>
        </div>

        {/* High-fidelity Mock Dashboard Container */}
        <Card className="mock-dashboard-outer" padding="none" glow>
          
          {/* Dashboard Shell Grid */}
          <div className="dashboard-grid">
            
            {/* Sidebar Left */}
            <aside className="dashboard-sidebar">
              <div className="sidebar-brand">
                <div className="logo-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5"/>
                  </svg>
                </div>
                <span className="logo-text">Medi<span className="logo-accent">Vault</span></span>
              </div>

              <nav className="sidebar-nav">
                <a href="#" className="sidebar-link active" onClick={(e) => e.preventDefault()}>
                  <FolderHeart size={16} />
                  <span>Health Vault</span>
                </a>
                <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
                  <Activity size={16} />
                  <span>Clinical Records</span>
                </a>
                <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
                  <Clock size={16} />
                  <span>Access History</span>
                </a>
                <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
                  <ShieldCheck size={16} />
                  <span>Security & Keys</span>
                </a>
              </nav>

              <div className="sidebar-footer">
                <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
                <a href="#" className="sidebar-link" onClick={(e) => e.preventDefault()}>
                  <HelpCircle size={16} />
                  <span>Support</span>
                </a>
              </div>
            </aside>

            {/* Main Workspace Right */}
            <div className="dashboard-workspace">
              
              {/* Header inside Workspace */}
              <div className="workspace-header">
                <div>
                  <h3 className="workspace-greeting">Welcome, Ellen</h3>
                  <p className="workspace-sub">Here is your digital health history overview</p>
                </div>
                
                <div className="workspace-header-actions">
                  <div className="search-bar-mock">
                    <Search size={14} className="search-icon-mock" />
                    <input type="text" placeholder="Search medical records..." disabled />
                  </div>
                  <button className="icon-btn-mock" aria-label="Notifications" type="button">
                    <Bell size={16} />
                    <span className="bell-badge-mock"></span>
                  </button>
                  <div className="user-profile-mock">
                    <div className="avatar-mock">ER</div>
                    <div className="user-details-mock">
                      <span className="profile-name">Ellen Ross</span>
                      <span className="profile-dob">DOB: 07 Dec 1972</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Content Panels Grid */}
              <div className="workspace-panels">
                
                {/* Panel 1: Health Stats Row */}
                <div className="panel-row-stats">
                  
                  <Card className="stat-card" padding="sm">
                    <span className="stat-label">Total Records Verified</span>
                    <div className="stat-num-row">
                      <span className="stat-value">34</span>
                      <Badge variant="mint">+2 new</Badge>
                    </div>
                    <span className="stat-footer-text">Quest Labs, Ashby Med, 2 others</span>
                  </Card>

                  <Card className="stat-card" padding="sm">
                    <span className="stat-label">Authorizations Active</span>
                    <div className="stat-num-row">
                      <span className="stat-value">2</span>
                      <Badge variant="success">Secured</Badge>
                    </div>
                    <span className="stat-footer-text">Dr. Emily Parker, City Gen Lab</span>
                  </Card>

                  <Card className="stat-card" padding="sm">
                    <span className="stat-label">Encrypted Size</span>
                    <div className="stat-num-row">
                      <span className="stat-value">12.8 MB</span>
                    </div>
                    <span className="stat-footer-text">On-device backup verified</span>
                  </Card>

                </div>

                {/* Panel 2: Two-column Main Workspace */}
                <div className="panel-grid-main">
                  
                  {/* Left Column: Recent Records Feed */}
                  <div className="dashboard-col-left">
                    <div className="panel-header-row">
                      <h4 className="panel-col-title">Recent Clinical Records</h4>
                      <button className="panel-header-link" type="button">See all</button>
                    </div>

                    <div className="records-feed">
                      
                      <div className="record-feed-item">
                        <div className="feed-icon-wrap bg-mint">
                          <Activity size={16} />
                        </div>
                        <div className="feed-info">
                          <span className="feed-title">Quest Diagnostics - Lipid Panel</span>
                          <span className="feed-meta">Clinical Report &bull; Verified Dec 02, 2026</span>
                        </div>
                        <Badge variant="mint">Lab</Badge>
                      </div>

                      <div className="record-feed-item">
                        <div className="feed-icon-wrap bg-violet">
                          <FileSpreadsheet size={16} />
                        </div>
                        <div className="feed-info">
                          <span className="feed-title">Ashby Medical - Heart Rate Analysis</span>
                          <span className="feed-meta">ECG &bull; Verified Nov 24, 2026</span>
                        </div>
                        <Badge variant="violet">Consult</Badge>
                      </div>

                      <div className="record-feed-item">
                        <div className="feed-icon-wrap bg-info">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="feed-info">
                          <span className="feed-title">City General - Immunization Record</span>
                          <span className="feed-meta">Influenza Vaccine &bull; Verified Nov 10, 2026</span>
                        </div>
                        <Badge variant="info">Vaccine</Badge>
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Pending Authorizations & Access Details */}
                  <div className="dashboard-col-right">
                    
                    {/* Access Request Alert Card */}
                    <Card className="dashboard-action-card" padding="sm" glow>
                      <div className="action-card-header">
                        <div className="action-icon-wrap">
                          <Lock size={16} className="text-warning animate-float" />
                        </div>
                        <div>
                          <span className="action-tag">Pending Authorization</span>
                          <h4 className="action-title-text">Dr. Emily Parker</h4>
                        </div>
                      </div>
                      <p className="action-desc-text">
                        Cardiology Center is requesting read access to Cardiology consultations logs from 2026.
                      </p>
                      <div className="action-card-footer">
                        <span className="action-time-limit">Expires in 2 hours</span>
                        <Button variant="mint" size="sm" className="action-button-mock">Review & Authorize</Button>
                      </div>
                    </Card>

                    {/* Timeline Tracker Fragment */}
                    <Card className="dashboard-timeline-small" padding="sm">
                      <span className="timeline-header-label">Recent Care Events</span>
                      <div className="timeline-items-small">
                        <div className="timeline-item-small">
                          <span className="item-date">02 Dec 2026</span>
                          <span className="item-details">Lipid blood panel added</span>
                        </div>
                        <div className="timeline-item-small">
                          <span className="item-date">24 Nov 2026</span>
                          <span className="item-details">Cardiology consultation at Ashby</span>
                        </div>
                      </div>
                    </Card>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </Card>

      </div>
    </section>
  );
};
