import React, { useState } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { 
  TextInput, PasswordInput, Checkbox, 
  FormError, FormSuccess 
} from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { 
  Shield, User, ShieldAlert, ArrowRight, 
  Mail, ClipboardList, ArrowLeft
} from 'lucide-react';
import { authService } from '../services/authService';
import './AuthPages.css';

// 1. Asymmetrical Split Layout Wrapper
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="auth-split-layout">
      {/* Left side: Premium Branding Composition */}
      <div className="auth-brand-side">
        <div className="glow-ambient auth-side-glow"></div>
        <div className="brand-side-content">
          <Link to="/" className="brand-side-logo">
            <div className="logo-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5"/>
              </svg>
            </div>
            <span className="logo-text">Medi<span className="logo-accent">Vault</span></span>
          </Link>

          <div className="brand-hero-text">
            <h2 className="brand-headline">
              Your health history,<br />
              <span className="text-gradient">wherever life takes you.</span>
            </h2>
            <p className="brand-subline">
              One secure place for the medical records you choose to keep and share. Protect your history with patient-custody cryptographic lockups.
            </p>
          </div>

          {/* Simple Visual Abstract Health ID Node mockup */}
          <div className="brand-side-preview animate-float">
            <Card className="brand-mini-id" padding="sm" glow>
              <div className="mini-id-header">
                <Shield size={14} className="text-mint" />
                <span className="title">Secure Ledger System</span>
                <Badge variant="mint">Active</Badge>
              </div>
              <div className="mini-id-body">
                <div className="pulse-circle"></div>
                <span className="hash-text">Index: AES-256 encrypted</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right side: Credentials Surface Container */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <Card className="auth-form-card" padding="lg">
            <h1 className="auth-form-title">{title}</h1>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};

// 2. Component Screen: Role Selection
export const SelectRolePage: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    // Set temporary role parameter in sessionStorage to preserve across signup transition
    sessionStorage.setItem('mv_registering_role', selectedRole);
    navigate('/auth/sign-up');
  };

  return (
    <AuthLayout title="How will you use MediVault?">
      <p className="auth-sub-desc">Choose the role that best describes how you'll use the platform.</p>
      
      <div className="role-grid">
        {/* Patient Card */}
        <div 
          className={`role-select-card ${selectedRole === 'patient' ? 'active' : ''}`}
          onClick={() => setSelectedRole('patient')}
        >
          <div className="role-card-header">
            <div className="role-icon-box bg-lav">
              <User size={20} />
            </div>
            <span className="role-card-name">I'm a Patient</span>
          </div>
          <p className="role-card-desc">
            Create your personal Health Vault, organize your medical records, and control how your information is shared.
          </p>
        </div>

        {/* Doctor Card */}
        <div 
          className={`role-select-card ${selectedRole === 'doctor' ? 'active' : ''}`}
          onClick={() => setSelectedRole('doctor')}
        >
          <div className="role-card-header">
            <div className="role-icon-box bg-mnt">
              <ClipboardList size={20} />
            </div>
            <span className="role-card-name">I'm a Doctor</span>
          </div>
          <p className="role-card-desc">
            Request patient-approved access to shared medical records and review available medical history.
          </p>
        </div>
      </div>

      {selectedRole === 'doctor' && (
        <div className="role-warning-callout animate-fade-in">
          <ShieldAlert size={14} className="text-warning" />
          <span>Professional license verification may be required before accessing patient-shared records.</span>
        </div>
      )}

      <div className="role-actions">
        <Button
          variant="primary"
          size="md"
          className="role-continue-btn"
          disabled={!selectedRole}
          onClick={handleContinue}
          icon={<ArrowRight size={16} />}
          iconPosition="right"
        >
          Continue
        </Button>
        <div className="role-footer-links">
          <span>Already have an account? <Link to="/auth/sign-in" className="inline-link">Sign In</Link></span>
        </div>
      </div>
    </AuthLayout>
  );
};

// 3. Component Screen: Sign Up Form
export const SignUpPage: React.FC = () => {
  const { signUp, navigate } = useRouter();
  
  // Initialize state directly from sessionStorage if possible
  const [role] = useState<'patient' | 'doctor'>(() => {
    const saved = sessionStorage.getItem('mv_registering_role');
    return (saved === 'patient' || saved === 'doctor') ? saved : 'patient';
  });
  
  // States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation flags
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Verify role is set, else redirect
  React.useEffect(() => {
    const savedRole = sessionStorage.getItem('mv_registering_role');
    if (savedRole !== 'patient' && savedRole !== 'doctor') {
      setTimeout(() => navigate('/auth/select-role'), 0);
    }
  }, [navigate]);

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getFormErrors = () => {
    const errors: Record<string, string> = {};
    
    if (touchedFields.name && !name.trim()) {
      errors.name = 'Full Name is required.';
    }
    
    if (touchedFields.email) {
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Please enter a valid email address.';
      }
    }
    
    if (touchedFields.password) {
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long.';
      }
    }
    
    if (touchedFields.confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const errors = getFormErrors();
  const isFormValid = 
    name.trim() !== '' && 
    email.trim() !== '' && 
    /\S+@\S+\.\S+/.test(email) && 
    password.length >= 8 && 
    password === confirmPassword && 
    agreeTerms &&
    Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await signUp(email, password, name, role);
    } catch (err) {
      console.error(`[SignUpPage.handleSubmit] Registration error:`, err);
      const message = err instanceof Error ? err.message : 'An error occurred during registration.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = () => {
    sessionStorage.removeItem('mv_registering_role');
    navigate('/auth/select-role');
  };

  return (
    <AuthLayout title="Create Your Health Vault">
      <div className="role-display-box">
        <span className="role-display-label">Creating account as:</span>
        <div className="role-display-value">
          <Badge variant={role === 'patient' ? 'lavender' : 'mint'}>
            {role.toUpperCase()}
          </Badge>
          <button type="button" className="role-change-btn" onClick={handleChangeRole}>
            Change role
          </button>
        </div>
      </div>

      <form className="auth-form-element" onSubmit={handleSubmit}>
        <FormError message={errorMsg} />

        <TextInput
          label="Full Name"
          placeholder="Ellen Ross"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleFieldBlur('name')}
          error={errors.name}
          required
          disabled={loading}
        />

        <TextInput
          label="Email Address"
          placeholder="ellen.ross@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          error={errors.email}
          required
          disabled={loading}
          icon={<Mail size={14} />}
        />

        <PasswordInput
          label="Password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleFieldBlur('password')}
          error={errors.password}
          required
          showStrengthFeedback={password.length > 0}
          disabled={loading}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleFieldBlur('confirmPassword')}
          error={errors.confirmPassword}
          required
          disabled={loading}
        />

        <Checkbox
          label={
            <span>
              I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="inline-link">Terms of Service</a> and acknowledge the <a href="#" onClick={(e) => e.preventDefault()} className="inline-link">Privacy Protocol</a>.
            </span>
          }
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          disabled={!isFormValid || loading}
          className="form-submit-btn"
        >
          Create Account
        </Button>

        <div className="auth-form-footer">
          <span>Already have an account? <Link to="/auth/sign-in" className="inline-link">Sign In</Link></span>
        </div>
      </form>
    </AuthLayout>
  );
};

// 4. Component Screen: Sign In Form
export const SignInPage: React.FC = () => {
  const { signIn } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getFormErrors = () => {
    const errors: Record<string, string> = {};
    if (touchedFields.email && !email.trim()) {
      errors.email = 'Email address is required.';
    }
    if (touchedFields.password && !password) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const errors = getFormErrors();
  const isFormValid = email.trim() !== '' && password !== '' && Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await signIn(email, password);
    } catch (err) {
      console.error(`[SignInPage.handleSubmit] Authentication error:`, err);
      const message = err instanceof Error ? err.message : 'An error occurred during authentication.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to MediVault">
      <p className="auth-sub-desc">Unlock your patient-controlled digital Health Vault.</p>
      
      <form className="auth-form-element" onSubmit={handleSubmit}>
        <FormError message={errorMsg} />

        <TextInput
          label="Email Address"
          placeholder="ellen.ross@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          error={errors.email}
          required
          disabled={loading}
          icon={<Mail size={14} />}
        />

        <div className="password-group-header">
          <Link to="/auth/forgot-password" className="forgot-pass-link">
            Forgot password?
          </Link>
        </div>
        
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleFieldBlur('password')}
          error={errors.password}
          required
          disabled={loading}
        />

        <Checkbox
          label="Remember my digital identity on this browser"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={loading}
          disabled={!isFormValid || loading}
          className="form-submit-btn"
        >
          Sign In
        </Button>

        <div className="auth-form-footer">
          <span>New to MediVault? <Link to="/auth/select-role" className="inline-link">Create Your Health Vault</Link></span>
        </div>
      </form>
    </AuthLayout>
  );
};

// 5. Component Screen: Forgot Password Form
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const getFormErrors = () => {
    const errors: Record<string, string> = {};
    if (touchedFields.email) {
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Please enter a valid email address.';
      }
    }
    return errors;
  };

  const errors = getFormErrors();
  const isFormValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email) && Object.keys(errors).length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await authService.requestPasswordReset(email);
      setSuccessMsg(
        'Check your inbox. [Prototype Verification Only] If an account with this email exists, password recovery parameters were logged inside your browser terminal.'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during recovery.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password">
      <div className="forgot-back-nav">
        <Link to="/auth/sign-in" className="back-link">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {successMsg ? (
        <div className="forgot-success-state">
          <FormSuccess message={successMsg} />
          <p className="success-subline">
            In the production release, an encrypted link will be routed to reset your private ledger key pairs.
          </p>
          <Button variant="secondary" size="md" className="success-return-btn" as="a" href="/auth/sign-in">
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form className="auth-form-element" onSubmit={handleSubmit}>
          <p className="auth-sub-desc">Enter the email associated with your MediVault account.</p>
          <FormError message={errorMsg} />

          <TextInput
            label="Email Address"
            placeholder="ellen.ross@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            error={errors.email}
            required
            disabled={loading}
            icon={<Mail size={14} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            disabled={!isFormValid || loading}
            className="form-submit-btn"
          >
            Send Reset Instructions
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
