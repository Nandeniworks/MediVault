import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { TextInput } from '../components/common/FormElements';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { OnboardingProgress } from '../components/common/OnboardingProgress';
import { ShieldCheck, ArrowLeft, ArrowRight, ClipboardCheck, Lock } from 'lucide-react';
import './DoctorOnboarding.css';

export const DoctorOnboarding: React.FC = () => {
  const { user, submitOnboarding, navigate } = useRouter();
  const [step, setStep] = useState(1);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [workEmail, setWorkEmail] = useState(user?.email || '');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseRegion, setLicenseRegion] = useState('');

  // Field validation flags
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const stepsList = [
    { title: 'Clinician Profile' },
    { title: 'License Verification' },
    { title: 'Privacy Principles' }
  ];

  const handleNext = () => {
    setTouchedFields({});
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
      workEmail: workEmail.trim(),
      specialization: specialization.trim(),
      hospital: hospital.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseRegion: licenseRegion.trim(),
      verificationStatus: 'pending' // Static prototype state
    };
    submitOnboarding(onboardingData);
    navigate('/doctor');
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
      if (touchedFields.workEmail) {
        if (!workEmail.trim()) {
          errors.workEmail = 'Professional Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
          errors.workEmail = 'Please enter a valid email address.';
        }
      }
      if (touchedFields.specialization && !specialization.trim()) {
        errors.specialization = 'Specialization field is required (e.g. Cardiology).';
      }
      if (touchedFields.hospital && !hospital.trim()) {
        errors.hospital = 'Clinic or Hospital affiliation name is required.';
      }
    } else if (step === 2) {
      if (touchedFields.licenseNumber && !licenseNumber.trim()) {
        errors.licenseNumber = 'License registration number is required.';
      }
      if (touchedFields.licenseRegion && !licenseRegion.trim()) {
        errors.licenseRegion = 'Licensing Region or Country name is required.';
      }
    }
    return errors;
  };

  const errors = getStepErrors();
  const isStep1Valid = 
    name.trim() !== '' && 
    workEmail.trim() !== '' && 
    /\S+@\S+\.\S+/.test(workEmail) && 
    specialization.trim() !== '' && 
    hospital.trim() !== '' && 
    Object.keys(errors).length === 0;

  const isStep2Valid = 
    licenseNumber.trim() !== '' && 
    licenseRegion.trim() !== '' && 
    Object.keys(errors).length === 0;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">Professional Profile</h2>
            <p className="onboard-step-desc">Establish your clinical workspace profile details.</p>

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
                label="Professional Email"
                placeholder="clinician@hospital.org"
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                onBlur={() => handleFieldBlur('workEmail')}
                error={errors.workEmail}
                required
              />

              <TextInput
                label="Specialization / Department"
                placeholder="e.g. Cardiology, Hematology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                onBlur={() => handleFieldBlur('specialization')}
                error={errors.specialization}
                required
              />

              <TextInput
                label="Affiliated Organization / Hospital"
                placeholder="e.g. Ashby Medical Center"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                onBlur={() => handleFieldBlur('hospital')}
                error={errors.hospital}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">Credentials Registration</h2>
            <p className="onboard-step-desc">Provide your licensing credentials to allow patient verify logs checking.</p>

            <div className="onboard-form-grid">
              <TextInput
                label="Professional License Number"
                placeholder="e.g. MD-48829-US"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                onBlur={() => handleFieldBlur('licenseNumber')}
                error={errors.licenseNumber}
                required
              />

              <TextInput
                label="Licensing Region / State / Country"
                placeholder="e.g. California Medical Board"
                value={licenseRegion}
                onChange={(e) => setLicenseRegion(e.target.value)}
                onBlur={() => handleFieldBlur('licenseRegion')}
                error={errors.licenseRegion}
                required
              />
            </div>

            {/* Verification Alert Callout */}
            <div className="verification-callout-box">
              <ClipboardCheck size={18} className="text-warning animate-float" />
              <div className="callout-text-details">
                <span className="title">Verification Pipeline Status:</span>
                <span className="status-label">Verification Pending</span>
                <p className="desc">
                  This platform is currently a prototype. Real credentials verification hooks are disabled; the profile status remains "Pending Verification" inside the clinical sandbox workspace.
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
      default:
        return (
          <div className="onboard-step-pane animate-fade-in">
            <h2 className="onboard-step-heading">MediVault Sharing Principles</h2>
            <p className="onboard-step-desc">MediVault operates strictly on a patient-controlled permissions schema. Review your clinical sharing compliance:</p>

            <div className="principles-list-box">
              <div className="principle-item">
                <Lock size={16} className="principle-icon-lock" />
                <div className="text-box">
                  <span className="bold">No Free Browsing</span>
                  <span className="desc">You cannot search or inspect patients without identifying the exact target and receiving explicit authorization.</span>
                </div>
              </div>

              <div className="principle-item">
                <Lock size={16} className="principle-icon-lock" />
                <div className="text-box">
                  <span className="bold">Authorized Scopes Only</span>
                  <span className="desc">You will only be allowed to read documents specifically checked by the patient in their share request dialog.</span>
                </div>
              </div>

              <div className="principle-item">
                <Lock size={16} className="principle-icon-lock" />
                <div className="text-box">
                  <span className="bold">Temporary Access Sessions</span>
                  <span className="desc">All sharing sessions have automatic time expirations or can be manually revoked by patients at any time.</span>
                </div>
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
              <ShieldCheck size={16} className="text-mint" />
              <span>Doctor Onboarding</span>
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
                Continue to Doctor Workspace
              </Button>
            )}
          </div>

        </Card>

      </div>
    </div>
  );
};
