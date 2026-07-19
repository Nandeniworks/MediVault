import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  as?: 'button' | 'a';
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  as = 'button',
  href,
  ...props
}) => {
  const classNames = `btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`;
  const isButtonDisabled = disabled || isLoading;

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        className={classNames}
        role="button"
        style={isButtonDisabled ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
        {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {isLoading && <span className="btn-spinner"></span>}
        {!isLoading && icon && iconPosition === 'left' && <span className="btn-icon btn-icon-left">{icon}</span>}
        <span className="btn-content">{children}</span>
        {!isLoading && icon && iconPosition === 'right' && <span className="btn-icon btn-icon-right">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      className={classNames}
      disabled={isButtonDisabled}
      {...props}
    >
      {isLoading && <span className="btn-spinner"></span>}
      {!isLoading && icon && iconPosition === 'left' && <span className="btn-icon btn-icon-left">{icon}</span>}
      <span className="btn-content">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="btn-icon btn-icon-right">{icon}</span>}
    </button>
  );
};
