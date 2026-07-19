import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '../common/Card';
import { useRouter } from '../../context/RouterContext';
import { vaultService } from '../../services/vaultService';
import type { MedicalRecord } from '../../services/vaultService';
import { demoActivity } from '../../services/patientService';
import { 
  FileText, Building, User, Pill, Calendar, Upload, 
  Sparkles, Award
} from 'lucide-react';

interface DashboardProps {
  user: any;
  isDemoMode: boolean;
}

export const PatientDashboard: React.FC<DashboardProps> = ({ user, isDemoMode: _isDemoMode }) => {
  const { navigate } = useRouter();
  const patientEmail = user?.email || '';

  // State
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seeded data or real data
  const loadDashboardData = () => {
    if (!patientEmail) return;
    const userRecords = vaultService.getRecords(patientEmail);
    const seeds = [
      {
        id: 'seed-cbc',
        patientId: patientEmail,
        title: 'Complete Blood Count (CBC)',
        provider: 'MediLab Diagnostics',
        recordDate: '2025-03-14',
        category: 'Lab Report' as const,
        doctorName: 'Dr. Sarah Jenkins',
        fileName: 'cbc_report_medilab.pdf',
        fileType: 'application/pdf',
        fileSize: '1.4 MB',
        isVerified: true,
        createdAt: '2025-03-14T08:00:00.000Z',
        updatedAt: '2025-03-14T08:00:00.000Z'
      },
      {
        id: 'seed-vit',
        patientId: patientEmail,
        title: 'Vitamin D & Vitamin B12 Panel',
        provider: 'Nova Diagnostic Centre',
        recordDate: '2025-09-21',
        category: 'Lab Report' as const,
        doctorName: 'Dr. Amit Patel',
        fileName: 'vitamin_panel_nova.pdf',
        fileType: 'application/pdf',
        fileSize: '950 KB',
        isVerified: true,
        createdAt: '2025-09-21T09:30:00.000Z',
        updatedAt: '2025-09-21T09:30:00.000Z'
      },
      {
        id: 'seed-xray',
        patientId: patientEmail,
        title: 'Right Wrist X-Ray',
        provider: 'CityCare Hospital',
        recordDate: '2026-02-06',
        category: 'Imaging & Scan' as const,
        doctorName: 'Dr. Robert Chen',
        fileName: 'right_wrist_xray.png',
        fileType: 'image/png',
        fileSize: '12.8 MB',
        isVerified: true,
        createdAt: '2026-02-06T11:15:00.000Z',
        updatedAt: '2026-02-06T11:15:00.000Z'
      }
    ];

    const filteredUserRecords = userRecords.filter(
      ur => !seeds.some(sr => sr.id === ur.id || (sr.title === ur.title && sr.recordDate === ur.recordDate))
    );

    setRecords([...seeds, ...filteredUserRecords]);
  };

  useEffect(() => {
    loadDashboardData();
  }, [patientEmail]);

  // Calculations
  const reportsCount = records.length;
  
  const providersCount = useMemo(() => {
    return new Set(records.map(r => r.provider).filter(Boolean)).size;
  }, [records]);

  const doctorsCount = useMemo(() => {
    return new Set(records.map(r => r.doctorName).filter(Boolean)).size;
  }, [records]);

  const activeMedicationsCount = 2; // Derived from seed medications

  const latestUpload = useMemo(() => {
    if (records.length === 0) return null;
    return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [records]);

  const upcomingFollowUp = '24 Jul 2026 - Dr. Sarah Jenkins';

  const recentReports = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
      .slice(0, 3);
  }, [records]);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await quickUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await quickUploadFile(e.target.files[0]);
    }
  };

  const quickUploadFile = async (file: File) => {
    try {
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
      await vaultService.saveRecord(
        patientEmail,
        {
          title: baseName,
          category: 'Lab Report',
          recordDate: new Date().toISOString().split('T')[0],
          provider: 'MediVault Clinic',
          doctorName: 'Dr. Sarah Jenkins'
        },
        file
      );
      loadDashboardData();
    } catch (err: any) {
      alert(err.message === 'DUPLICATE_UPLOAD' ? 'Document already exists in your vault.' : 'Failed to save record.');
    }
  };

  return (
    <div className="health-vault-container animate-fade-in">
      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {[
          { title: 'Reports', value: reportsCount, sub: 'Total Records', color: '#8b5cf6', icon: <FileText size={18} /> },
          { title: 'Hospitals', value: providersCount, sub: 'Facilities Mapped', color: '#a78bfa', icon: <Building size={18} /> },
          { title: 'Doctors', value: doctorsCount, sub: 'Specialists Mapped', color: '#d8b4fe', icon: <User size={18} /> },
          { title: 'Active Meds', value: activeMedicationsCount, sub: 'Ongoing Courses', color: '#c084fc', icon: <Pill size={18} /> },
          { title: 'Latest Upload', value: latestUpload ? latestUpload.title : 'None', sub: latestUpload ? new Date(latestUpload.createdAt).toLocaleDateString() : 'N/A', isText: true, color: '#e9d5ff', icon: <Upload size={18} /> },
          { title: 'Next Follow-up', value: upcomingFollowUp.split(' - ')[0], sub: upcomingFollowUp.split(' - ')[1], isText: true, color: '#f3e8ff', icon: <Calendar size={18} /> }
        ].map((m, idx) => (
          <Card key={idx} padding="md" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem',
            minHeight: '110px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.title}</span>
              <div style={{ color: m.color, opacity: 0.8 }}>{m.icon}</div>
            </div>
            <div>
              <span style={{ 
                fontSize: m.isText ? '0.9rem' : '1.75rem', 
                fontWeight: 700, 
                color: '#fff',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={String(m.value)}>{m.value}</span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{m.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Widget 1: Medical Passport */}
        <Card padding="md" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0.015) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.18)',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} className="text-violet-400" /> Medical Passport
          </h3>
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-lavender) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              A
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Aarav Sharma</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ABHA ID: 91-4402-9811-2026</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>DOB: <strong>15 Aug 1992</strong></div>
            <div>Blood: <strong>O Positive (O+)</strong></div>
            <div style={{ gridColumn: 'span 2' }}>Emergency: <strong>Priya Sharma (+91 98765 43210)</strong></div>
          </div>
        </Card>

        {/* Widget 2: Health Score Circular Gauge */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.75rem 0', width: '100%' }}>Health Index Score</h3>
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            <svg width="110" height="110" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="85 15" strokeDashoffset="25" />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>85</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>/ 100</span>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-mint)', fontWeight: 600, marginTop: '0.75rem' }}>Good Standing &bull; Stable Vitals</span>
        </Card>

        {/* Widget 3: Quick Upload */}
        <Card padding="none" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '1.5rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              border: isDragActive ? '2px dashed #8b5cf6' : '2px dashed transparent',
              borderRadius: 'var(--radius-lg)',
              transition: 'border-color 0.2s'
            }}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileInputChange} style={{ display: 'none' }} accept="application/pdf,image/*" />
            <Upload size={32} className="text-violet-400 animate-float" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 0.25rem 0' }}>Quick Report Upload</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Drag and drop or click to add files.</p>
          </div>
        </Card>
      </div>

      {/* Second Row Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Widget 4: Recent Reports */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Recent Reports</h3>
            <button onClick={() => navigate('/patient/vault')} style={{ background: 'none', border: 'none', color: 'var(--accent-lavender)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>View Vault</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentReports.map(rec => (
              <div 
                key={rec.id} 
                onClick={() => navigate(`/patient/vault/${rec.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={16} className="text-violet-400" />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: 0 }}>{rec.title}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rec.provider}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(rec.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget 5: Recent Activity */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Recent Activity Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {demoActivity.slice(0, 3).map((act, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-violet)' }} />
                  {i < 2 && <div style={{ width: '1px', flex: 1, background: 'rgba(255, 255, 255, 0.1)', marginTop: '4px' }} />}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{act.title}</span> &bull; {act.details}
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{act.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget 6: AI Insights */}
        <Card padding="md" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-lavender)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} /> Clinical AI Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ color: 'var(--accent-lavender)', fontWeight: 'bold' }}>&bull;</span>
              <span>Vitamin D deficiency detected (18.5 ng/mL). supplementation recommended weekly.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <span style={{ color: 'var(--accent-lavender)', fontWeight: 'bold' }}>&bull;</span>
              <span>Mild Anemia noted. Iron levels should be monitored post-course in May 2025.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
