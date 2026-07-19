import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { useRouter } from '../../context/RouterContext';
import { vaultService } from '../../services/vaultService';
import { demoRecords } from '../../services/patientService';
import { 
  Activity, FileText, User, Building, Heart, 
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';

export const PatientAnalyticsView: React.FC = () => {
  const { user, navigate } = useRouter();
  const patientEmail = user?.email || '';

  // Get records from local storage & seed records
  const records = useMemo(() => {
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
        title: 'Vitamin D & Vitamin B12',
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

    return [...seeds, ...filteredUserRecords, ...demoRecords.filter(dr => dr.patientId === patientEmail)];
  }, [patientEmail]);

  // Calculations
  const reportsCount = records.length;

  const providers = useMemo(() => {
    return Array.from(new Set(records.map(r => r.provider).filter(Boolean)));
  }, [records]);

  const doctors = useMemo(() => {
    return Array.from(new Set(records.map(r => r.doctorName).filter(Boolean)));
  }, [records]);

  const bloodTestsCount = records.filter(r => r.title.toLowerCase().includes('blood') || r.title.toLowerCase().includes('cbc') || r.title.toLowerCase().includes('thyroid')).length;
  const radiologyCount = records.filter(r => r.category === 'Imaging & Scan').length;

  // Recent Uploads
  const recentUploads = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
      .slice(0, 4);
  }, [records]);

  // Vitals Sparkline Trend values
  const hbData = [13.2, 13.5, 13.9, 14.2];
  const vitDData = [20.4, 21.8, 23.5, 24.5];
  const sugarData = [105, 99, 96, 95];

  // Monthly upload chart counts
  const monthlyCounts = useMemo(() => {
    const counts = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
    records.forEach(r => {
      const month = new Date(r.recordDate).toLocaleString('en-US', { month: 'short' }) as keyof typeof counts;
      if (counts[month] !== undefined) {
        counts[month]++;
      }
    });
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  }, [records]);

  const maxMonthlyCount = Math.max(...monthlyCounts.map(d => d.count), 1);

  // Hospital visit distribution
  const hospitalVisits = useMemo(() => {
    const visits: Record<string, number> = {};
    records.forEach(r => {
      if (r.provider) {
        visits[r.provider] = (visits[r.provider] || 0) + 1;
      }
    });
    return Object.entries(visits)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [records]);

  // Categories distribution
  const categoryCounts = useMemo(() => {
    const counts = { 'Lab Reports': 0, 'Radiology': 0, 'Prescriptions': 0, 'Others': 0 };
    records.forEach(r => {
      if (r.category === 'Lab Report') counts['Lab Reports']++;
      else if (r.category === 'Imaging & Scan') counts['Radiology']++;
      else if (r.category === 'Prescription') counts['Prescriptions']++;
      else counts['Others']++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [records]);

  const totalCatCount = records.length || 1;

  return (
    <div className="health-vault-container">
      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Health Analytics</h2>
          <p className="vault-sub-text">Visualize hospital visits, diagnostic record breakdowns, and vitals trend metrics.</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginTop: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[
          { title: 'Reports Uploaded', value: reportsCount, sub: 'Total Records Mapped', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: <FileText size={20} /> },
          { title: 'Hospitals Visited', value: providers.length, sub: 'Healthcare Providers', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', icon: <Building size={20} /> },
          { title: 'Doctors Consulted', value: doctors.length, sub: 'Clinicians Mapped', color: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.1)', icon: <User size={20} /> },
          { title: 'Blood Tests', value: bloodTestsCount, sub: 'Hematology Panels', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', icon: <Activity size={20} /> },
          { title: 'Radiology Reports', value: radiologyCount, sub: 'X-Rays, MRI & CT Scans', color: '#e9d5ff', bg: 'rgba(233, 213, 255, 0.1)', icon: <Heart size={20} /> }
        ].map((m, idx) => (
          <Card key={idx} padding="md" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.title}</span>
              <div style={{ color: m.color, width: '32px', height: '32px', borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{m.value}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Vitals & Trend Sparklines */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Vitals Card 1 */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Hemoglobin</span>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: '0.25rem 0' }}>14.2 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>g/dL</span></h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUpRight size={14} /> Normal (Optimal Range)
              </span>
            </div>
            {/* Purple Trend Chart */}
            <div style={{ width: '100px', height: '50px' }}>
              <svg width="100" height="50" viewBox="0 0 100 50">
                <path d="M 5 45 L 35 35 L 65 20 L 95 10" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                <path d="M 5 45 L 35 35 L 65 20 L 95 10 L 95 50 L 5 50 Z" fill="url(#purpleGrad)" opacity="0.15" />
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                {hbData.map((_, i) => (
                  <circle key={i} cx={5 + i * 30} cy={45 - i * 11.6} r="3" fill="#12101b" stroke="#c084fc" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
          </div>
        </Card>

        {/* Vitals Card 2 */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Vitamin D</span>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: '0.25rem 0' }}>24.5 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ng/mL</span></h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowDownRight size={14} /> Deficient (Below 30.0)
              </span>
            </div>
            {/* Purple Trend Chart */}
            <div style={{ width: '100px', height: '50px' }}>
              <svg width="100" height="50" viewBox="0 0 100 50">
                <path d="M 5 40 L 35 32 L 65 24 L 95 18" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                <path d="M 5 40 L 35 32 L 65 24 L 95 18 L 95 50 L 5 50 Z" fill="url(#purpleGrad)" opacity="0.15" />
                {vitDData.map((_, i) => (
                  <circle key={i} cx={5 + i * 30} cy={40 - i * 7.3} r="3" fill="#12101b" stroke="#c084fc" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
          </div>
        </Card>

        {/* Vitals Card 3 */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Blood Sugar</span>
              <h4 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: '0.25rem 0' }}>95 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>mg/dL</span></h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowDownRight size={14} /> Normal (Optimal Range)
              </span>
            </div>
            {/* Purple Trend Chart */}
            <div style={{ width: '100px', height: '50px' }}>
              <svg width="100" height="50" viewBox="0 0 100 50">
                <path d="M 5 15 L 35 25 L 65 35 L 95 40" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                <path d="M 5 15 L 35 25 L 65 35 L 95 40 L 95 50 L 5 50 Z" fill="url(#purpleGrad)" opacity="0.15" />
                {sugarData.map((_, i) => (
                  <circle key={i} cx={5 + i * 30} cy={15 + i * 8.3} r="3" fill="#12101b" stroke="#c084fc" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Chart 1: Monthly Reports Bar Chart */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Monthly Reports Activity</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.5rem' }}>
            {monthlyCounts.map((m, idx) => {
              const pct = (m.count / maxMonthlyCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${pct}%`,
                    background: m.count > 0 ? 'linear-gradient(to top, #8b5cf6 0%, #c084fc 100%)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '3px 3px 0 0',
                    minHeight: m.count > 0 ? '4px' : '1px'
                  }} title={`${m.month}: ${m.count} reports`} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart 2: Medical Categories Doughnut */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Medical Categories Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem' }}>
            {/* SVG Doughnut */}
            <div style={{ position: 'relative', width: '110px', height: '110px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="doughnut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="4.5" />
                {(() => {
                  let accumulatedOffset = 0;
                  const colors = ['#8b5cf6', '#a78bfa', '#d8b4fe', '#c084fc'];
                  return categoryCounts.map((cat, idx) => {
                    const percentage = (cat.count / totalCatCount) * 100;
                    const strokeDash = `${percentage} ${100 - percentage}`;
                    const strokeOffset = 100 - accumulatedOffset + 25;
                    accumulatedOffset += percentage;
                    return (
                      <circle 
                        key={idx} 
                        cx="21" 
                        cy="21" 
                        r="15.915" 
                        fill="transparent" 
                        stroke={colors[idx % colors.length]} 
                        strokeWidth="4.5" 
                        strokeDasharray={strokeDash} 
                        strokeDashoffset={strokeOffset} 
                      />
                    );
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'block' }}>{reportsCount}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Records</span>
              </div>
            </div>

            {/* Legends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {categoryCounts.map((cat, idx) => {
                const colors = ['#8b5cf6', '#a78bfa', '#d8b4fe', '#c084fc'];
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{cat.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline Graph & Hospital Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Timeline Line Graph */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Timeline Upload Trend</h3>
          <div style={{ position: 'relative', height: '140px', borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 120" style={{ overflow: 'visible' }}>
              <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" strokeDasharray="3" />

              {/* Purple Timeline trend path */}
              <path d="M 20 100 L 90 70 L 160 85 L 230 40 Q 260 20 280 15" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
              <path d="M 20 100 L 90 70 L 160 85 L 230 40 Q 260 20 280 15 L 280 110 L 20 110 Z" fill="url(#purpleGrad)" opacity="0.1" />

              {/* Dot markers */}
              <circle cx="20" cy="100" r="4" fill="#12101b" stroke="#c084fc" strokeWidth="2" />
              <circle cx="90" cy="70" r="4" fill="#12101b" stroke="#c084fc" strokeWidth="2" />
              <circle cx="160" cy="85" r="4" fill="#12101b" stroke="#c084fc" strokeWidth="2" />
              <circle cx="230" cy="40" r="4" fill="#12101b" stroke="#c084fc" strokeWidth="2" />
              <circle cx="280" cy="15" r="4" fill="#12101b" stroke="#c084fc" strokeWidth="2" />

              {/* Text labels */}
              <text x="20" y="118" fontSize="7" fill="var(--text-muted)" textAnchor="middle">2024</text>
              <text x="125" y="118" fontSize="7" fill="var(--text-muted)" textAnchor="middle">2025</text>
              <text x="250" y="118" fontSize="7" fill="var(--text-muted)" textAnchor="middle">2026</text>
            </svg>
          </div>
        </Card>

        {/* Hospital Distribution */}
        <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Hospital Visit Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {hospitalVisits.map((h, i) => {
              const pct = (h.count / reportsCount) * 100;
              return (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <span>{h.name}</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{h.count} Visits ({Math.round(pct)}%)</span>
                  </div>
                  {/* Progress bar container */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, #8b5cf6, #d8b4fe)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Most Recent Uploads */}
      <Card padding="md" style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-medium)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem 0' }}>Most Recent Uploads</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentUploads.map((rec) => (
            <div 
              key={rec.id} 
              onClick={() => navigate(`/patient/vault/${rec.id}`)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b5cf6'
                }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{rec.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.provider} &bull; {rec.doctorName || 'Unspecified doctor'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(rec.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <Eye size={16} className="text-muted" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
