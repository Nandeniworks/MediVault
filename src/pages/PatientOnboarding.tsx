import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { TextInput, SelectInput } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { OnboardingProgress } from '../components/common/OnboardingProgress';
import { ShieldCheck, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import './PatientOnboarding.css';

export const PatientOnboarding: React.FC = () => {
  const { user, submitOnboarding, navigate } = useRouter();
  const [step, setStep] = useState(1);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('unknown');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Field validation flags
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const stepsList = [
    { title: 'Basic Profile' },
    { title: 'Emergency Info' },
    { title: 'Health ID' }
  ];

  const handleNext = () => {
    setTouchedFields({}); // Reset validation on step transition
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setTouchedFields({});
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const onboardingData = {
      dob,
      bloodGroup: bloodGroup !== 'unknown' ? bloodGroup : undefined,
      emergencyContact: emergencyName.trim() ? {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim()
      } : undefined
    };
    submitOnboarding(onboardingData);
    navigate('/patient');
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Validations per step
  const getStepErrors = () => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (touchedFields.name && !name.trim()) {
        errors.name = 'Full Name is required.';
      }
      if (touchedFields.dob && !dob) {
        errors.dob = 'Date of Birth is required.';
      }
    }
    return errors;
  };

  const errors = getStepErrors();
  const isStep1Valid = name.trim() !== '' && dob !== '' && Object.keys(errors).length === 0;
  
  // Step 2 is fully optional
  const isStep2Valid = true;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">Tell us about yourself</h2>
            <p className="onboard-step-desc">Provide your basic profile details. This helps establish your secure index register.</p>

            <div className="onboard-form-grid">
              <TextInput
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                error={errors.name}
                required
              />

              <TextInput
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => handleFieldBlur('dob')}
                error={errors.dob}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">Emergency Details</h2>
            <p className="onboard-step-desc">Provide emergency parameters. These are fully optional and encrypted inside your personal archive.</p>

            <div className="onboard-form-grid">
              <SelectInput
                label="Blood Group (Optional)"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={[
                  { value: 'unknown', label: 'Choose group...' },
                  { value: 'A+', label: 'A Positive (A+)' },
                  { value: 'A-', label: 'A Negative (A-)' },
                  { value: 'B+', label: 'B Positive (B+)' },
                  { value: 'B-', label: 'B Negative (B-)' },
                  { value: 'AB+', label: 'AB Positive (AB+)' },
                  { value: 'AB-', label: 'AB Negative (AB-)' },
                  { value: 'O+', label: 'O Positive (O+)' },
                  { value: 'O-', label: 'O Negative (O-)' }
                ]}
              />

              <div className="form-sub-header">Emergency Contact Profile</div>

              <TextInput
                label="Contact Name (Optional)"
                placeholder="Next of kin name"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
              />

              <TextInput
                label="Contact Phone Number (Optional)"
                placeholder="+1 (555) 000-0000"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
              />
            </div>
          </div>
        );
      case 3:
      default:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">Your Health ID connects you to your medical history</h2>
            <p className="onboard-step-desc">Every MediVault patient receives a unique digital Health ID. Sharing this identifier allows clinical networks to propose secure access requests.</p>

            {/* Health ID card preview widget */}
            <div className="onboard-id-presentation">
              <div className="ambient-id-glow"></div>
              <Card className="onboard-health-id-card" padding="md" glow>
                <div className="card-top">
                  <div className="card-logo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3 7V13C3 18 12 22 12 22C12 22 21 18 21 13V7L12 2Z" stroke="var(--accent-lavender)" strokeWidth="2.5"/>
                    </svg>
                    <span>MediVault Profile</span>
                  </div>
                  <Badge variant="mint">Active ID</Badge>
                </div>
                
                <div className="card-user-info">
                  <span className="user-name">{name}</span>
                  <span className="user-dob">DOB: {new Date(dob).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="card-footer">
                  <span className="label">Generated Health ID</span>
                  <span className="value text-gradient">{user?.healthId || 'MV-2026-XXXXXX'}</span>
                </div>
              </Card>
            </div>

            {/* Explanations lists */}
            <div className="health-id-principles">
              <div className="principle-item">
                <ShieldCheck size={16} className="principle-icon" />
                <span className="text">The Health ID itself does <strong>NOT</strong> expose your medical records.</span>
              </div>
              <div className="principle-item">
                <ShieldCheck size={16} className="principle-icon" />
                <span className="text">Doctors must request authorization for specific scopes.</span>
              </div>
              <div className="principle-item">
                <ShieldCheck size={16} className="principle-icon" />
                <span className="text">Access can be time-limited and revoked instantly at any time.</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="onboarding-page-layout">
      <div className="container onboarding-container">
        
        {/* Onboarding Wizard Card */}
        <Card className="onboarding-card" padding="lg">
          <div className="onboarding-header">
            <div className="onboarding-brand">
              <Shield size={16} className="text-lavender" />
              <span>Patient Onboarding</span>
            </div>
            <span className="step-fraction">Step {step} of 3</span>
          </div>

          <OnboardingProgress currentStep={step} steps={stepsList} />

          <div className="onboarding-body">
            {renderStepContent()}
          </div>

          {/* Action Row */}
          <div className="onboarding-actions-row">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={handleBack}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
              >
                Back
              </Button>
            ) : (
              <div className="actions-spacer"></div>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                icon={<ArrowRight size={16} />}
                iconPosition="right"
                className="onboard-next-btn"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="mint"
                size="md"
                onClick={handleComplete}
                icon={<ShieldCheck size={16} />}
                iconPosition="right"
                className="onboard-next-btn"
              >
                Enter My Health Vault
              </Button>
            )}
          </div>

        </Card>

      </div>
    </div>
  );
};
