import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import './AppShell.css';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      
      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );
};
