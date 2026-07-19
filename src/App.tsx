import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { 
  SignInPage, SignUpPage, SelectRolePage, ForgotPasswordPage 
} from './pages/AuthPages';
import { PatientOnboarding } from './pages/PatientOnboarding';
import { DoctorOnboarding } from './pages/DoctorOnboarding';
import { PatientWorkspace, DoctorWorkspace } from './pages/WorkspacePages';
import { LoadingState } from './components/common/States';

const AppContent: React.FC = () => {
  const { path, loading, navigate } = useRouter();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#09080d' 
      }}>
        <LoadingState message="Loading secure vault context..." type="spinner" />
      </div>
    );
  }

  // Handle Hero CTA action on LandingPage
  const handleHeroCta = () => {
    navigate('/auth/select-role');
  };

  if (path.startsWith('/patient')) {
    return <PatientWorkspace />;
  }
  if (path.startsWith('/doctor')) {
    return <DoctorWorkspace />;
  }

  switch (path) {
    case '/':
      return (
        <AppShell>
          <LandingPage onCreateVaultClick={handleHeroCta} />
        </AppShell>
      );
    case '/auth/sign-in':
      return <SignInPage />;
    case '/auth/sign-up':
      return <SignUpPage />;
    case '/auth/select-role':
      return <SelectRolePage />;
    case '/auth/forgot-password':
      return <ForgotPasswordPage />;
    case '/onboarding/patient':
      return <PatientOnboarding />;
    case '/onboarding/doctor':
      return <DoctorOnboarding />;
    default:
      // Fallback
      return (
        <AppShell>
          <LandingPage onCreateVaultClick={handleHeroCta} />
        </AppShell>
      );
  }
};

function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;
