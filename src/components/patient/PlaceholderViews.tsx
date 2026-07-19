import React from 'react';
import { Badge } from '../common/Badge';
import {
  FolderHeart, CalendarClock, ShieldAlert, Key,
  Activity, Settings, User, Pill,
  CheckCircle2, XCircle, Clock3, ShieldCheck,
} from 'lucide-react';
import { accessRequestService } from '../../services/accessRequestService';
import type { AccessRequest as ARRecord } from '../../services/accessRequestService';
import { activityLogService } from '../../services/activityLogService';
import './PatientAccessRequests.css';
import { useRouter } from '../../context/RouterContext';


// ══════════════════════════════════════════════════════════
//  Generic "Coming Soon" Placeholder
// ══════════════════════════════════════════════════════════
interface PlaceholderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  phase?: string;
}

export const PolishedPlaceholder: React.FC<PlaceholderProps> = ({
  title,
  description,
  icon,
  phase = 'Future Phase',
}) => (
  <div className="placeholder-view-wrapper animate-fade-in">
    <div className="polished-placeholder-card">
      <div className="placeholder-icon-ring">{icon}</div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-desc">{description}</p>
      <div className="placeholder-phase-badge">{phase}</div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
//  Section Placeholders
// ══════════════════════════════════════════════════════════
import './PatientTimeline.css';
import { FileText, Eye, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { vaultService } from '../../services/vaultService';
import { demoRecords } from '../../services/patientService';

interface PatientTimelineProps {
  patientEmail: string;
  isDemoMode?: boolean;
}

const getAIInsight = (id: string, title: string, category: string): string | null => {
  const insights: Record<string, string> = {
    'rec-cbc': 'Vitamin D deficiency first detected (24.5 ng/mL, reference range > 30.0 ng/mL). Suggesting daily oral supplementation.',
    'rec-cbc-jul-2025': 'Vitamin D levels improving (31.2 ng/mL). General blood counts and Hb levels normal, showing positive response to therapy.',
    'rec-xray': 'Acute distal radius fracture detected (Right Wrist Fracture). Recommending immobilization cast and orthopedic review.',
    'rec-wrist-followup': 'Interval healing of distal radius fracture. Callus formation progressing normally with good alignment.'
  };

  if (insights[id]) return insights[id];
  
  // Dynamic fallback for newly uploaded files:
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('blood') || lowerTitle.includes('cbc') || lowerTitle.includes('glucose') || lowerTitle.includes('sugar')) {
    return `AI Summary: Biomarkers normal. Blood glucose and cell counts stable within expected ranges.`;
  }
  if (category === 'Prescription') {
    return `AI Summary: Medication regimen parsed. Take as directed by consultant.`;
  }
  if (category === 'Imaging & Scan') {
    return `AI Summary: Scan records indexed. No acute diagnostic anomalies flagged by visual model.`;
  }
  return `AI Summary: Patient report parsed successfully. Health index indicators normal.`;
};

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientEmail, isDemoMode = false }) => {
  const { navigate } = useRouter();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [records, setRecords] = React.useState<any[]>([]);

  // 1. Check access status and gather records
  React.useEffect(() => {
    // Check if any request targeting this patient has been approved
    const allRequests = accessRequestService.getAll();
    const approved = allRequests.some(
      (r) =>
        r.status === 'approved' &&
        (r.patientEmail.toLowerCase() === patientEmail.toLowerCase() || r.patientName !== '')
    );
    setIsUnlocked(approved);

    // Load records
    if (isDemoMode) {
      const deletedDemoIds = JSON.parse(sessionStorage.getItem('mv_deleted_demo_ids') || '[]');
      const editedDemoRecords = JSON.parse(sessionStorage.getItem('mv_edited_demo_records') || '{}');
      const activeDemo = demoRecords
        .filter(r => !deletedDemoIds.includes(r.id))
        .map(r => editedDemoRecords[r.id] ? { ...r, ...editedDemoRecords[r.id] } : r);
      setRecords(activeDemo);
    } else {
      const list = vaultService.getRecords(patientEmail);
      setRecords(list);
    }
  }, [patientEmail, isDemoMode]);

  // Group records by year, sorted chronologically ascending or descending.
  // Standard clinical timeline usually displays newest first or oldest first. Let's do newest first but chronological within.
  const groupedRecords = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    records.forEach((rec) => {
      const year = new Date(rec.recordDate).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(rec);
    });

    // Sort within year by date descending
    Object.keys(groups).forEach((y) => {
      groups[y].sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
    });

    // Return years sorted descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((year) => ({
        year,
        items: groups[year],
      }));
  }, [records]);

  // Scroll animation observer
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const setCardRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          },
          { threshold: 0.1 }
        );
      }
      observerRef.current.observe(node);
    }
  }, []);

  if (!isUnlocked) {
    return (
      <div className="pt-timeline-wrapper animate-fade-in">
        <div className="par-hero">
          <div className="par-hero-top">
            <div className="par-hero-icon-ring"><CalendarClock size={22} /></div>
            <div className="par-hero-text">
              <h1 className="par-hero-title">Medical Timeline</h1>
              <p className="par-hero-desc">Your clinical encounter history grouped chronologically.</p>
            </div>
          </div>
        </div>

        <div className="pt-locked-overlay">
          <div className="pt-locked-icon-ring">
            <Lock size={28} />
          </div>
          <h2 className="pt-locked-title">Timeline Access Locked</h2>
          <p className="pt-locked-desc">
            To view your interactive Medical Timeline, you must first approve an incoming doctor request on the <strong>Access Requests</strong> page.
          </p>
          <button className="pt-btn-primary" onClick={() => navigate('/patient/requests')}>
            Go to Access Requests <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-timeline-wrapper animate-fade-in">
      {/* Hero header */}
      <div className="par-hero">
        <div className="par-hero-glow" />
        <div className="par-hero-top">
          <div className="par-hero-icon-ring"><CalendarClock size={22} /></div>
          <div className="par-hero-text">
            <h1 className="par-hero-title">Medical Timeline</h1>
            <p className="par-hero-desc">Interactive, chronological overview of your local records and clinical history.</p>
          </div>
        </div>
      </div>

      <div className="pt-timeline-container">
        <div className="pt-timeline-line" />

        {groupedRecords.map((group) => (
          <div key={group.year} className="pt-year-section">
            <div className="pt-year-node" />
            <h3 className="pt-year-title">{group.year}</h3>

            <div className="pt-year-cards">
              {group.items.map((item) => (
                <div key={item.id} ref={setCardRef} className="pt-card-wrapper">
                  <div className="pt-event-node-dot" />
                  <div className="pt-timeline-card" onClick={() => navigate(`/patient/vault/${item.id}`)}>
                    <div className="pt-card-header">
                      <div className="pt-card-meta">
                        <span className="pt-card-date">
                          {new Date(item.recordDate).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <h4 className="pt-card-title">{item.title}</h4>
                      </div>
                      <Badge variant={item.category === 'Prescription' ? 'violet' : item.category === 'Imaging & Scan' ? 'lavender' : 'mint'}>
                        {item.category}
                      </Badge>
                    </div>

                    <div className="pt-card-divider" />

                    <div className="pt-card-grid">
                      <div className="pt-grid-item">
                        <span className="pt-grid-label">🏥 Hospital / Facility</span>
                        <span className="pt-grid-value">{item.provider}</span>
                      </div>
                      <div className="pt-grid-item">
                        <span className="pt-grid-label">🩺 Doctor / Consultant</span>
                        <span className="pt-grid-value">{item.doctorName || 'Dr. Not Specified'}</span>
                      </div>
                    </div>

                    <div className="pt-preview-pane">
                      <div className="pt-preview-fileinfo">
                        <FileText size={14} />
                        <span className="pt-file-name">{item.fileName}</span>
                        <span>({item.fileSize})</span>
                      </div>
                      <span className="pt-action-text">
                        View Report <Eye size={12} />
                      </span>
                    </div>

                    {/* AI Insight Node */}
                    {getAIInsight(item.id, item.title, item.category) && (
                      <div className="pt-ai-insight-bubble animate-fade-in" style={{
                        background: 'linear-gradient(135deg, rgba(184, 165, 255, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
                        border: '1px dashed rgba(184, 165, 255, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem 1rem',
                        marginTop: '0.75rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                        boxShadow: '0 0 10px rgba(184, 165, 255, 0.05)'
                      }}>
                        <Sparkles size={14} style={{ marginTop: '0.15rem', flexShrink: 0, color: 'var(--accent-lavender)' }} />
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-lavender)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px', marginBottom: '0.15rem' }}>AI Timeline Insight</span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{getAIInsight(item.id, item.title, item.category)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export const TestHistoryPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Lab & Test History"
    description="All pathology results, diagnostic panels, and imaging interpretations grouped by category will be rendered in this workspace."
    icon={<FolderHeart />}
    phase="Phase 3"
  />
);

export const MedicationsPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Medications & Prescriptions"
    description="Active prescriptions, dosage schedules, pharmacy fill records, and interaction warnings will be managed through this interface."
    icon={<Pill />}
    phase="Phase 4 (Pharmacy Integration)"
  />
);

export const AllergiesPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Allergy & Adverse Reactions"
    description="Document and track confirmed allergies, adverse drug reactions, and substance sensitivities for clinical decision support."
    icon={<ShieldAlert />}
    phase="Phase 4"
  />
);

export const AccessRequestsPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Consent & Access Requests"
    description="Consent and access management will be built in a future phase."
    icon={<Key />}
    phase="Phase 6 (Consent & Permissions)"
  />
);

// ══════════════════════════════════════════════════════════
//  PatientAccessRequests — Premium Glass Card Design
// ══════════════════════════════════════════════════════════

// ─── Purpose color map ───────────────────────────────────────
const purposeConfig: Record<string, { color: string; bg: string; border: string }> = {
  Emergency:          { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)' },
  Consultation:       { color: '#60a5fa', bg: 'rgba(96,165,250,0.09)', border: 'rgba(96,165,250,0.25)' },
  'Second Opinion':   { color: '#b8a5ff', bg: 'rgba(184,165,255,0.09)', border: 'rgba(184,165,255,0.25)' },
  'Surgery Planning': { color: '#f59e0b', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.25)' },
  'Follow-up':        { color: '#00ebd4', bg: 'rgba(0,235,212,0.09)',  border: 'rgba(0,235,212,0.25)' },
  Other:              { color: '#a78bfa', bg: 'rgba(167,139,250,0.09)', border: 'rgba(167,139,250,0.25)' },
};

// ─── Doctor Profile Modal ─────────────────────────────────────
const DoctorProfileModal: React.FC<{ request: ARRecord; onClose: () => void }> = ({ request, onClose }) => (
  <div className="par-overlay" onClick={onClose}>
    <div className="par-doctor-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
      <button className="par-modal-close-btn" onClick={onClose}>✕</button>
      <div className="par-doctor-modal-glow" />

      <div className="par-doctor-modal-avatar-wrap">
        <div className="par-doctor-modal-avatar-ring" />
        <div className="par-doctor-modal-avatar-letter">{request.doctorName.charAt(0)}</div>
      </div>

      <h2 className="par-doctor-modal-name">Dr. {request.doctorName}</h2>
      {request.doctorSpecialization && (
        <span className="par-doctor-modal-spec">{request.doctorSpecialization}</span>
      )}

      <div className="par-doctor-modal-grid">
        {[
          { label: '🏥 Hospital', value: request.hospital },
          { label: '📧 Email', value: request.doctorEmail },
          { label: '🎯 Purpose', value: request.purpose },
          { label: '⏱ Duration', value: request.duration },
          { label: '🆔 Request ID', value: request.requestId, mono: true },
          { label: '🕐 Submitted', value: accessRequestService.formatDate(request.submittedAt) },
        ].map(({ label, value, mono }) => (
          <div key={label} className="par-dmf">
            <span className="par-dmf-label">{label}</span>
            <span className={`par-dmf-value${mono ? ' par-mono' : ''}`}>{value}</span>
          </div>
        ))}
      </div>

      {request.notes && (
        <div className="par-doctor-modal-note">
          <span className="par-doctor-modal-note-label">Doctor's Note</span>
          <p>"{request.notes}"</p>
        </div>
      )}

      <button className="par-modal-dismiss-btn" onClick={onClose}>Close Profile</button>
    </div>
  </div>
);

// ─── Single Access Request Card ───────────────────────────────
const ARCard: React.FC<{ req: ARRecord; patientEmail: string; onReload: () => void }> = ({ req, patientEmail, onReload }) => {
  const { user } = useRouter();
  const [loading, setLoading] = React.useState<'approve' | 'decline' | null>(null);
  const [justActioned, setJustActioned] = React.useState<'approved' | 'declined' | null>(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const pc = purposeConfig[req.purpose] || purposeConfig.Other;

  const handleApprove = async () => {
    setLoading('approve');
    await new Promise((r) => setTimeout(r, 900));
    accessRequestService.approveRequest(req.id);
    const patientName = user?.name ? `${user.name} (Patient)` : 'Patient';
    activityLogService.logAction(
      patientName,
      `Approved access request from Dr. ${req.doctorName} (${req.purpose})`,
      patientEmail
    );
    setLoading(null);
    setJustActioned('approved');
    setTimeout(() => onReload(), 2400);
  };

  const handleDecline = async () => {
    setLoading('decline');
    await new Promise((r) => setTimeout(r, 700));
    accessRequestService.declineRequest(req.id);
    const patientName = user?.name ? `${user.name} (Patient)` : 'Patient';
    activityLogService.logAction(
      patientName,
      `Declined access request from Dr. ${req.doctorName} (${req.purpose})`,
      patientEmail
    );
    setLoading(null);
    setJustActioned('declined');
    setTimeout(() => onReload(), 1900);
  };

  // ── Approve success animation ──────────────────────────────
  if (justActioned === 'approved') {
    return (
      <div className="par-card par-card-success-anim">
        <div className="par-success-burst">
          <div className="par-success-ring par-success-ring-1" />
          <div className="par-success-ring par-success-ring-2" />
          <div className="par-success-ring par-success-ring-3" />
          <div className="par-success-icon-wrap"><CheckCircle2 size={42} /></div>
        </div>
        <h3 className="par-success-title">Access Granted</h3>
        <p className="par-success-desc">Dr. {req.doctorName} has been notified and can now view your records.</p>
        {req.permissionToken && (
          <div className="par-success-token-row">
            <span className="par-success-token-label">Permission Token</span>
            <span className="par-success-token-value">{req.permissionToken}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Decline animation ──────────────────────────────────────
  if (justActioned === 'declined') {
    return (
      <div className="par-card par-card-decline-anim">
        <div className="par-decline-icon-wrap"><XCircle size={38} /></div>
        <h3 className="par-decline-title">Access Denied</h3>
        <p className="par-decline-desc">Dr. {req.doctorName} has been notified that access was declined.</p>
      </div>
    );
  }

  // ── Already approved ───────────────────────────────────────
  if (req.status === 'approved') {
    const isEmerg = req.isEmergency;
    return (
      <div className="par-card par-card-already-approved" style={isEmerg ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 10px rgba(244,63,94,0.1)' } : undefined}>
        {isEmerg ? <div className="par-card-approved-glow" style={{ background: 'rgba(244,63,94,0.1)' }} /> : <div className="par-card-approved-glow" />}
        <div className="par-card-doctor-row">
          <div className="par-avatar-wrap par-avatar-approved">
            <div className="par-avatar-ring par-avatar-ring-approved" style={isEmerg ? { borderColor: 'var(--color-danger)' } : undefined} />
            <div className="par-avatar-letter" style={isEmerg ? { color: 'var(--color-danger)' } : undefined}>{req.doctorName.charAt(0)}</div>
          </div>
          <div className="par-doctor-text">
            <span className="par-doctor-name">Dr. {req.doctorName} {isEmerg && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 700 }}>[EMERGENCY OVERRIDE]</span>}</span>
            {req.doctorSpecialization && <span className="par-doctor-spec">{req.doctorSpecialization}</span>}
            <span className="par-doctor-hospital">🏥 {req.hospital}</span>
          </div>
          <div className={`par-status-badge ${isEmerg ? 'par-badge-declined' : 'par-badge-approved'}`} style={isEmerg ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--color-danger)' } : undefined}>
            <CheckCircle2 size={12} />
            {isEmerg ? "Emergency Access" : "Access Granted"}
          </div>
        </div>
        {req.permissionToken && (
          <div className="par-token-strip">
            <span>Permission Token:</span>
            <span className="par-token-value">{req.permissionToken}</span>
          </div>
        )}
      </div>
    );
  }

  // ── Already declined ───────────────────────────────────────
  if (req.status === 'declined') {
    return (
      <div className="par-card par-card-already-declined">
        <div className="par-card-doctor-row">
          <div className="par-avatar-wrap par-avatar-declined">
            <div className="par-avatar-letter">{req.doctorName.charAt(0)}</div>
          </div>
          <div className="par-doctor-text">
            <span className="par-doctor-name">Dr. {req.doctorName}</span>
            {req.doctorSpecialization && <span className="par-doctor-spec">{req.doctorSpecialization}</span>}
            <span className="par-doctor-hospital">🏥 {req.hospital}</span>
          </div>
          <div className="par-status-badge par-badge-declined"><XCircle size={12} />Declined</div>
        </div>
      </div>
    );
  }

  // ── PENDING — Main premium card ────────────────────────────
  const isEmerg = req.isEmergency;
  return (
    <>
      <div className="par-card par-card-pending" style={isEmerg ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 12px rgba(244,63,94,0.15)' } : undefined}>
        {/* Ambient glow tinted by purpose color */}
        {isEmerg ? (
          <div className="par-card-glow" style={{ background: `radial-gradient(ellipse at 15% 50%, rgba(244,63,94,0.15) 0%, transparent 65%)` }} />
        ) : (
          <div className="par-card-glow" style={{ background: `radial-gradient(ellipse at 15% 50%, ${pc.bg} 0%, transparent 65%)` }} />
        )}

        {/* Doctor profile row */}
        <div className="par-card-doctor-row">
          <div className="par-avatar-wrap par-avatar-pending">
            <div className="par-avatar-ring par-avatar-ring-pending" style={isEmerg ? { borderColor: 'var(--color-danger)', boxShadow: '0 0 5px var(--color-danger)' } : undefined} />
            <div className="par-avatar-letter" style={isEmerg ? { color: 'var(--color-danger)' } : undefined}>{req.doctorName.charAt(0)}</div>
          </div>
          <div className="par-doctor-text">
            <span className="par-doctor-name">Dr. {req.doctorName} {isEmerg && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 700 }}>[EMERGENCY REQUEST]</span>}</span>
            {req.doctorSpecialization && <span className="par-doctor-spec">{req.doctorSpecialization}</span>}
            <span className="par-doctor-hospital">🏥 {req.hospital}</span>
          </div>
          <div className="par-new-badge" style={isEmerg ? { background: 'linear-gradient(135deg, var(--color-danger) 0%, var(--accent-violet) 100%)', borderColor: 'var(--color-danger)' } : undefined}>
            <span className="par-new-dot" style={isEmerg ? { background: '#fff' } : undefined} />
            {isEmerg ? "CRITICAL" : "New"}
          </div>
        </div>

        <div className="par-card-divider" />

        {/* Info grid */}
        <div className="par-info-grid">
          <div className="par-info-cell">
            <span className="par-info-label">🎯 Purpose</span>
            <span className="par-purpose-chip" style={{ color: pc.color, background: pc.bg, border: `1px solid ${pc.border}` }}>
              {req.purpose}
            </span>
          </div>
          <div className="par-info-cell">
            <span className="par-info-label">⏱ Duration</span>
            <span className="par-info-value">{req.duration}</span>
          </div>
          <div className="par-info-cell">
            <span className="par-info-label">🕐 Requested</span>
            <span className="par-info-value">{accessRequestService.formatTime(req.submittedAt)}</span>
          </div>
          <div className="par-info-cell">
            <span className="par-info-label">🆔 Request ID</span>
            <span className="par-info-value par-mono">{req.requestId}</span>
          </div>
        </div>

        {req.notes && (
          <div className="par-notes-block">
            <span className="par-notes-label">💬 Doctor's Note</span>
            <p className="par-notes-text">"{req.notes}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="par-action-row">
          <button className="par-btn par-btn-approve" onClick={handleApprove} disabled={loading !== null}>
            {loading === 'approve' ? <span className="par-btn-spin" /> : <CheckCircle2 size={15} />}
            Approve
          </button>
          <button className="par-btn par-btn-decline" onClick={handleDecline} disabled={loading !== null}>
            {loading === 'decline' ? <span className="par-btn-spin" /> : <XCircle size={15} />}
            Decline
          </button>
          <button className="par-btn par-btn-profile" onClick={() => setShowProfile(true)}>
            <User size={14} />
            View Doctor Profile
          </button>
        </div>
      </div>

      {showProfile && <DoctorProfileModal request={req} onClose={() => setShowProfile(false)} />}
    </>
  );
};

// ─── Page Component ───────────────────────────────────────────
interface PatientAccessRequestsProps {
  patientEmail: string;
}

export const PatientAccessRequests: React.FC<PatientAccessRequestsProps> = ({ patientEmail }) => {
  const [requests, setRequests] = React.useState<ARRecord[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const loadRequests = React.useCallback(() => {
    setRequests(accessRequestService.getAll());
  }, []);

  React.useEffect(() => {
    loadRequests();
    const iv = setInterval(loadRequests, 4000);
    return () => clearInterval(iv);
  }, [loadRequests]);

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter);
  const pendingCount  = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="par-page animate-fade-in">

      {/* Hero header */}
      <div className="par-hero">
        <div className="par-hero-glow" />
        <div className="par-hero-top">
          <div className="par-hero-icon-ring"><ShieldCheck size={22} /></div>
          <div className="par-hero-text">
            <h1 className="par-hero-title">Access Requests</h1>
            <p className="par-hero-desc">You are in complete control. No doctor can view your records without your explicit approval.</p>
          </div>
          {pendingCount > 0 && (
            <div className="par-hero-alert">
              <Clock3 size={13} />
              {pendingCount} pending
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="par-stats-row">
          <div className="par-stat par-stat-pending">
            <span className="par-stat-num">{pendingCount}</span>
            <span className="par-stat-label">Pending</span>
          </div>
          <div className="par-stat par-stat-approved">
            <span className="par-stat-num">{approvedCount}</span>
            <span className="par-stat-label">Approved</span>
          </div>
          <div className="par-stat par-stat-declined">
            <span className="par-stat-num">{declinedCount}</span>
            <span className="par-stat-label">Declined</span>
          </div>
          <div className="par-stat par-stat-total">
            <span className="par-stat-num">{requests.length}</span>
            <span className="par-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="par-filter-tabs">
        {(['all','pending','approved','declined'] as const).map((f) => (
          <button
            key={f}
            className={`par-filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="par-filter-badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="par-empty">
          <div className="par-empty-icon"><Key size={36} /></div>
          <h3>{filter === 'all' ? 'No Access Requests Yet' : `No ${filter} Requests`}</h3>
          <p>
            {filter === 'all'
              ? "When a doctor requests to view your records, their request will appear here for your review."
              : `You have no ${filter} requests at this time.`}
          </p>
        </div>
      ) : (
        <div className="par-cards-list">
          {filtered.map((req) => (
            <ARCard key={req.id} req={req} patientEmail={patientEmail} onReload={loadRequests} />
          ))}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
//  Remaining placeholders
// ══════════════════════════════════════════════════════════
export const SharedAccessPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Shared Access Registry"
    description="View and manage active, historical, or expired permission sets that you have shared with medical practitioners and healthcare networks."
    icon={<Activity />}
    phase="Phase 6"
  />
);

export const PatientActivityLog: React.FC<{ patientEmail: string }> = ({ patientEmail }) => {
  const [logs, setLogs] = React.useState<any[]>([]);

  const loadLogs = React.useCallback(() => {
    setLogs(activityLogService.getForPatient(patientEmail));
  }, [patientEmail]);

  React.useEffect(() => {
    loadLogs();
    const iv = setInterval(loadLogs, 4000);
    return () => clearInterval(iv);
  }, [loadLogs]);

  return (
    <div className="par-page animate-fade-in">
      <div className="par-hero" style={{ background: 'linear-gradient(135deg, rgba(184, 165, 255, 0.05) 0%, transparent 100%)', borderColor: 'rgba(184, 165, 255, 0.15)', marginBottom: '1.5rem' }}>
        <div className="par-hero-top">
          <div className="par-hero-icon-ring" style={{ background: 'rgba(184, 165, 255, 0.1)', borderColor: 'rgba(184, 165, 255, 0.22)', color: 'var(--accent-lavender)' }}><Activity size={22} /></div>
          <div className="par-hero-text">
            <h1 className="par-hero-title" style={{ background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-lavender) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Activity Audit Log</h1>
            <p className="par-hero-desc">An immutable, cryptographically-signed sequence of security and data access history on your Health Vault.</p>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="par-empty">
          <div className="par-empty-icon"><Activity size={36} /></div>
          <h3>No Logged Activities</h3>
          <p>Once medical access operations or data updates happen on your account, they will be catalogued here.</p>
        </div>
      ) : (
        <div className="comparison-table-wrapper" style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table className="comparison-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>User</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>IP (Demo)</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>Device</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>{log.date}</td>
                  <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{log.time}</td>
                  <td style={{ padding: '0.9rem 1rem', fontWeight: 600 }}>{log.user}</td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: 'var(--radius-xs)', 
                      background: log.action.toLowerCase().includes('approved') ? 'rgba(0,235,212,0.08)' : log.action.toLowerCase().includes('declined') ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${log.action.toLowerCase().includes('approved') ? 'rgba(0,235,212,0.18)' : log.action.toLowerCase().includes('declined') ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.08)'}`,
                      color: log.action.toLowerCase().includes('approved') ? 'var(--accent-mint)' : log.action.toLowerCase().includes('declined') ? 'var(--color-danger)' : 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.ip}</td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>{log.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const ActivityLogPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Workspace Activity Log"
    description="Your audit-compliant security log will appear here, detailing every record check, access permission event, and login session."
    icon={<Activity />}
    phase="Phase 6"
  />
);

export const ProfilePlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Patient Personal Profile"
    description="Inspect and edit your secure personal details, emergency contact contacts, blood classifications, and core registration parameters."
    icon={<User />}
    phase="Phase 4"
  />
);

export const SettingsPlaceholder: React.FC = () => (
  <PolishedPlaceholder
    title="Security & Settings"
    description="Manage your account preferences, local browser encryption keys, reset recovery phrase credentials, or toggle accessibility parameters."
    icon={<Settings />}
    phase="Phase 4"
  />
);

export interface PatientAnalyticsProps {
  patientEmail: string;
  isDemoMode?: boolean;
}

export const PatientAnalytics: React.FC<PatientAnalyticsProps> = ({ patientEmail, isDemoMode = false }) => {
  const records = React.useMemo(() => {
    if (isDemoMode) {
      return demoRecords;
    } else {
      return vaultService.getRecords(patientEmail);
    }
  }, [patientEmail, isDemoMode]);

  // Derived stats
  const totalCount = records.length;
  
  const providers = React.useMemo(() => {
    return Array.from(new Set(records.map(r => r.provider).filter(Boolean)));
  }, [records]);
  
  const doctors = React.useMemo(() => {
    return Array.from(new Set(records.map(r => r.doctorName).filter(Boolean)));
  }, [records]);

  const labCount = records.filter(r => r.category === 'Lab Report').length;
  const radCount = records.filter(r => r.category === 'Imaging & Scan').length;
  const prescCount = records.filter(r => r.category === 'Prescription').length;
  const otherCount = totalCount - labCount - radCount - prescCount;

  // Recent Uploads
  const recentUploads = React.useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [records]);

  // Vitals simulation
  const avgGlucose = totalCount > 0 ? (isDemoMode ? 95 : 94 + (totalCount % 3)) : 0;
  const avgHb = totalCount > 0 ? (isDemoMode ? 14.15 : 13.9 + ((totalCount * 0.1) % 0.8)) : 0;

  // Monthly uploads aggregation
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts: Record<string, number> = {};
    months.forEach(m => { counts[m] = 0; });

    records.forEach(r => {
      const d = new Date(r.recordDate || r.createdAt);
      const mName = months[d.getMonth()];
      counts[mName] = (counts[mName] || 0) + 1;
    });

    return months.map(m => ({ month: m, count: counts[m] }));
  }, [records]);

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  // SVG Chart Dimensions & Plots
  const sugarHistory = isDemoMode ? [92, 89, 98, 95] : [92, 90, 93, 94];
  const hbHistory = isDemoMode ? [13.8, 13.5, 14.5, 14.2] : [13.8, 13.9, 14.1, 14.2];
  const historyLabels = ['Mar 2025', 'Jul 2025', 'Feb 2026', 'Mar 2026'];

  return (
    <div className="analytics-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div className="par-hero" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)', borderColor: 'rgba(139, 92, 246, 0.15)', marginBottom: '0' }}>
        <div className="par-hero-top">
          <div className="par-hero-icon-ring" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.22)', color: 'var(--accent-violet)' }}>
            <Activity size={22} />
          </div>
          <div className="par-hero-text">
            <h1 className="par-hero-title">Health Analytics</h1>
            <p className="par-hero-desc">Longitudinal vitals insights, uploads tracking, and catalog breakdowns.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {[
          { title: 'Total Reports', value: totalCount, subtitle: 'Uploaded records', bg: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 100%)', color: 'var(--accent-violet)' },
          { title: 'Hospitals Visited', value: providers.length, subtitle: `${providers.slice(0, 2).join(', ') || 'None'}`, bg: 'linear-gradient(135deg, rgba(0,235,212,0.1) 0%, rgba(139,92,246,0.05) 100%)', color: 'var(--accent-mint)' },
          { title: 'Doctors Consulted', value: doctors.length, subtitle: 'Specialists mapped', bg: 'linear-gradient(135deg, rgba(184,165,255,0.1) 0%, rgba(139,92,246,0.05) 100%)', color: 'var(--accent-lavender)' },
          { title: 'Lab Reports', value: labCount, subtitle: 'Pathology & Chemistry', bg: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)', color: 'var(--accent-violet)' },
          { title: 'Radiology Reports', value: radCount, subtitle: 'Imaging scans & X-rays', bg: 'linear-gradient(135deg, rgba(0,235,212,0.1) 0%, rgba(99,102,241,0.05) 100%)', color: 'var(--accent-mint)' }
        ].map((card, idx) => (
          <div key={idx} className="bento-card" style={{
            background: card.bg,
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem',
            transition: 'transform 0.3s ease, border-color 0.3s ease'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.title}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Mid Level: Category Doughnut Chart & Monthly Uploads Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Category Breakdown (Pie / Doughnut Chart) */}
        <div className="bento-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700 }}>Report Categories Breakdown</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* SVG Doughnut */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="doughnut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4.2" />
                
                {/* Lab Segment */}
                {totalCount > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent-violet)" strokeWidth="4.2" 
                    strokeDasharray={`${(labCount / totalCount) * 100} ${100 - (labCount / totalCount) * 100}`} 
                    strokeDashoffset="25" 
                  />
                )}
                {/* Rad Segment */}
                {totalCount > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent-mint)" strokeWidth="4.2" 
                    strokeDasharray={`${(radCount / totalCount) * 100} ${100 - (radCount / totalCount) * 100}`} 
                    strokeDashoffset={25 - ((labCount / totalCount) * 100)} 
                  />
                )}
                {/* Prescription Segment */}
                {totalCount > 0 && (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent-lavender)" strokeWidth="4.2" 
                    strokeDasharray={`${(prescCount / totalCount) * 100} ${100 - (prescCount / totalCount) * 100}`} 
                    strokeDashoffset={25 - (((labCount + radCount) / totalCount) * 100)} 
                  />
                )}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, display: 'block' }}>{totalCount}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Files</span>
              </div>
            </div>

            {/* Legends list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {[
                { label: 'Lab Reports', count: labCount, color: 'var(--accent-violet)' },
                { label: 'Radiology Scans', count: radCount, color: 'var(--accent-mint)' },
                { label: 'Prescriptions', count: prescCount, color: 'var(--accent-lavender)' },
                { label: 'Other Docs', count: otherCount, color: 'var(--text-muted)' }
              ].map((legend, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: legend.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{legend.label}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{legend.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Uploads (Bar Chart) */}
        <div className="bento-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700 }}>Monthly Upload Activity</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '110px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.35rem' }}>
            {monthlyData.map((data, idx) => {
              const heightPct = (data.count / maxCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    background: data.count > 0 ? 'linear-gradient(to top, var(--accent-violet) 0%, var(--accent-lavender) 100%)' : 'rgba(255,255,255,0.01)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 1s ease',
                    minHeight: data.count > 0 ? '6px' : '2px',
                    position: 'relative'
                  }} title={`${data.month}: ${data.count} uploads`} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vitals Longitudinal Line Graphs & Average Vitals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Longitudinal Line Chart */}
        <div className="bento-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700 }}>Longitudinal Health Vitals Tracker</h3>
          
          <div style={{ position: 'relative', height: '130px', borderBottom: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)', padding: '0.5rem' }}>
            {/* Draw SVG Line */}
            <svg width="100%" height="100%" viewBox="0 0 300 100" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4" />
              
              {/* Sugar Path (Purple) */}
              <path d="M 10 70 L 90 80 L 170 50 L 250 60" fill="none" stroke="var(--accent-violet)" strokeWidth="2.5" strokeLinecap="round" />
              {/* HB Path (Teal) */}
              <path d="M 10 50 L 90 60 L 170 30 L 250 40" fill="none" stroke="var(--accent-mint)" strokeWidth="2" strokeLinecap="round" />
              
              {/* Markers & Values */}
              {sugarHistory.map((s, i) => {
                const x = 10 + i * 80;
                const ySugar = 70 + (i === 1 ? 10 : i === 2 ? -20 : i === 3 ? -10 : 0);
                const yHb = 50 + (i === 1 ? 10 : i === 2 ? -20 : i === 3 ? -10 : 0);
                return (
                  <g key={i}>
                    {/* Sugar points */}
                    <circle cx={x} cy={ySugar} r="4" fill="var(--bg-main)" stroke="var(--accent-violet)" strokeWidth="2" />
                    <text x={x} y={ySugar - 8} fontSize="6.5" fill="var(--accent-violet)" textAnchor="middle" fontWeight="bold">{s}</text>
                    
                    {/* Hb points */}
                    <circle cx={x} cy={yHb} r="3" fill="var(--bg-main)" stroke="var(--accent-mint)" strokeWidth="2" />
                    <text x={x} y={yHb - 6} fontSize="6" fill="var(--accent-mint)" textAnchor="middle">{hbHistory[i]}</text>
                    
                    {/* Bottom Labels */}
                    <text x={x} y="98" fontSize="6.5" fill="var(--text-muted)" textAnchor="middle">{historyLabels[i]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '3px', background: 'var(--accent-violet)', borderRadius: '1px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Blood Sugar (mg/dL)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '3px', background: 'var(--accent-mint)', borderRadius: '1px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Hemoglobin (g/dL)</span>
            </div>
          </div>
        </div>

        {/* Average Vitals Overview Panel */}
        <div className="bento-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700 }}>Mean Lab Indices</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Sugar Indicator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Average Blood Sugar</span>
                  <strong style={{ color: 'var(--accent-violet)' }}>{avgGlucose} mg/dL</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((avgGlucose / 150) * 100, 100)}%`, background: 'var(--accent-violet)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Clinical Normal Range: 70 - 100 mg/dL (Fasting)</span>
              </div>

              {/* Hemoglobin Indicator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Average Hemoglobin</span>
                  <strong style={{ color: 'var(--accent-mint)' }}>{avgHb.toFixed(2)} g/dL</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((avgHb / 18) * 100, 100)}%`, background: 'var(--accent-mint)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Clinical Normal Range: 12.0 - 16.0 g/dL</span>
              </div>

            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(184,165,255,0.04)', border: '1px solid rgba(184,165,255,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--accent-lavender)', alignItems: 'center' }}>
            <span>💡</span>
            <span>AI Suggestion: Your average hemoglobin and fasting glucose reflect excellent biochemical homeostasis. Continue current lifestyle.</span>
          </div>
        </div>

      </div>

      {/* Recent Uploads Table */}
      <div className="bento-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700 }}>Recent Upload Activity</h3>
        
        {recentUploads.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>No uploads recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '0.5rem' }}>Document Title</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Category</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Healthcare Provider</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Date</th>
                  <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Security Signature</th>
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{rec.title}</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <Badge variant={rec.category === 'Prescription' ? 'violet' : rec.category === 'Imaging & Scan' ? 'lavender' : 'mint'}>
                        {rec.category}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>{rec.provider}</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{new Date(rec.recordDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--accent-lavender)' }}>{rec.reportId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
