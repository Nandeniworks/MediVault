import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  User, Heart, Activity, Phone, Edit2, Check
} from 'lucide-react';

interface ProfileData {
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  emergencyName: string;
  emergencyPhone: string;
  abhaId: string;
  insuranceProvider: string;
  insurancePolicy: string;
  primaryPhysician: string;
  organDonor: boolean;
  vaccinationStatus: string;
  knownAllergies: string;
  currentMedications: string;
  medicalConditions: string;
  hospitalVisits: string;
}

const LOCAL_STORAGE_KEY = 'mv_personal_profile';

const initialProfile: ProfileData = {
  fullName: 'Aarav Sharma',
  dob: '1992-08-15',
  gender: 'Male',
  bloodGroup: 'O Positive (O+)',
  height: '178 cm',
  weight: '74 kg',
  emergencyName: 'Priya Sharma',
  emergencyPhone: '+91 98765 43210',
  abhaId: '91-4402-9811-2026',
  insuranceProvider: 'Star Health Insurance',
  insurancePolicy: 'SHI-90221-A9X',
  primaryPhysician: 'Dr. Robert Chen',
  organDonor: true,
  vaccinationStatus: 'Fully Vaccinated (3 Doses)',
  knownAllergies: 'Penicillin, Peanuts, Dust',
  currentMedications: 'Iron Supplement (Morning), Vitamin D3 (Weekly)',
  medicalConditions: 'Mild Anemia, Past Distal Radius Fracture',
  hospitalVisits: '3 Visits (Apex Diagnostics, CityCare Hospital)'
};

export const PersonalProfile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse profile data', e);
      }
    }
  }, []);

  const saveProfile = (updated: ProfileData) => {
    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // Calculate age dynamically
  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    saveProfile({
      ...profile,
      [name]: val
    });
  };

  return (
    <div className="health-vault-container">
      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Personal Health Profile</h2>
          <p className="vault-sub-text">View and manage your core identity, biometrics, emergency details, and clinical summaries.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {/* Card 1: Personal Identity & Avatar */}
        <Card className="record-grid-card" padding="md" style={{
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} className="text-violet-400" /> Identity Info
              </h3>
              <button 
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'background-color 0.2s'
                }}
              >
                {isEditingPersonal ? <><Check size={14} className="text-mint" /> Done</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>

            {/* Profile Pic Placeholder & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-lavender) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.75rem',
                fontWeight: 700,
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}>
                {profile.fullName.charAt(0)}
              </div>
              <div>
                {isEditingPersonal ? (
                  <input 
                    type="text" 
                    name="fullName"
                    value={profile.fullName}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>{profile.fullName}</h4>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient Member</span>
              </div>
            </div>

            {/* Fields List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Date of Birth & Age</span>
                {isEditingPersonal ? (
                  <input 
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{new Date(profile.dob).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} ({calculateAge(profile.dob)} years old)</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Gender</span>
                {isEditingPersonal ? (
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handlePersonalChange}
                    style={{
                      background: '#1a1625',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <strong>{profile.gender}</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>ABHA ID</span>
                {isEditingPersonal ? (
                  <input 
                    type="text"
                    name="abhaId"
                    value={profile.abhaId}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong style={{ fontFamily: 'monospace' }}>{profile.abhaId}</strong>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Organ Donor Status:</span>
                {isEditingPersonal ? (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: '#fff' }}>
                    <input 
                      type="checkbox"
                      name="organDonor"
                      checked={profile.organDonor}
                      onChange={handlePersonalChange}
                    />
                    Registered Donor
                  </label>
                ) : (
                  <Badge variant={profile.organDonor ? 'success' : 'info'}>
                    {profile.organDonor ? 'Organ Donor' : 'Not Registered'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Biometrics & Metrics */}
        <Card className="record-grid-card" padding="md" style={{
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} className="text-red-400" /> Physical Biometrics
              </h3>
              <button 
                onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {isEditingMetrics ? <><Check size={14} className="text-mint" /> Done</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Blood Group</span>
                {isEditingMetrics ? (
                  <select
                    name="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={handlePersonalChange}
                    style={{
                      background: '#1a1625',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  >
                    <option value="A Positive (A+)">A Positive (A+)</option>
                    <option value="A Negative (A-)">A Negative (A-)</option>
                    <option value="B Positive (B+)">B Positive (B+)</option>
                    <option value="B Negative (B-)">B Negative (B-)</option>
                    <option value="O Positive (O+)">O Positive (O+)</option>
                    <option value="O Negative (O-)">O Negative (O-)</option>
                    <option value="AB Positive (AB+)">AB Positive (AB+)</option>
                    <option value="AB Negative (AB-)">AB Negative (AB-)</option>
                  </select>
                ) : (
                  <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ff5f5f' }}>
                    {profile.bloodGroup}
                  </strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Height</span>
                {isEditingMetrics ? (
                  <input 
                    type="text"
                    name="height"
                    value={profile.height}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{profile.height}</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Weight</span>
                {isEditingMetrics ? (
                  <input 
                    type="text"
                    name="weight"
                    value={profile.weight}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{profile.weight}</strong>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Healthcare Partners & Emergency */}
        <Card className="record-grid-card" padding="md" style={{
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} className="text-emerald-400" /> Contacts & Care
              </h3>
              <button 
                onClick={() => setIsEditingEmergency(!isEditingEmergency)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {isEditingEmergency ? <><Check size={14} className="text-mint" /> Done</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Emergency Contact Name</span>
                {isEditingEmergency ? (
                  <input 
                    type="text"
                    name="emergencyName"
                    value={profile.emergencyName}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{profile.emergencyName}</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Emergency Contact Phone</span>
                {isEditingEmergency ? (
                  <input 
                    type="text"
                    name="emergencyPhone"
                    value={profile.emergencyPhone}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{profile.emergencyPhone}</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Primary Physician</span>
                {isEditingEmergency ? (
                  <input 
                    type="text"
                    name="primaryPhysician"
                    value={profile.primaryPhysician}
                    onChange={handlePersonalChange}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '0.25rem 0.5rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <strong>{profile.primaryPhysician}</strong>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Insurance Provider & Policy</span>
                {isEditingEmergency ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text"
                      name="insuranceProvider"
                      value={profile.insuranceProvider}
                      onChange={handlePersonalChange}
                      placeholder="Provider"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        width: '50%'
                      }}
                    />
                    <input 
                      type="text"
                      name="insurancePolicy"
                      value={profile.insurancePolicy}
                      onChange={handlePersonalChange}
                      placeholder="Policy ID"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        width: '50%'
                      }}
                    />
                  </div>
                ) : (
                  <strong>{profile.insuranceProvider} &bull; <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{profile.insurancePolicy}</span></strong>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Card 4: Clinical History Summaries */}
      <Card className="record-grid-card animate-fade-in" padding="md" style={{
        background: 'rgba(255, 255, 255, 0.015)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-medium)',
        marginTop: '1.5rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} className="text-teal-400" /> Clinical History & Summaries
          </h3>
          <button 
            onClick={() => setIsEditingMedical(!isEditingMedical)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            {isEditingMedical ? <><Check size={14} className="text-mint" /> Done</> : <><Edit2 size={14} /> Edit</>}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Vaccination Status</span>
            {isEditingMedical ? (
              <input 
                type="text"
                name="vaccinationStatus"
                value={profile.vaccinationStatus}
                onChange={handlePersonalChange}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  width: '100%'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-mint)' }}>{profile.vaccinationStatus}</p>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Known Allergies</span>
            {isEditingMedical ? (
              <input 
                type="text"
                name="knownAllergies"
                value={profile.knownAllergies}
                onChange={handlePersonalChange}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  width: '100%'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-lavender)' }}>{profile.knownAllergies}</p>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Current Medications</span>
            {isEditingMedical ? (
              <input 
                type="text"
                name="currentMedications"
                value={profile.currentMedications}
                onChange={handlePersonalChange}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  width: '100%'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-violet)' }}>{profile.currentMedications}</p>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Active Medical Conditions</span>
            {isEditingMedical ? (
              <input 
                type="text"
                name="medicalConditions"
                value={profile.medicalConditions}
                onChange={handlePersonalChange}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  width: '100%'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{profile.medicalConditions}</p>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Hospital Visits History</span>
            {isEditingMedical ? (
              <input 
                type="text"
                name="hospitalVisits"
                value={profile.hospitalVisits}
                onChange={handlePersonalChange}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  width: '100%'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{profile.hospitalVisits}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
