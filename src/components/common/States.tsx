import React from 'react';
import type { ReactNode } from 'react';
import { Database, Loader2 } from 'lucide-react';
import './States.css';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Database size={40} />,
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-container">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  type = 'spinner',
}) => {
  if (type === 'skeleton') {
    return (
      <div className="skeleton-loading" aria-label="Loading content...">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-body-1"></div>
        <div className="skeleton-line skeleton-body-2"></div>
        <div className="skeleton-line skeleton-body-3"></div>
      </div>
    );
  }

  return (
    <div className="loading-state">
      <Loader2 className="loading-spinner" size={32} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};
