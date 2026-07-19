import React, { useState, useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';
import './FormElements.css';

// 1. Standard Text Input
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-label">{label}</label>
      <div className="input-relative">
        {icon && <span className="input-icon-prefix">{icon}</span>}
        <input
          id={inputId}
          type={type}
          className={`form-input ${icon ? 'with-prefix' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
};

// 2. Select Dropdown Input
interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  icon?: ReactNode;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  error,
  options,
  icon,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-label">{label}</label>
      <div className="input-relative">
        {icon && <span className="input-icon-prefix">{icon}</span>}
        <select
          id={inputId}
          className={`form-select ${icon ? 'with-prefix' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
};

// 3. Checkbox Component
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`form-checkbox-group ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={inputId} className="checkbox-label-container">
        <input
          type="checkbox"
          id={inputId}
          className="checkbox-hidden"
          {...props}
        />
        <span className="checkbox-custom-box"></span>
        <span className="checkbox-label-text">{label}</span>
      </label>
      {error && <span className="form-error-text checkbox-err">{error}</span>}
    </div>
  );
};

// 4. Live Password Strength Indicator
interface PasswordStrengthProps {
  passwordVal: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ passwordVal }) => {
  if (!passwordVal) return null;

  const getStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getStrength(passwordVal);
  
  let labelText = 'Very Weak';
  let strengthClass = 'strength-weak';
  if (score >= 4) {
    labelText = 'Strong';
    strengthClass = 'strength-strong';
  } else if (score >= 3) {
    labelText = 'Medium';
    strengthClass = 'strength-medium';
  }

  return (
    <div className="password-strength-container animate-fade-in">
      <div className="strength-bars">
        <div className={`strength-bar ${score >= 1 ? strengthClass : ''}`}></div>
        <div className={`strength-bar ${score >= 3 ? strengthClass : ''}`}></div>
        <div className={`strength-bar ${score >= 4 ? strengthClass : ''}`}></div>
      </div>
      <span className={`strength-label ${strengthClass}`}>{labelText}</span>
    </div>
  );
};

// 5. Password Input with Show/Hide visibility controls
interface PasswordInputProps extends Omit<TextInputProps, 'type' | 'icon'> {
  showStrengthFeedback?: boolean;
  value: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  showStrengthFeedback = false,
  value,
  className = '',
  id,
  ...props
}) => {
  const [showPass, setShowPass] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-label">{label}</label>
      <div className="input-relative">
        <input
          id={inputId}
          type={showPass ? 'text' : 'password'}
          className="form-input with-suffix"
          value={value}
          {...props}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPass(!showPass)}
          aria-label={showPass ? 'Hide password' : 'Show password'}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="form-error-text">{error}</span>}
      {showStrengthFeedback && <PasswordStrength passwordVal={value} />}
    </div>
  );
};

// 6. Form Alert Cards
export const FormError: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="form-alert-card alert-error animate-fade-in">
      <ShieldAlert size={16} className="alert-icon" />
      <span className="alert-message">{message}</span>
    </div>
  );
};

export const FormSuccess: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="form-alert-card alert-success animate-fade-in">
      <CheckCircle size={16} className="alert-icon" />
      <span className="alert-message">{message}</span>
    </div>
  );
};
