import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useRouter } from '../../context/RouterContext';
import { 
  FileText, Building, User, Pill, CheckCircle2, 
  ArrowDown, Eye
} from 'lucide-react';

interface JourneyNode {
  id: string;
  type: 'report' | 'medication' | 'recovery';
  dateLabel: string;
  title: string;
  provider: string;
  doctor: string;
  description: string;
  badgeText: string;
  badgeVariant: 'lavender' | 'mint' | 'violet' | 'success' | 'info' | 'warning' | 'danger';
  recordId?: string;
}

export const PatientJourneyTimeline: React.FC = () => {
  const { navigate } = useRouter();

  const journeyNodes: JourneyNode[] = [
    {
      id: 'node-1',
      type: 'report',
      dateLabel: 'March 2025',
      title: 'Complete Blood Count (CBC)',
      provider: 'MediLab Diagnostics',
      doctor: 'Dr. Sarah Jenkins',
      description: 'First screening indicating normal red cell count but borderline low platelet indices.',
      badgeText: 'Lab Report',
      badgeVariant: 'lavender',
      recordId: 'seed-cbc'
    },
    {
      id: 'node-2',
      type: 'report',
      dateLabel: 'September 2025',
      title: 'Vitamin D & Vitamin B12 Panel',
      provider: 'Nova Diagnostic Centre',
      doctor: 'Dr. Amit Patel',
      description: 'Serum levels review. Confirmed deficiency in Vitamin D (18.5 ng/mL) and B12 (180 pg/mL).',
      badgeText: 'Lab Report',
      badgeVariant: 'lavender',
      recordId: 'seed-vit'
    },
    {
      id: 'node-3',
      type: 'report',
      dateLabel: 'February 2026',
      title: 'Right Wrist X-Ray',
      provider: 'CityCare Hospital',
      doctor: 'Dr. Robert Chen',
      description: 'Radiological scan. Alignment intact. No acute fracture lines or dislocations detected.',
      badgeText: 'Radiology',
      badgeVariant: 'mint',
      recordId: 'seed-xray'
    },
    {
      id: 'node-4',
      type: 'medication',
      dateLabel: 'Ongoing Treatment',
      title: 'Medication Regimen Prescribed',
      provider: 'Cardiology Specialist Clinic',
      doctor: 'Dr. Robert Chen',
      description: 'Started daily Iron Supplement and weekly Vitamin D3 capsules to address identified systemic deficiencies.',
      badgeText: 'Active Prescription',
      badgeVariant: 'violet'
    },
    {
      id: 'node-5',
      type: 'recovery',
      dateLabel: 'Recent Status',
      title: 'Complete Physiological Recovery',
      provider: 'City Care Imaging / Clinic',
      doctor: 'Dr. Sarah Jenkins',
      description: 'Post-recovery screening confirms clear lung fields, stable hemoglobin counts, and aligned bone union.',
      badgeText: 'Recovered',
      badgeVariant: 'success'
    }
  ];

  return (
    <div className="health-vault-container">
      {/* CSS Entrance Keyframes */}
      <style>{`
        @keyframes journeySlideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .journey-animated-node {
          animation: journeySlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Medical Journey</h2>
          <p className="vault-sub-text">A vertical chronological trail connecting diagnostic reports, prescriptions, and health recovery milestones.</p>
        </div>
      </div>

      {/* Journey Pathway */}
      <div style={{
        position: 'relative',
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '0 1rem'
      }}>
        {/* Continuous Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '100%',
          background: 'linear-gradient(to bottom, var(--accent-violet) 0%, var(--accent-lavender) 50%, var(--accent-mint) 100%)',
          borderRadius: '2px',
          zIndex: 1,
          opacity: 0.6
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', zIndex: 2 }}>
          {journeyNodes.map((node, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={node.id}>
                {/* Node Row container */}
                <div 
                  className="journey-animated-node"
                  style={{
                    display: 'flex',
                    justifyContent: isLeft ? 'flex-start' : 'flex-end',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100%',
                    animationDelay: `${index * 0.15}s`
                  }}
                >
                  {/* Central Node Indicator */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0c0b16',
                    border: '3px solid ' + (node.type === 'report' ? 'var(--accent-violet)' : node.type === 'medication' ? '#a78bfa' : 'var(--accent-mint)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px ' + (node.type === 'report' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(0, 235, 212, 0.4)'),
                    color: '#fff',
                    zIndex: 3
                  }}>
                    {node.type === 'report' ? <FileText size={14} /> : node.type === 'medication' ? <Pill size={14} /> : <CheckCircle2 size={14} />}
                  </div>

                  {/* Card Container (Takes 45% width to sit on left/right side) */}
                  <div 
                    onClick={() => node.recordId && navigate(`/patient/vault/${node.recordId}`)}
                    style={{
                      width: '45%',
                      cursor: node.recordId ? 'pointer' : 'default',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (node.recordId) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (node.recordId) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <Card padding="md" style={{
                      background: 'rgba(255, 255, 255, 0.015)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-medium)',
                      position: 'relative',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                      {/* Date header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-lavender)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {node.dateLabel}
                        </span>
                        <Badge variant={node.badgeVariant}>{node.badgeText}</Badge>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>{node.title}</h3>

                      {/* Description */}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.75rem 0' }}>
                        {node.description}
                      </p>

                      {/* Facility details */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Building size={12} />
                          <span>{node.provider}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <User size={12} />
                          <span>{node.doctor}</span>
                        </div>
                      </div>

                      {/* Seed marker / Inspect details prompt */}
                      {node.recordId && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-mint)', fontWeight: 600, alignItems: 'center', gap: '0.2rem' }}>
                          Inspect Report <Eye size={12} />
                        </div>
                      )}
                    </Card>
                  </div>
                </div>

                {/* Vertical Separator Indicator Arrow (Only show between nodes) */}
                {index < journeyNodes.length - 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0.5rem 0',
                    color: 'var(--accent-lavender)',
                    opacity: 0.8,
                    zIndex: 2,
                    position: 'relative'
                  }}>
                    <div style={{
                      background: '#0c0b16',
                      borderRadius: '50%',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ArrowDown size={14} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
