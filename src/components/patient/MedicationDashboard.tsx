import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Pill, Calendar, User, Activity, CheckCircle2, Clock,
  Sun, Sunset, Moon
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
  startDate: string;
  endDate: string;
  prescribedBy: string;
  purpose: string;
  status: 'Active' | 'Completed';
  refillDate?: string;
}

export const MedicationDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Completed'>('All');

  // Seeded medications
  const medications: Medication[] = [
    {
      id: 'med-1',
      name: 'Iron Supplement',
      dosage: '1 Tablet',
      timing: { morning: true, afternoon: false, night: false },
      startDate: '2025-03-14',
      endDate: '2025-05-14',
      prescribedBy: 'Dr. Aditi Mehra',
      purpose: 'Mild Anemia',
      status: 'Active',
      refillDate: '2025-04-14'
    },
    {
      id: 'med-2',
      name: 'Amoxicillin 500mg',
      dosage: '1 Capsule',
      timing: { morning: true, afternoon: true, night: true },
      startDate: '2026-01-01',
      endDate: '2026-01-08',
      prescribedBy: 'Dr. Amit Patel',
      purpose: 'Bacterial Infection',
      status: 'Completed'
    },
    {
      id: 'med-3',
      name: 'Vitamin D3 60K',
      dosage: '1 Capsule (Weekly)',
      timing: { morning: true, afternoon: false, night: false },
      startDate: '2026-06-10',
      endDate: '2026-08-10',
      prescribedBy: 'Dr. Sarah Jenkins',
      purpose: 'Vitamin D Deficiency',
      status: 'Active',
      refillDate: '2026-07-22'
    },
    {
      id: 'med-4',
      name: 'Lipitor 20mg',
      dosage: '1 Tablet',
      timing: { morning: false, afternoon: false, night: true },
      startDate: '2026-01-10',
      endDate: '2026-07-10',
      prescribedBy: 'Dr. Robert Chen',
      purpose: 'Cholesterol Management',
      status: 'Completed'
    }
  ];

  // Derived metrics
  const activeCount = medications.filter(m => m.status === 'Active').length;
  const completedCount = medications.filter(m => m.status === 'Completed').length;
  const refillCount = medications.filter(m => m.status === 'Active' && m.refillDate).length;
  const doctorsCount = new Set(medications.map(m => m.prescribedBy)).size;

  // Filtered meds
  const filteredMeds = medications.filter(m => {
    if (activeFilter === 'All') return true;
    return m.status === activeFilter;
  });

  return (
    <div className="health-vault-container">
      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Medication Dashboard</h2>
          <p className="vault-sub-text">Track your active prescriptions, dosage timings, and upcoming refill schedules.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="vault-metrics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '1.5rem',
        marginTop: '1rem'
      }}>
        {/* Metric 1 */}
        <Card className="metric-card-glass" padding="md" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-violet)'
          }}>
            <Pill size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Active Medications</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{activeCount}</span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="metric-card-glass" padding="md" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-mint)'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Completed Courses</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{completedCount}</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="metric-card-glass" padding="md" style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.03) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ec4899'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Upcoming Refills</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{refillCount}</span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="metric-card-glass" padding="md" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(29, 78, 216, 0.03) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6'
          }}>
            <User size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Current Doctors</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{doctorsCount}</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="vault-controls-card animate-fade-in" padding="sm" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pills-label" style={{ marginRight: '0.5rem' }}>Filter Status:</span>
            {(['All', 'Active', 'Completed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`category-pill-btn ${activeFilter === filter ? 'active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Medication Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filteredMeds.map((med) => (
          <Card 
            key={med.id} 
            className="record-grid-card border-glow-hover" 
            padding="none" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.015)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Top Info section */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Pill size={18} className="text-violet-400" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{med.dosage}</span>
                </div>

                <Badge variant={med.status === 'Active' ? 'mint' : 'info'}>
                  {med.status}
                </Badge>
              </div>

              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                {med.name}
              </h3>

              {/* Timing indicators */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                margin: '0.75rem 0',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: med.timing.morning ? 'var(--accent-mint)' : 'var(--text-muted)',
                  fontWeight: med.timing.morning ? 600 : 400,
                  opacity: med.timing.morning ? 1 : 0.4,
                  flex: 1,
                  justifyContent: 'center'
                }}>
                  <Sun size={14} /> Morning
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: med.timing.afternoon ? 'var(--accent-lavender)' : 'var(--text-muted)',
                  fontWeight: med.timing.afternoon ? 600 : 400,
                  opacity: med.timing.afternoon ? 1 : 0.4,
                  flex: 1,
                  justifyContent: 'center'
                }}>
                  <Sunset size={14} /> Afternoon
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: med.timing.night ? 'var(--accent-violet)' : 'var(--text-muted)',
                  fontWeight: med.timing.night ? 600 : 400,
                  opacity: med.timing.night ? 1 : 0.4,
                  flex: 1,
                  justifyContent: 'center'
                }}>
                  <Moon size={14} /> Night
                </div>
              </div>

              {/* Details List */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                marginTop: '0.75rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} className="text-muted" />
                  <span>Prescribed By: <strong>{med.prescribedBy}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} className="text-muted" />
                  <span>Schedule: <strong>{new Date(med.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong> to <strong>{new Date(med.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={14} className="text-muted" />
                  <span>Purpose: <strong>{med.purpose}</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Actions or upcoming refill info */}
            {med.status === 'Active' && med.refillDate && (
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '0.75rem 1.25rem',
                background: 'rgba(139, 92, 246, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> Next Refill:
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent-lavender)' }}>
                  {new Date(med.refillDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
