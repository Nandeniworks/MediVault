/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { UserProfile } from '../services/authService';

export interface RouterContextType {
  path: string;
  navigate: (targetPath: string) => void;
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'patient' | 'doctor') => Promise<void>;
  signOut: () => void;
  submitOnboarding: (data: Record<string, unknown>) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname);
  
  // Synchronously initialize user session state directly on mount to prevent cascade renders
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      return authService.getCurrentUser();
    } catch (e) {
      console.error('Failed to load user session', e);
      return null;
    }
  });
  
  // Loading is immediately resolved as context initializes state synchronously
  const [loading] = useState(false);

  // Listen to browser Back/Forward pops
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation utility
  const navigate = (targetPath: string) => {
    window.history.pushState(null, '', targetPath);
    setPath(targetPath);
  };

  // Auth: SignIn handler
  const signIn = async (email: string, password: string) => {
    const profile = await authService.signIn(email, password);
    setUser(profile);
  };

  // Auth: SignUp handler
  const signUp = async (email: string, password: string, name: string, role: 'patient' | 'doctor') => {
    const profile = await authService.signUp(email, password, name, role);
    setUser(profile);
  };

  // Auth: SignOut handler
  const signOut = () => {
    authService.signOut();
    setUser(null);
    navigate('/');
  };

  // Onboarding completion
  const submitOnboarding = (data: Record<string, unknown>) => {
    if (!user) return;
    const updated = authService.saveOnboardingData(user.email, data);
    setUser(updated);
  };

  // Unified Route Guards / Redirect Engine
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = path.startsWith('/auth');
    const isOnboardingRoute = path.startsWith('/onboarding');
    const isPatientWorkspace = path.startsWith('/patient');
    const isDoctorWorkspace = path.startsWith('/doctor');

    // 1. Unauthenticated users:
    if (!user) {
      if (isPatientWorkspace || isDoctorWorkspace || isOnboardingRoute) {
        setTimeout(() => navigate('/auth/sign-in'), 0);
      }
      return;
    }

    // 2. Authenticated users:
    // A. Role redirects
    if (user.role === 'patient') {
      if (isDoctorWorkspace || path === '/onboarding/doctor') {
        setTimeout(() => navigate(user.isOnboardingComplete ? '/patient' : '/onboarding/patient'), 0);
        return;
      }
    } else if (user.role === 'doctor') {
      if (isPatientWorkspace || path === '/onboarding/patient') {
        setTimeout(() => navigate(user.isOnboardingComplete ? '/doctor' : '/onboarding/doctor'), 0);
        return;
      }
    }

    // B. Onboarding incomplete locks
    if (!user.isOnboardingComplete) {
      const targetOnboarding = `/onboarding/${user.role}`;
      if (isPatientWorkspace || isDoctorWorkspace || isAuthRoute || (isOnboardingRoute && path !== targetOnboarding)) {
        setTimeout(() => navigate(targetOnboarding), 0);
      }
    } 
    // C. Onboarding complete redirects
    else {
      const workspace = user.role === 'patient' ? '/patient' : '/doctor';
      if (isAuthRoute || isOnboardingRoute) {
        setTimeout(() => navigate(workspace), 0);
      }
    }
  }, [path, user, loading]);

  const value: RouterContextType = {
    path,
    navigate,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    submitOnboarding,
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Simple link navigation override component
export const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({
  to,
  className = '',
  children,
}) => {
  const { navigate } = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
