import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { Activity, Menu, Bell, Search, User } from 'lucide-react';
import { DoctorSidebar } from '../components/doctor/DoctorSidebar';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import {
  DoctorPatientSearch,
  DoctorAccessRequests,
  DoctorPatientTimeline,
  DoctorMedicalRecords,
  DoctorAIInsights,
  DoctorNotificationsView,
  DoctorProfileView,
  DoctorSettingsView
} from '../components/doctor/DoctorPlaceholderViews';
import { PatientVault } from '../components/patient/PatientVault';
import { RecordDetailView } from '../components/patient/RecordDetailView';
import { PatientWorkspaceLayout } from '../components/patient/PatientWorkspaceLayout';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import {
  PatientAccessRequests,
  PatientActivityLog,
  SharedAccessPlaceholder,
  SettingsPlaceholder
} from '../components/patient/PlaceholderViews';
import { TestHistoryView } from '../components/patient/TestHistoryView';
import { MedicationDashboard } from '../components/patient/MedicationDashboard';
import { AllergyDashboard } from '../components/patient/AllergyDashboard';
import { PersonalProfile } from '../components/patient/PersonalProfile';
import { PatientAnalyticsView } from '../components/patient/PatientAnalyticsView';
import { PatientJourneyTimeline } from '../components/patient/PatientJourneyTimeline';
import { MedicalPassport } from '../components/patient/MedicalPassport';
import './WorkspacePages.css';
import './PatientWorkspace.css';

export const PatientWorkspace: React.FC = () => {
  const { user, signOut, path, navigate } = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Derive active sidebar tab based on active subpath URL
  const getCurrentTab = () => {
    if (path === '/patient') return 'overview';
    if (path.startsWith('/patient/vault')) return 'vault';
    if (path === '/patient/timeline') return 'timeline';
    if (path === '/patient/analytics') return 'analytics';
    if (path === '/patient/tests') return 'tests';
    if (path === '/patient/meds') return 'meds';
    if (path === '/patient/allergies') return 'allergies';
    if (path === '/patient/requests') return 'requests';
    if (path === '/patient/shared') return 'shared';
    if (path === '/patient/activity') return 'activity';
    if (path === '/patient/passport') return 'passport';
    if (path === '/patient/profile') return 'profile';
    if (path === '/patient/settings') return 'settings';
    return 'overview';
  };

  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case 'overview': navigate('/patient'); break;
      case 'vault': navigate('/patient/vault'); break;
      case 'timeline': navigate('/patient/timeline'); break;
      case 'analytics': navigate('/patient/analytics'); break;
      case 'tests': navigate('/patient/tests'); break;
      case 'meds': navigate('/patient/meds'); break;
      case 'allergies': navigate('/patient/allergies'); break;
      case 'requests': navigate('/patient/requests'); break;
      case 'passport': navigate('/patient/passport'); break;
      case 'shared': navigate('/patient/shared'); break;
      case 'activity': navigate('/patient/activity'); break;
      case 'profile': navigate('/patient/profile'); break;
      case 'settings': navigate('/patient/settings'); break;
      default: navigate('/patient'); break;
    }
  };

  const currentTab = getCurrentTab();

  const renderTabContent = () => {
    // 1. Match specific record detail sub-routes first
    if (path.startsWith('/patient/vault/')) {
      const recordId = path.split('/patient/vault/')[1]?.split('?')[0];
      if (recordId) {
        return <RecordDetailView recordId={recordId} isDemoMode={isDemoMode} />;
      }
    }

    // 2. Match standard route tabs
    switch (currentTab) {
      case 'overview':
        return <PatientDashboard user={user} isDemoMode={isDemoMode} />;
      case 'vault':
        return <PatientVault isDemoMode={isDemoMode} onToggleDemoMode={setIsDemoMode} />;
      case 'passport':
        return <MedicalPassport />;
      case 'timeline':
        return <PatientJourneyTimeline />;
      case 'analytics':
        return <PatientAnalyticsView />;
      case 'tests':
        return <TestHistoryView />;
      case 'meds':
        return <MedicationDashboard />;
      case 'allergies':
        return <AllergyDashboard />;
      case 'requests':
        return <PatientAccessRequests patientEmail={user?.email || ''} />;
      case 'shared':
        return <SharedAccessPlaceholder />;
      case 'activity':
        return <PatientActivityLog patientEmail={user?.email || ''} />;
      case 'profile':
        return <PersonalProfile />;
      case 'settings':
        return <SettingsPlaceholder />;
      default:
        return <PatientDashboard user={user} isDemoMode={isDemoMode} />;
    }
  };

  return (
    <PatientWorkspaceLayout
      user={user}
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onSignOut={signOut}
      isDemoMode={isDemoMode}
      onToggleDemoMode={setIsDemoMode}
    >
      {renderTabContent()}
    </PatientWorkspaceLayout>
  );
};


export const DoctorWorkspace: React.FC = () => {
  const { user, signOut } = useRouter();
  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Extract specialization from onboarding mock
  const onboarding = user?.onboardingData || {};
  const specialization = (onboarding.specialization as string) || 'Neurologist';
  const hospital = (onboarding.hospital as string) || 'CityCare Hospital';

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <DoctorDashboard />;
      case 'search':
        return <DoctorPatientSearch />;
      case 'requests':
        return <DoctorAccessRequests />;
      case 'timeline':
        return <DoctorPatientTimeline />;
      case 'records':
        return <DoctorMedicalRecords />;
      case 'insights':
        return <DoctorAIInsights />;
      case 'notifications':
        return <DoctorNotificationsView />;
      case 'profile':
        return <DoctorProfileView user={user} signOut={signOut} />;
      case 'settings':
        return <DoctorSettingsView />;
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="patient-workspace-layout doctor-workspace-layout">
      {/* Sidebar Desktop Wrapper */}
      <div className="sidebar-desktop-wrapper">
        <DoctorSidebar 
          currentTab={currentTab} 
          onTabChange={handleTabChange} 
          onSignOut={signOut} 
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="sidebar-mobile-drawer animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <DoctorSidebar 
              currentTab={currentTab} 
              onTabChange={handleTabChange} 
              onSignOut={signOut} 
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="workspace-main-wrapper">
        {/* Top Navbar */}
        <header className="workspace-top-bar doctor-top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="greeting-container">
              <h1 className="greeting-title">
                Good Morning, <span className="text-gradient">Dr. {user?.name || 'Roseanne Park'}</span>
              </h1>
              <p className="greeting-subtitle">
                {specialization} &bull; {hospital}
              </p>
            </div>
          </div>

          <div className="top-bar-right">
            {/* Search Trigger Icon */}
            <button className="icon-circle-btn" onClick={() => handleTabChange('search')} aria-label="Search patients">
              <Search size={18} />
            </button>

            {/* Notification Bell */}
            <div className="notification-center-wrapper">
              <button 
                className={`icon-circle-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="notification-badge"></span>
              </button>
              {showNotifications && (
                <>
                  <div className="dropdown-overlay" onClick={() => setShowNotifications(false)}></div>
                  <div className="notification-dropdown doctor-notif-dropdown animate-fade-in">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <span className="clear-btn">Mark read</span>
                    </div>
                    <div className="dropdown-content">
                      <div className="notification-item unread">
                        <div className="item-icon-wrapper cardiology">
                          <Activity size={14} />
                        </div>
                        <div className="item-details">
                          <p className="item-text">
                            <strong>Nandeni Tiwari</strong> submitted a follow-up consultation request.
                          </p>
                          <span className="item-time">2 minutes ago</span>
                        </div>
                      </div>
                      <div className="notification-item unread">
                        <div className="item-icon-wrapper info">
                          <User size={14} />
                        </div>
                        <div className="item-details">
                          <p className="item-text">
                            <strong>Aarav Sharma</strong> approved your records access request.
                          </p>
                          <span className="item-time">1 hour ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Verified Badge */}
            <div className="verified-badge-group">
              <span className="verified-dot-indicator green"></span>
              <span className="verified-label-text">Verified</span>
            </div>

            {/* Doctor Avatar */}
            <div className="top-profile-badge" onClick={() => handleTabChange('profile')}>
              <div className="avatar-circle doctor-avatar-circle">
                {(user?.name || 'R').charAt(0)}
              </div>
              <div className="profile-text-info">
                <span className="profile-name">Dr. {user?.name?.split(' ')[0] || 'Roseanne'}</span>
                <span className="profile-role">Physician</span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="workspace-content-pane">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};
