import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Activity, FileText, Bell, ShieldCheck, Brain, Send, CheckCircle2, XCircle, Clock3, RefreshCw
} from 'lucide-react';
import type { UserProfile } from '../../services/authService';
import { useRouter } from '../../context/RouterContext';
import {
  accessRequestService
} from '../../services/accessRequestService';
import { activityLogService } from '../../services/activityLogService';
import { vaultService } from '../../services/vaultService';
import type {
  AccessRequest as ARRecord,
  AccessRequestPurpose,
  AccessRequestDuration,
  AccessRequestStatus
} from '../../services/accessRequestService';

// 1. Fully Functional Patient Search & Medical Timeline View
import { 
  ArrowLeft, Phone, Pill, Heart, X, ShieldAlert, Download, Eye, Printer, Share2, Sparkles, AlertCircle
} from 'lucide-react';

interface TimelineRecord {
  id: string;
  date: string;
  title: string;
  category: string;
  provider: string;
  doctor: string;
  type: 'lab' | 'imaging' | 'prescription' | 'consultation';
  details: React.ReactNode;
}

interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  uhid: string;
  abhaId: string;
  phone: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string[];
  medications: string[];
  hospitalVisits: string;
  lastVisit: string;
  timeline: TimelineRecord[];
}

// ─── Access Request Modal ────────────────────────────────────────────────────
interface AccessRequestModalProps {
  patient: PatientProfile;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialization?: string;
  hospital: string;
  onClose: () => void;
  onSubmitted: () => void;
}

const AccessRequestModal: React.FC<AccessRequestModalProps> = ({
  patient,
  doctorName,
  doctorEmail,
  doctorSpecialization,
  hospital,
  onClose,
  onSubmitted,
}) => {
  const [purpose, setPurpose] = useState<AccessRequestPurpose>('Consultation');
  const [duration, setDuration] = useState<AccessRequestDuration>('24 Hours');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReq, setSubmittedReq] = useState<ARRecord | null>(null);
  const [isEmergencyOverride, setIsEmergencyOverride] = useState(false);
  const [hospitalId, setHospitalId] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700)); // UI feedback delay
    
    const isOverride = purpose === 'Emergency' && isEmergencyOverride;
    
    if (isOverride && !hospitalId.trim()) {
      alert('Hospital ID is required for Emergency Override activation.');
      setIsLoading(false);
      return;
    }

    const req = accessRequestService.createRequest({
      doctorName,
      doctorEmail,
      doctorSpecialization,
      hospital,
      purpose,
      duration: isOverride ? '24 Hours' : duration,
      notes: notes.trim() || undefined,
      patientName: patient.name,
      patientEmail: `${patient.uhid.toLowerCase()}@medivault.app`,
      patientUhid: patient.uhid,
    });

    if (isOverride) {
      // Modify request details to set it approved and flag emergency
      const all = accessRequestService.getAll();
      const updated = all.map(r => {
        if (r.id === req.id) {
          return {
            ...r,
            status: 'approved' as AccessRequestStatus,
            isEmergency: true,
            hospitalId: hospitalId.trim(),
            approvedAt: new Date().toISOString(),
            permissionToken: `MV-EMERG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          };
        }
        return r;
      });
      accessRequestService.saveAll(updated);
      
      activityLogService.logAction(
        `Dr. ${doctorName} (Clinician)`,
        `Activated EMERGENCY OVERRIDE (Hospital ID: ${hospitalId.trim()}) for ${patient.name}`,
        `${patient.uhid.toLowerCase()}@medivault.app`
      );
    } else {
      activityLogService.logAction(
        `Dr. ${doctorName} (Clinician)`,
        purpose === 'Emergency' 
          ? `Requested Emergency access to ${patient.name}'s records`
          : `Requested access to ${patient.name}'s records`,
        `${patient.uhid.toLowerCase()}@medivault.app`
      );
    }

    setIsLoading(false);
    setSubmitted(true);
    // Find the latest copy to display token if approved
    const finalReq = isOverride 
      ? accessRequestService.getLatestRequest(doctorEmail, patient.uhid)
      : req;
    setSubmittedReq(finalReq);
    setTimeout(() => { onSubmitted(); onClose(); }, 2800);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    padding: '0.6rem 0.75rem',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  return (
    <div className="ar-modal-overlay" onClick={onClose}>
      <div className="ar-modal-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ar-modal-header">
          <div className="ar-modal-title-group">
            <div className="ar-modal-icon-ring">
              <Send size={18} className="text-violet" />
            </div>
            <div>
              <h3 className="ar-modal-title">Request Medical Record Access</h3>
              <p className="ar-modal-subtitle">Requesting access to <strong>{patient.name}</strong>'s records</p>
            </div>
          </div>
          <button className="ar-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Patient Info Strip */}
        <div className="ar-patient-strip">
          <div className="ar-patient-avatar">{patient.name.charAt(0)}</div>
          <div className="ar-patient-info">
            <span className="ar-patient-name">{patient.name}</span>
            <span className="ar-patient-meta">{patient.uhid} &bull; {patient.age} yrs, {patient.gender}</span>
          </div>
          <Badge variant="lavender">{patient.bloodGroup}</Badge>
        </div>

        {submitted && submittedReq ? (
          /* Success State */
          <div className="ar-success-state animate-fade-in">
            <div className="ar-success-icon">
              <CheckCircle2 size={40} className="text-mint" />
            </div>
            <h4 className="ar-success-title">Request Sent Successfully</h4>
            <p className="ar-success-desc">Your access request has been sent to {patient.name}. You will be notified once they approve.</p>
            <div className="ar-success-token-row">
              <span className="ar-token-label">Request ID</span>
              <span className="ar-token-value">{submittedReq.requestId}</span>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="ar-modal-form">
            {/* Purpose Dropdown */}
            <div className="ar-field">
              <label className="ar-field-label">Purpose of Access</label>
              <select
                value={purpose}
                onChange={(e) => {
                  const val = e.target.value as AccessRequestPurpose;
                  setPurpose(val);
                  if (val !== 'Emergency') {
                    setIsEmergencyOverride(false);
                  }
                }}
                style={inputStyle}
                className="ar-select"
              >
                {(['Consultation','Emergency','Second Opinion','Surgery Planning','Follow-up','Other'] as AccessRequestPurpose[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Emergency Mode Selection */}
            {purpose === 'Emergency' && (
              <div className="ar-field">
                <label className="ar-field-label" style={{ color: 'var(--color-danger)' }}>Emergency Access Protocol</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    className={`ar-duration-chip ${!isEmergencyOverride ? 'selected' : ''}`}
                    style={{ borderColor: !isEmergencyOverride ? 'var(--accent-violet)' : 'var(--border-medium)' }}
                    onClick={() => setIsEmergencyOverride(false)}
                  >
                    Request Consent
                  </button>
                  <button
                    type="button"
                    className={`ar-duration-chip ${isEmergencyOverride ? 'selected' : ''}`}
                    style={{ 
                      borderColor: isEmergencyOverride ? 'var(--color-danger)' : 'var(--border-medium)',
                      color: isEmergencyOverride ? 'var(--color-danger)' : 'var(--text-primary)'
                    }}
                    onClick={() => setIsEmergencyOverride(true)}
                  >
                    🏥 Emergency Override
                  </button>
                </div>
              </div>
            )}

            {/* Duration Radio */}
            {!isEmergencyOverride && (
              <div className="ar-field">
                <label className="ar-field-label">Access Duration</label>
                <div className="ar-duration-grid">
                  {(['1 Hour', '24 Hours', '7 Days'] as AccessRequestDuration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`ar-duration-chip ${duration === d ? 'selected' : ''}`}
                      onClick={() => setDuration(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Override Form details */}
            {purpose === 'Emergency' && isEmergencyOverride && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.4 }}>
                  <span>⚠️</span>
                  <span>CLINICAL OVERRIDE NOTICE: Bypassing patient consent. This event will be logged permanently and highlighted in red. Access will automatically expire in 2 hours.</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ShieldCheck size={11} /> Verified Doctor
                  </Badge>
                  <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <ShieldCheck size={11} /> Verified Hospital
                  </Badge>
                </div>

                <div className="ar-field" style={{ margin: 0 }}>
                  <label className="ar-field-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hospital License / ID (Required)</label>
                  <input
                    type="text"
                    placeholder="e.g. HOSP-12948-AB"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    style={{ ...inputStyle, borderColor: 'rgba(244,63,94,0.25)', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="ar-field">
              <label className="ar-field-label">Additional Notes <span className="ar-optional">(Optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isEmergencyOverride ? "Describe the clinical nature of this emergency override..." : "Briefly describe the clinical reason for this request..."}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Doctor Info (auto-filled) */}
            <div className="ar-autofill-row">
              <div className="ar-autofill-item">
                <span className="ar-autofill-label">Requesting Doctor</span>
                <span className="ar-autofill-value">Dr. {doctorName}</span>
              </div>
              <div className="ar-autofill-item">
                <span className="ar-autofill-label">Hospital / Facility</span>
                <span className="ar-autofill-value">{hospital}</span>
              </div>
            </div>

            {/* Warning Notice */}
            {isEmergencyOverride ? (
              <div className="ar-notice" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)', color: 'var(--color-danger)' }}>
                <AlertCircle size={14} className="ar-notice-icon" style={{ color: 'var(--color-danger)' }} />
                <span>Override active. Bypassing standard user approval under medical emergency authority.</span>
              </div>
            ) : (
              <div className="ar-notice">
                <ShieldCheck size={14} className="ar-notice-icon" />
                <span>{purpose === 'Emergency' ? "This high-priority emergency request will trigger critical banners on the patient's vault." : "This request will be sent directly to the patient for review. You cannot view any records until they approve."}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              variant={isEmergencyOverride ? "mint" : "primary"}
              size="md"
              style={{ 
                width: '100%', 
                marginTop: '0.25rem',
                background: isEmergencyOverride ? 'linear-gradient(135deg, var(--color-danger) 0%, var(--accent-violet) 100%)' : undefined,
                borderColor: isEmergencyOverride ? 'var(--color-danger)' : undefined,
              }}
              onClick={handleSubmit}
              isLoading={isLoading}
              icon={isEmergencyOverride ? <AlertCircle size={14} /> : <Send size={14} />}
            >
              {isEmergencyOverride ? "Activate Emergency Override" : "Send Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
interface BiomarkerValue {
  name: string;
  value: string;
  numeric: number;
  unit: string;
  refRange: string;
  type: 'higher-is-better' | 'lower-is-better';
}

const REPORT_DATA: Record<string, Record<string, BiomarkerValue>> = {
  'rec-cbc': {
    'hemoglobin': { name: 'Hemoglobin', value: '12.8', numeric: 12.8, unit: 'g/dL', refRange: '12.0 - 15.5', type: 'higher-is-better' },
    'rbc': { name: 'Red Blood Cells (RBC)', value: '4.2', numeric: 4.2, unit: 'x10⁶/µL', refRange: '3.8 - 5.1', type: 'higher-is-better' },
    'wbc': { name: 'White Blood Cells (WBC)', value: '6.4', numeric: 6.4, unit: 'x10³/µL', refRange: '4.5 - 11.0', type: 'lower-is-better' },
    'platelets': { name: 'Platelets', value: '280', numeric: 280, unit: 'x10³/µL', refRange: '150 - 450', type: 'higher-is-better' },
    'vitD': { name: 'Vitamin D3 (25-OH)', value: '24.5', numeric: 24.5, unit: 'ng/mL', refRange: '> 30.0', type: 'higher-is-better' },
    'vitB12': { name: 'Vitamin B12', value: '380', numeric: 380, unit: 'pg/mL', refRange: '200 - 900', type: 'higher-is-better' },
    'glucose': { name: 'Fasting Blood Sugar', value: '105', numeric: 105, unit: 'mg/dL', refRange: '70 - 100', type: 'lower-is-better' },
    'alt': { name: 'SGPT (ALT) - Liver', value: '42', numeric: 42, unit: 'U/L', refRange: '7 - 35', type: 'lower-is-better' },
    'ast': { name: 'SGOT (AST) - Liver', value: '38', numeric: 38, unit: 'U/L', refRange: '8 - 33', type: 'lower-is-better' },
    'creatinine': { name: 'Serum Creatinine - Kidney', value: '1.15', numeric: 1.15, unit: 'mg/dL', refRange: '0.50 - 1.10', type: 'lower-is-better' },
    'bun': { name: 'BUN (Blood Urea Nitrogen)', value: '22', numeric: 22, unit: 'mg/dL', refRange: '7 - 20', type: 'lower-is-better' }
  },
  'rec-cbc-jul-2025': {
    'hemoglobin': { name: 'Hemoglobin', value: '14.1', numeric: 14.1, unit: 'g/dL', refRange: '12.0 - 15.5', type: 'higher-is-better' },
    'rbc': { name: 'Red Blood Cells (RBC)', value: '4.5', numeric: 4.5, unit: 'x10⁶/µL', refRange: '3.8 - 5.1', type: 'higher-is-better' },
    'wbc': { name: 'White Blood Cells (WBC)', value: '6.4', numeric: 6.4, unit: 'x10³/µL', refRange: '4.5 - 11.0', type: 'lower-is-better' },
    'platelets': { name: 'Platelets', value: '140', numeric: 140, unit: 'x10³/µL', refRange: '150 - 450', type: 'higher-is-better' },
    'vitD': { name: 'Vitamin D3 (25-OH)', value: '32.0', numeric: 32.0, unit: 'ng/mL', refRange: '> 30.0', type: 'higher-is-better' },
    'vitB12': { name: 'Vitamin B12', value: '380', numeric: 380, unit: 'pg/mL', refRange: '200 - 900', type: 'higher-is-better' },
    'glucose': { name: 'Fasting Blood Sugar', value: '90', numeric: 90, unit: 'mg/dL', refRange: '70 - 100', type: 'lower-is-better' },
    'alt': { name: 'SGPT (ALT) - Liver', value: '28', numeric: 28, unit: 'U/L', refRange: '7 - 35', type: 'lower-is-better' },
    'ast': { name: 'SGOT (AST) - Liver', value: '21', numeric: 21, unit: 'U/L', refRange: '8 - 33', type: 'lower-is-better' },
    'creatinine': { name: 'Serum Creatinine - Kidney', value: '0.85', numeric: 0.85, unit: 'mg/dL', refRange: '0.50 - 1.10', type: 'lower-is-better' },
    'bun': { name: 'BUN (Blood Urea Nitrogen)', value: '14', numeric: 14, unit: 'mg/dL', refRange: '7 - 20', type: 'lower-is-better' }
  },
  'rec-vit': {
    'vitD': { name: 'Vitamin D3 (25-OH)', value: '24.5', numeric: 24.5, unit: 'ng/mL', refRange: '> 30.0', type: 'higher-is-better' },
    'vitB12': { name: 'Vitamin B12', value: '380', numeric: 380, unit: 'pg/mL', refRange: '200 - 900', type: 'higher-is-better' }
  }
};

interface DoctorReportComparisonProps {
  patient: PatientProfile;
  onBack: () => void;
}

export const DoctorReportComparison: React.FC<DoctorReportComparisonProps> = ({ patient, onBack }) => {
  const { user } = useRouter();
  const doctorName = user?.name || 'Roseanne Park';
  const labReports = patient.timeline.filter(r => r.type === 'lab');
  const [reportAId, setReportAId] = useState<string>(labReports[0]?.id || '');
  const [reportBId, setReportBId] = useState<string>(labReports[1]?.id || labReports[0]?.id || '');

  const reportA = labReports.find(r => r.id === reportAId);
  const reportB = labReports.find(r => r.id === reportBId);

  const dataA = reportAId ? REPORT_DATA[reportAId] : undefined;
  const dataB = reportBId ? REPORT_DATA[reportBId] : undefined;

  const handlePrint = () => {
    activityLogService.logAction(
      `Dr. ${doctorName} (Clinician)`,
      `Downloaded comparison report (Baseline: ${reportA?.title || 'Report A'} vs Comparison: ${reportB?.title || 'Report B'})`,
      `${patient.uhid.toLowerCase()}@medivault.app`
    );
    window.print();
  };

  const renderTrend = (key: string) => {
    const valA = dataA?.[key];
    const valB = dataB?.[key];
    if (!valA || !valB) return <span className="trend-badge trend-no-data">Not tested</span>;
    if (valA.numeric === valB.numeric) return <span className="trend-badge trend-no-change">No Change</span>;
    
    let isImproved = false;
    if (valA.type === 'higher-is-better') {
      isImproved = valB.numeric > valA.numeric;
    } else {
      isImproved = valB.numeric < valA.numeric;
    }

    if (isImproved) {
      return <span className="trend-badge trend-improved">▲ Improved</span>;
    } else {
      return <span className="trend-badge trend-worsened">▼ Worsened</span>;
    }
  };

  const renderValueCell = (data: Record<string, BiomarkerValue> | undefined, key: string) => {
    const item = data?.[key];
    if (!item) return <td style={{ color: 'var(--text-muted)' }}>—</td>;
    
    // Check reference range status
    let isNormal = true;
    if (key === 'glucose') isNormal = item.numeric <= 100;
    else if (key === 'vitD') isNormal = item.numeric >= 30;
    else if (key === 'alt') isNormal = item.numeric <= 35;
    else if (key === 'ast') isNormal = item.numeric <= 33;
    else if (key === 'creatinine') isNormal = item.numeric <= 1.1;
    else if (key === 'bun') isNormal = item.numeric <= 20;
    else if (key === 'platelets') isNormal = item.numeric >= 150 && item.numeric <= 450;
    
    return (
      <td>
        <strong>{item.value}</strong>
        <span className="biomarker-unit">{item.unit}</span>
        {!isNormal && <Badge variant="warning" style={{ marginLeft: '0.5rem', scale: '0.85' }}>OOR</Badge>}
      </td>
    );
  };

  const renderRow = (key: string, label: string, refRange: string) => {
    return (
      <tr>
        <td className="biomarker-name">{label}</td>
        {renderValueCell(dataA, key)}
        {renderValueCell(dataB, key)}
        <td>{renderTrend(key)}</td>
        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{refRange}</td>
      </tr>
    );
  };

  return (
    <div id="printable-comparison-area" className="comparison-container animate-fade-in">
      <div className="section-title-row non-printable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Biomarker Comparison Matrix</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyze longitudinal changes in patient vitals and chemistry parameters</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button variant="mint" size="sm" onClick={handlePrint} icon={<Download size={14} />}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="print-header" style={{ display: 'none' }}>
        <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--accent-violet)' }}>MediVault Clinical Comparison Report</h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Patient: <strong>{patient.name}</strong> ({patient.uhid}) &bull; Generated on: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card className="comparison-selection-card non-printable" padding="md">
        <div className="comparison-selectors">
          <div className="selector-field">
            <label>Baseline Report (A)</label>
            <select className="selector-dropdown" value={reportAId} onChange={(e) => setReportAId(e.target.value)}>
              {labReports.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.date})</option>
              ))}
            </select>
          </div>
          
          <div className="vs-divider">VS</div>

          <div className="selector-field">
            <label>Comparison Report (B)</label>
            <select className="selector-dropdown" value={reportBId} onChange={(e) => setReportBId(e.target.value)}>
              {labReports.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.date})</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Biomarker / Param</th>
              <th>{reportA ? `${reportA.title} (${reportA.date})` : 'Report A'}</th>
              <th>{reportB ? `${reportB.title} (${reportB.date})` : 'Report B'}</th>
              <th>Trend Analysis</th>
              <th>Ref Range</th>
            </tr>
          </thead>
          <tbody>
            {/* Hematology */}
            <tr className="category-row">
              <td colSpan={5}>Hematology Panel</td>
            </tr>
            {renderRow('hemoglobin', 'Hemoglobin (Hb)', '12.0 - 15.5 g/dL')}
            {renderRow('rbc', 'Red Blood Cells (RBC)', '3.8 - 5.1 x10⁶/µL')}
            {renderRow('wbc', 'White Blood Cells (WBC)', '4.5 - 11.0 x10³/µL')}
            {renderRow('platelets', 'Platelet Count', '150 - 450 x10³/µL')}

            {/* Vitamins */}
            <tr className="category-row">
              <td colSpan={5}>Vitamin Assay Indices</td>
            </tr>
            {renderRow('vitD', 'Vitamin D3 (25-OH)', '> 30.0 ng/mL')}
            {renderRow('vitB12', 'Vitamin B12', '200 - 900 pg/mL')}

            {/* Sugar */}
            <tr className="category-row">
              <td colSpan={5}>Glycemic / Sugar Panel</td>
            </tr>
            {renderRow('glucose', 'Fasting Blood Sugar', '70 - 100 mg/dL')}

            {/* Liver */}
            <tr className="category-row">
              <td colSpan={5}>Liver Function Index</td>
            </tr>
            {renderRow('alt', 'SGPT (ALT) - Liver', '7 - 35 U/L')}
            {renderRow('ast', 'SGOT (AST) - Liver', '8 - 33 U/L')}

            {/* Kidney */}
            <tr className="category-row">
              <td colSpan={5}>Renal / Kidney Function</td>
            </tr>
            {renderRow('creatinine', 'Serum Creatinine', '0.50 - 1.10 mg/dL')}
            {renderRow('bun', 'BUN (Blood Urea Nitrogen)', '7 - 20 mg/dL')}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export const DoctorPatientSearch: React.FC = () => {
  const { user } = useRouter();
  const onboarding = user?.onboardingData || {};
  const doctorName = user?.name || 'Roseanne Park';
  const doctorEmail = user?.email || 'doctor@medivault.app';
  const hospital = (onboarding.hospital as string) || 'CityCare Hospital';
  const doctorSpecialization = (onboarding.specialization as string) || 'General Medicine';


  const [queryName, setQueryName] = useState('');
  const [queryUhid, setQueryUhid] = useState('');
  const [queryAbha, setQueryAbha] = useState('');
  const [queryPhone, setQueryPhone] = useState('');
  
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TimelineRecord | null>(null);
  const [verifiedRecordId, setVerifiedRecordId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  // Access Request Modal state
  const [arModalPatient, setArModalPatient] = useState<PatientProfile | null>(null);

  // Pre-seed Nandeni Tiwari approved access request for easy testing
  useEffect(() => {
    const all = accessRequestService.getAll();
    const hasNandeni = all.some(r => r.patientUhid === 'UHID-988319-A' && r.doctorEmail.toLowerCase() === doctorEmail.toLowerCase());
    if (!hasNandeni) {
      accessRequestService.saveAll([
        {
          id: 'req-nandeni-seed',
          requestId: 'REQ-NDN123',
          doctorName: doctorName,
          doctorEmail: doctorEmail,
          doctorSpecialization: doctorSpecialization,
          hospital: hospital,
          purpose: 'Follow-up',
          duration: '7 Days',
          patientName: 'Nandeni Tiwari',
          patientEmail: 'nandeni.tiwari@medivault.app',
          patientUhid: 'UHID-988319-A',
          submittedAt: new Date().toISOString(),
          status: 'approved',
          permissionToken: 'MV-PERM-NDN123'
        },
        ...all
      ]);
    }
  }, [doctorEmail, doctorName, doctorSpecialization, hospital]);
  // Track which patients the doctor has sent requests to (keyed by uhid)
  const [_requestSentMap, setRequestSentMap] = useState<Record<string, boolean>>(() => {
    // Pre-populate from existing service data on mount
    const existing = accessRequestService.getRequestsForDoctor(doctorEmail);
    const map: Record<string, boolean> = {};
    existing.forEach((r) => { map[r.patientUhid] = true; });
    return map;
  });

  const getAccessStatus = useCallback((uhid: string) => {
    return accessRequestService.getRequestStatus(doctorEmail, uhid);
  }, [doctorEmail]);

  const handleViewRecordsClick = (patient: PatientProfile) => {
    const status = getAccessStatus(patient.uhid);
    if (status === 'approved') {
      setSelectedPatient(patient);
    } else if (!status || status === 'declined') {
      setArModalPatient(patient);
    }
    // If pending → do nothing (button is replaced by status badge)
  };

  const handleRequestSubmitted = () => {
    setRequestSentMap((prev) => ({ ...prev, [arModalPatient?.uhid || '']: true }));
    setArModalPatient(null);
  };

  // Debounce-based skeleton: flip isSearching on via a timeout when input changes.
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setIsSearching(true);
        searchTimerRef.current = setTimeout(() => {
          setIsSearching(false);
        }, 400);
      },
    []
  );

  // Dynamic AI Summary Assessment Lookup
  const getAISummary = (recordId: string) => {
    switch (recordId) {
      case 'rec-cbc':
        return {
          summary: [
            'Mild anemia detected (Hemoglobin slightly low at 12.8 g/dL).',
            'White Blood Cell and Red Blood Cell counts are within standard ranges.',
            'Platelet levels indicate normal clotting capacity.',
            'No indications of acute chronic blood disorders.'
          ],
          followup: [
            'Iron-rich nutritional diet planning.',
            'Hydration levels audit.',
            'Recheck Complete Blood Count panel in 12 weeks.'
          ]
        };
      case 'rec-vit':
        return {
          summary: [
            'Vitamin D deficiency detected (24.5 ng/mL is below recommended 30 ng/mL).',
            'Vitamin B12 serum index is normal at 380 pg/mL.',
            'No secondary calcium absorption issues noted.',
            'No metabolic bone diseases indicated.'
          ],
          followup: [
            'Vitamin D3 daily oral supplementation (2000 IU).',
            'Moderate outdoor sunlight exposure.',
            'Dietary inclusion of fortified foods and fatty fish.'
          ]
        };
      case 'rec-xray':
        return {
          summary: [
            'Right wrist subacute hairline fracture detected along distal radius.',
            'Distal radius metaphysis shows healing periosteal reaction.',
            'Anatomical alignment is clean. No displacement.',
            'No joint effusion or joint subluxations.'
          ],
          followup: [
            'Orthopedic clinic specialist review.',
            'Immobilization via wrist splint/cast for 14 days.',
            'Avoid heavy load bearing activities on the right arm.'
          ]
        };
      case 'rec-rx':
        return {
          summary: [
            'Active cardiovascular and allergy medication prescriptions.',
            'Lipitor (Atorvastatin) 10mg ordered for lipid index regulation.',
            'Loratadine 10mg ordered daily for systemic allergy control.',
            'No chronic disease indicators listed on Rx script.'
          ],
          followup: [
            'Daily medication adherence as instructed.',
            'Check lipid panel metrics in 4 weeks.',
            'Report any persistent muscle soreness or drowsiness.'
          ]
        };
      case 'rec-followup':
        return {
          summary: [
            'Post-immobilization wrist fracture checkup completed.',
            'Hairline fracture distal radius is clinically resolved.',
            'Range of motion fully restored in all axes.',
            'Wrist grip strength is normal at 5/5.'
          ],
          followup: [
            'Discharged from active orthopedic tracking.',
            'Progressive joint strength exercises.',
            'Maintain general active mobility.'
          ]
        };
      default:
        return {
          summary: [
            'Clinical documentation index successfully scanned.',
            'Patient vitals and values are within normal limits.',
            'No chronic diseases identified.'
          ],
          followup: [
            'Continue general medical surveillance.',
            'Routine annual health scans.'
          ]
        };
    }
  };

  const mockPatients: PatientProfile[] = [
    {
      name: 'Nandeni Tiwari',
      age: 20,
      gender: 'Female',
      uhid: 'UHID-988319-A',
      abhaId: '91-8842-1982-1102',
      phone: '555-019-8831',
      bloodGroup: 'O Positive (O+)',
      emergencyContact: 'James Tiwari (+1 555-019-2834)',
      allergies: ['Penicillin', 'Peanuts'],
      medications: ['Loratadine 10mg daily', 'Vitamin D3 2000IU'],
      hospitalVisits: '3 Visits in 2025/2026',
      lastVisit: '06 Feb 2026',
      timeline: [
        {
          id: 'rec-cbc',
          date: '14 Mar 2025',
          title: 'CBC & Metabolic Panel (March 2025)',
          category: 'Lab Report',
          provider: 'Apex Diagnostics Lab',
          doctor: 'Dr. Angela Carter',
          type: 'lab',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>APEX DIAGNOSTICS LAB</h3>
                <p className="subtitle">Comprehensive Biomarker Assay &bull; Baseline Panel</p>
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hemoglobin (Hb)</td>
                    <td><strong>12.8 g/dL</strong></td>
                    <td>12.0 - 15.5 g/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Red Blood Cells (RBC)</td>
                    <td><strong>4.2 x10⁶/µL</strong></td>
                    <td>3.8 - 5.1 x10⁶/µL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>White Blood Cells (WBC)</td>
                    <td><strong>6.4 x10³/µL</strong></td>
                    <td>4.5 - 11.0 x10³/µL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Platelets</td>
                    <td><strong>280 x10³/µL</strong></td>
                    <td>150 - 450 x10³/µL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Vitamin D3 (25-OH)</td>
                    <td><strong className="text-warning">24.5 ng/mL</strong></td>
                    <td>&gt; 30.0 ng/mL</td>
                    <td><Badge variant="warning">Deficient</Badge></td>
                  </tr>
                  <tr>
                    <td>Vitamin B12</td>
                    <td><strong>380 pg/mL</strong></td>
                    <td>200 - 900 pg/mL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Fasting Blood Sugar</td>
                    <td><strong className="text-warning">105 mg/dL</strong></td>
                    <td>70 - 100 mg/dL</td>
                    <td><Badge variant="warning">Borderline</Badge></td>
                  </tr>
                  <tr>
                    <td>SGPT (ALT) - Liver</td>
                    <td><strong className="text-warning">42 U/L</strong></td>
                    <td>7 - 35 U/L</td>
                    <td><Badge variant="warning">Elevated</Badge></td>
                  </tr>
                  <tr>
                    <td>SGOT (AST) - Liver</td>
                    <td><strong className="text-warning">38 U/L</strong></td>
                    <td>8 - 33 U/L</td>
                    <td><Badge variant="warning">Elevated</Badge></td>
                  </tr>
                  <tr>
                    <td>Serum Creatinine - Kidney</td>
                    <td><strong className="text-warning">1.15 mg/dL</strong></td>
                    <td>0.50 - 1.10 mg/dL</td>
                    <td><Badge variant="warning">Elevated</Badge></td>
                  </tr>
                  <tr>
                    <td>BUN (Blood Urea Nitrogen)</td>
                    <td><strong className="text-warning">22 mg/dL</strong></td>
                    <td>7 - 20 mg/dL</td>
                    <td><Badge variant="warning">Elevated</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        },
        {
          id: 'rec-cbc-jul-2025',
          date: '22 Jul 2025',
          title: 'CBC & Metabolic Panel (July 2025)',
          category: 'Lab Report',
          provider: 'Apex Diagnostics Lab',
          doctor: 'Dr. Angela Carter',
          type: 'lab',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>APEX DIAGNOSTICS LAB</h3>
                <p className="subtitle">Comprehensive Biomarker Assay &bull; Follow-up Panel</p>
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hemoglobin (Hb)</td>
                    <td><strong>14.1 g/dL</strong></td>
                    <td>12.0 - 15.5 g/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Red Blood Cells (RBC)</td>
                    <td><strong>4.5 x10⁶/µL</strong></td>
                    <td>3.8 - 5.1 x10⁶/µL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>White Blood Cells (WBC)</td>
                    <td><strong>6.4 x10³/µL</strong></td>
                    <td>4.5 - 11.0 x10³/µL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Platelets</td>
                    <td><strong className="text-danger">140 x10³/µL</strong></td>
                    <td>150 - 450 x10³/µL</td>
                    <td><Badge variant="danger">Low</Badge></td>
                  </tr>
                  <tr>
                    <td>Vitamin D3 (25-OH)</td>
                    <td><strong>32.0 ng/mL</strong></td>
                    <td>&gt; 30.0 ng/mL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Vitamin B12</td>
                    <td><strong>380 pg/mL</strong></td>
                    <td>200 - 900 pg/mL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Fasting Blood Sugar</td>
                    <td><strong>90 mg/dL</strong></td>
                    <td>70 - 100 mg/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>SGPT (ALT) - Liver</td>
                    <td><strong>28 U/L</strong></td>
                    <td>7 - 35 U/L</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>SGOT (AST) - Liver</td>
                    <td><strong>21 U/L</strong></td>
                    <td>8 - 33 U/L</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Serum Creatinine - Kidney</td>
                    <td><strong>0.85 mg/dL</strong></td>
                    <td>0.50 - 1.10 mg/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>BUN (Blood Urea Nitrogen)</td>
                    <td><strong>14 mg/dL</strong></td>
                    <td>7 - 20 mg/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        },
        {
          id: 'rec-vit',
          date: '21 Sep 2025',
          title: 'Vitamin D & B12 Report',
          category: 'Lab Report',
          provider: 'Apex Diagnostics Lab',
          doctor: 'Dr. Marcus Vance',
          type: 'lab',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>APEX DIAGNOSTICS LAB</h3>
                <p className="subtitle">Biochemistry &amp; Serum Indices</p>
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vitamin D3 (25-OH)</td>
                    <td><strong className="text-warning">24.5 ng/mL</strong></td>
                    <td>&gt; 30.0 ng/mL</td>
                    <td><Badge variant="warning">Deficient</Badge></td>
                  </tr>
                  <tr>
                    <td>Vitamin B12</td>
                    <td><strong>380 pg/mL</strong></td>
                    <td>200 - 900 pg/mL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        },
        {
          id: 'rec-xray',
          date: '06 Feb 2026',
          title: 'Right Wrist X-Ray',
          category: 'Imaging & Scan',
          provider: 'CityCare Radiology Center',
          doctor: 'Dr. Harrison Ford',
          type: 'imaging',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>CITYCARE RADIOLOGY CENTER</h3>
                <p className="subtitle">Radiology Scan &bull; High Resolution Joint Capture</p>
              </div>
              
              <div className="xray-preview-box">
                <svg viewBox="0 0 200 200" className="skeleton-svg">
                  {/* Forearm bones */}
                  <rect x="75" y="110" width="16" height="80" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  <rect x="99" y="110" width="22" height="80" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                  
                  {/* Wrist joint carpal region */}
                  <circle cx="85" cy="98" r="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  <circle cx="95" cy="98" r="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  <circle cx="107" cy="98" r="7" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  
                  <circle cx="80" cy="90" r="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  <circle cx="92" cy="88" r="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  <circle cx="104" cy="90" r="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
                  <circle cx="114" cy="92" r="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />

                  {/* Metacarpals (Finger bones) */}
                  <line x1="78" y1="83" x2="68" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="90" y1="81" x2="88" y2="30" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="102" y1="83" x2="108" y2="32" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="112" y1="85" x2="126" y2="38" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="118" y1="92" x2="138" y2="60" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Fractured bone warning marker */}
                  <path d="M98 120 L115 125" stroke="var(--text-danger)" strokeWidth="2" strokeDasharray="3,2" />
                  <circle cx="106" cy="122" r="10" fill="none" stroke="var(--text-danger)" strokeWidth="1" />
                </svg>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Radiographic Consultation Notes:</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <strong>Findings:</strong> Subacute cortical fracture line visible at the distal radius metaphysis with minor surrounding periosteal reaction. Alignment is anatomical. No joint effusion or secondary dislocations.
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                  <strong>Impression:</strong> Healing subacute hairline crack. Immobilization recommended for next 14 days.
                </p>
              </div>
            </div>
          )
        },
        {
          id: 'rec-rx',
          date: '06 Feb 2026',
          title: 'Medication Prescribed',
          category: 'Prescription',
          provider: 'CityCare Orthopedics Clinic',
          doctor: 'Dr. Roseanne Park',
          type: 'prescription',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>CITYCARE ORTHOPEDICS CLINIC</h3>
                <p className="subtitle">Clinical Rx Prescription Ledger</p>
              </div>

              <div style={{ margin: '1.5rem 0', fontFamily: 'monospace', fontSize: '1rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rx</span>
                <div style={{ paddingLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>1. Loratadine 10mg (Claritin)</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.1rem 0' }}>Route: Oral &bull; Dose: 1 Tablet Daily &bull; Duration: 30 Days (Qty: 30)</p>
                  </div>
                  <div>
                    <strong>2. Lipitor 10mg (Atorvastatin)</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.1rem 0' }}>Route: Oral &bull; Dose: 1 Tablet at Bedtime &bull; Duration: 30 Days (Qty: 30)</p>
                  </div>
                </div>
              </div>

              <div className="paper-footer" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '1rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Signed: Dr. Roseanne Park</span>
                <span>Date: 06 Feb 2026</span>
              </div>
            </div>
          )
        },
        {
          id: 'rec-followup',
          date: '10 Feb 2026',
          title: 'Follow-up Visit',
          category: 'Consultation Note',
          provider: 'CityCare Orthopedics Clinic',
          doctor: 'Dr. Roseanne Park',
          type: 'consultation',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>CITYCARE ORTHOPEDICS CLINIC</h3>
                <p className="subtitle">Clinical Progress Record Note</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <div>
                  <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Subjective History</h5>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Patient reports complete resolution of wrist stiffness. Pain scores are reported at 0/10 during resting periods. Tolerating prescribed Loratadine daily without secondary drowsiness.
                  </p>
                </div>
                <div>
                  <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Objective Physical Exam</h5>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Wrist joint examination shows full anatomical range of motion during flexion/extension sequences. Muscle grip strength is rated at 5/5 bilaterally. No localized swelling or structural tenderness.
                  </p>
                </div>
                <div>
                  <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Clinical Treatment Plan</h5>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Wrist hairline crack is fully resolved. Discharged from active orthopedic tracking. General wellness monitoring to continue client-side.
                  </p>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      name: 'Aarav Sharma',
      age: 34,
      gender: 'Male',
      uhid: 'UHID-110294-B',
      abhaId: '32-9841-8831-2940',
      phone: '555-014-9932',
      bloodGroup: 'A Positive (A+)',
      emergencyContact: 'Sunita Sharma (+1 555-014-7744)',
      allergies: ['Sulfa Drugs'],
      medications: ['Metformin 500mg twice daily'],
      hospitalVisits: '1 Visit in 2026',
      lastVisit: '12 Jan 2026',
      timeline: [
        {
          id: 'rec-bmp',
          date: '12 Jan 2026',
          title: 'Basic Metabolic Panel',
          category: 'Lab Report',
          provider: 'Apex Diagnostics Lab',
          doctor: 'Dr. Sarah Connor',
          type: 'lab',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>APEX DIAGNOSTICS LAB</h3>
                <p className="subtitle">Basic Metabolic Profile</p>
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Glucose (Fasting)</td>
                    <td><strong>98 mg/dL</strong></td>
                    <td>70 - 100 mg/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Creatinine</td>
                    <td><strong>0.9 mg/dL</strong></td>
                    <td>0.6 - 1.2 mg/dL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                  <tr>
                    <td>Sodium (Na)</td>
                    <td><strong>138 mEq/L</strong></td>
                    <td>135 - 145 mEq/L</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        }
      ]
    },
    {
      name: 'Priya Patel',
      age: 28,
      gender: 'Female',
      uhid: 'UHID-449102-C',
      abhaId: '44-1928-8310-9941',
      phone: '555-017-3810',
      bloodGroup: 'B Positive (B+)',
      emergencyContact: 'Dev Patel (+1 555-017-2940)',
      allergies: ['None Reported'],
      medications: ['None'],
      hospitalVisits: '2 Visits in 2025',
      lastVisit: '28 Dec 2025',
      timeline: [
        {
          id: 'rec-tsh',
          date: '28 Dec 2025',
          title: 'Thyroid Profile',
          category: 'Lab Report',
          provider: 'Apex Diagnostics Lab',
          doctor: 'Dr. James Mitchell',
          type: 'lab',
          details: (
            <div className="report-paper">
              <div className="paper-header">
                <h3>APEX DIAGNOSTICS LAB</h3>
                <p className="subtitle">Endocrine Assay Index</p>
              </div>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Result</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Thyroid Stimulating Hormone (TSH)</td>
                    <td><strong>2.1 µIU/mL</strong></td>
                    <td>0.4 - 4.0 µIU/mL</td>
                    <td><Badge variant="mint">Normal</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        }
      ]
    }
  ];

  const filtered = mockPatients.filter(patient => {
    const matchesName = !queryName || patient.name.toLowerCase().includes(queryName.toLowerCase());
    const matchesUhid = !queryUhid || patient.uhid.toLowerCase().includes(queryUhid.toLowerCase());
    const matchesAbha = !queryAbha || patient.abhaId.toLowerCase().includes(queryAbha.toLowerCase());
    const matchesPhone = !queryPhone || patient.phone.includes(queryPhone);
    return matchesName && matchesUhid && matchesAbha && matchesPhone;
  });

  return (
    <div className="placeholder-view-wrapper doctor-search-view animate-fade-in">
      
      {!selectedPatient ? (
        <>
          <div className="section-title-row">
            <div>
              <h2 className="section-title-text text-gradient">Patient Directory Search</h2>
              <p className="section-subtitle-text">Search patients by name, UHID index, ABHA digital identity numbers, or phone contacts.</p>
            </div>
          </div>

          {/* Form Search Card */}
          <Card padding="md" style={{ marginBottom: '1.5rem' }}>
            <div className="search-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Search Patient Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nandeni Tiwari" 
                  value={queryName}
                  onChange={handleQueryChange(setQueryName)}
                  className="search-input-box text-field"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', height: '40px', color: 'var(--text-primary)', padding: '0 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>UHID</label>
                <input 
                  type="text" 
                  placeholder="e.g. UHID-988319..." 
                  value={queryUhid}
                  onChange={handleQueryChange(setQueryUhid)}
                  className="search-input-box text-field"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', height: '40px', color: 'var(--text-primary)', padding: '0 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>ABHA ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 91-8842..." 
                  value={queryAbha}
                  onChange={handleQueryChange(setQueryAbha)}
                  className="search-input-box text-field"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', height: '40px', color: 'var(--text-primary)', padding: '0 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 555-019..." 
                  value={queryPhone}
                  onChange={handleQueryChange(setQueryPhone)}
                  className="search-input-box text-field"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', height: '40px', color: 'var(--text-primary)', padding: '0 10px' }}
                />
              </div>
            </div>
          </Card>

          {/* Cards Result List */}
          <div className="patients-grid-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {isSearching ? (
              <>
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="patient-search-card skeleton-card" padding="md">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div className="skeleton-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}></div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="skeleton-line" style={{ width: '100px', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}></div>
                        <div className="skeleton-line" style={{ width: '60px', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                      <div className="skeleton-line" style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }}></div>
                      <div className="skeleton-line" style={{ width: '65%', height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px' }}></div>
                    </div>
                    <div className="skeleton-btn" style={{ width: '100%', height: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}></div>
                  </Card>
                ))}
              </>
            ) : filtered.length > 0 ? (
              filtered.map((patient, idx) => {
                const arStatus = getAccessStatus(patient.uhid);
                const lastReq = accessRequestService.getLatestRequest(doctorEmail, patient.uhid);
                const isEmerg = lastReq?.isEmergency && arStatus === 'approved';
                return (
                  <Card key={idx} className={`patient-search-card ${arStatus === 'approved' ? 'access-approved' : ''}`} style={{ borderColor: isEmerg ? 'var(--color-danger)' : undefined, boxShadow: isEmerg ? '0 0 10px rgba(244,63,94,0.15)' : undefined }} padding="md" hoverable>
                    <div className="patient-card-header" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <div className="patient-avatar-badge" style={{ width: '40px', height: '40px', borderRadius: '50%', background: isEmerg ? 'linear-gradient(135deg, var(--color-danger), var(--accent-violet))' : arStatus === 'approved' ? 'linear-gradient(135deg, var(--accent-mint), var(--accent-violet))' : 'var(--grad-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-primary)', boxShadow: isEmerg ? '0 0 12px rgba(244,63,94,0.4)' : arStatus === 'approved' ? '0 0 12px rgba(0,235,212,0.3)' : 'none' }}>
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="patient-name" style={{ margin: 0, fontWeight: 600 }}>{patient.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{patient.age} Years &bull; {patient.gender}</p>
                      </div>
                    </div>

                    <div className="patient-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      <div><strong>UHID:</strong> {patient.uhid}</div>
                      <div><strong>ABHA:</strong> {patient.abhaId}</div>
                      <div><strong>Last Visit:</strong> {patient.lastVisit}</div>
                    </div>

                    {/* Security Gate — Three-state button area */}
                    {arStatus === 'approved' ? (
                      <Button
                        variant={isEmerg ? "outline" : "mint"}
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                        style={{ 
                          width: '100%',
                          background: isEmerg ? 'rgba(244,63,94,0.06)' : undefined,
                          borderColor: isEmerg ? 'var(--color-danger)' : undefined,
                          color: isEmerg ? 'var(--color-danger)' : undefined
                        }}
                        icon={<CheckCircle2 size={14} />}
                      >
                        {isEmerg ? "View Records (Emergency)" : "View Records"}
                      </Button>
                    ) : arStatus === 'pending' ? (
                      <div className="ar-pending-gate">
                        <Clock3 size={13} className="ar-pending-gate-icon" />
                        <span>Awaiting Patient Approval</span>
                      </div>
                    ) : arStatus === 'declined' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <div className="ar-declined-gate">
                          <XCircle size={13} className="ar-declined-gate-icon" />
                          <span>Access Declined</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setArModalPatient(patient)}
                          style={{ width: '100%' }}
                          icon={<RefreshCw size={12} />}
                        >
                          Request Again
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewRecordsClick(patient)}
                        style={{ width: '100%' }}
                        icon={<Send size={13} />}
                      >
                        Request Access
                      </Button>
                    )}
                  </Card>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No patient profiles found matching your search.
              </div>
            )}
          </div>
      </>
      ) : (
        /* Detailed Profile and Glowing Timeline View */
        <div className="patient-profile-detail-view animate-fade-in">
          
          <button 
            className="back-nav-btn" 
            onClick={() => { setSelectedPatient(null); setSelectedRecord(null); setIsComparing(false); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-lavender)', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Patient Search</span>
          </button>

          {/* Profile Details Header Block */}
          <Card className="profile-header-card" padding="md" style={{ marginBottom: '2rem' }}>
            <div className="profile-header-glow"></div>
            <div className="profile-header-top" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="profile-photo-wrapper" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--grad-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', boxShadow: '0 0 20px rgba(184,165,255,0.25)' }}>
                {selectedPatient.name.charAt(0)}
              </div>
              <div className="profile-demographics" style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{selectedPatient.name}</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><strong>Age/Gender:</strong> {selectedPatient.age} Years, {selectedPatient.gender}</span>
                  <span><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</span>
                  <span><strong>ABHA ID:</strong> {selectedPatient.abhaId}</span>
                </div>
              </div>
            </div>

            <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div>
                <h5 className="profile-detail-label"><Phone size={12} /> Emergency Contact</h5>
                <p className="profile-detail-value">{selectedPatient.emergencyContact}</p>
              </div>

              <div>
                <h5 className="profile-detail-label"><ShieldAlert size={12} className="text-danger" /> Known Allergies</h5>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {selectedPatient.allergies.map((all, i) => (
                    <Badge key={i} variant="danger">{all}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="profile-detail-label"><Pill size={12} className="text-warning" /> Current Medications</h5>
                <p className="profile-detail-value" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: '0.25rem 0 0 0' }}>
                  {selectedPatient.medications.map((med, i) => (
                    <span key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>&bull; {med}</span>
                  ))}
                </p>
              </div>

              <div>
                <h5 className="profile-detail-label"><Heart size={12} className="text-violet" /> Hospital Visits</h5>
                <p className="profile-detail-value">{selectedPatient.hospitalVisits}</p>
              </div>
            </div>
          </Card>

          {/* Medical Timeline Section & Compare Toggle */}
          <div className="section-title-row non-printable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {isComparing ? "Compare Reports Workspace" : "Medical Timeline"}
            </h3>
            <Button
              variant={isComparing ? "secondary" : "primary"}
              size="sm"
              icon={<Activity size={14} />}
              onClick={() => setIsComparing(!isComparing)}
            >
              {isComparing ? "View Timeline" : "Compare Reports"}
            </Button>
          </div>

          {isComparing ? (
            <DoctorReportComparison
              patient={selectedPatient}
              onBack={() => setIsComparing(false)}
            />
          ) : (
            <div className="glowing-timeline-container" style={{ position: 'relative', paddingLeft: '45px' }}>
              <div className="timeline-connector-glow" style={{ position: 'absolute', top: '10px', bottom: '10px', left: '20px', width: '2px', background: 'linear-gradient(to bottom, var(--accent-violet) 0%, var(--accent-lavender) 50%, var(--accent-violet) 100%)', boxShadow: '0 0 10px var(--accent-lavender)' }}></div>
              
              <div className="timeline-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {selectedPatient.timeline.map((record) => (
                  <div key={record.id} className="timeline-card-node" style={{ position: 'relative' }}>
                    
                    {/* Glowing Node Indicator */}
                    <div className="timeline-node-dot" style={{ position: 'absolute', left: '-31px', top: '15px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--bg-main)', border: '3px solid var(--accent-lavender)', boxShadow: '0 0 10px var(--accent-lavender)', zIndex: 2 }}></div>

                    {/* Rounded Timeline Card */}
                    <Card className="timeline-record-card" padding="md" hoverable onClick={() => {
                      setSelectedRecord(record);
                      activityLogService.logAction(
                        `Dr. ${doctorName} (Clinician)`,
                        `Viewed ${record.title}`,
                        `${selectedPatient.uhid.toLowerCase()}@medivault.app`
                      );
                      activityLogService.logAction(
                        `AI Sandbox`,
                        `Generated summary for ${record.title}`,
                        `${selectedPatient.uhid.toLowerCase()}@medivault.app`
                      );
                    }} style={{ cursor: 'pointer' }}>
                      <div className="timeline-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-lavender)' }}>{record.date}</span>
                        <Badge variant={record.type === 'prescription' ? 'violet' : record.type === 'lab' ? 'lavender' : 'mint'}>
                          {record.category}
                        </Badge>
                      </div>

                      <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{record.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Ordered by {record.doctor} &bull; {record.provider}</p>

                      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--accent-violet)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Open Record Document</span>
                        <span>&rarr;</span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
            {/* Interactive Document Viewer Modal */}
          {selectedRecord && (() => {
            const aiData = getAISummary(selectedRecord.id);
            const fullRec = vaultService.ensureVerification({
              id: selectedRecord.id,
              patientId: selectedPatient?.uhid ? `${selectedPatient.uhid.toLowerCase()}@medivault.app` : 'nandeni.tiwari@medivault.app',
              title: selectedRecord.title,
              category: selectedRecord.category === 'prescription' ? 'Prescription' : selectedRecord.category === 'lab' ? 'Lab Report' : 'Imaging & Scan',
              recordDate: selectedRecord.date,
              provider: selectedRecord.provider,
              doctorName: selectedRecord.doctor,
              fileName: `${selectedRecord.title.toLowerCase().replace(/ /g, '_')}.pdf`,
              fileSize: '1.2 MB',
              fileType: 'application/pdf',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            if (verifiedRecordId !== selectedRecord.id) {
              return (
                <div className="document-modal-overlay viewer-modal-overlay" onClick={() => setSelectedRecord(null)}>
                  <div className="document-viewer-container animate-fade-in" style={{ maxWidth: '520px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(20,16,36,0.95)', border: '1px solid rgba(184,165,255,0.25)', boxShadow: '0 0 30px rgba(139,92,246,0.2)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,235,212,0.1)', border: '1px solid rgba(0,235,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-mint)', margin: '0 auto 1rem auto' }}>
                        <ShieldCheck size={28} />
                      </div>
                      <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>Authenticity Verification</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cryptographic integrity validation of medical documents</p>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Report ID</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-lavender)' }}>{fullRec.reportId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Digital Signature</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px', whiteSpace: 'nowrap' }}>{fullRec.digitalHash}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Upload Timestamp</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(fullRec.uploadTimestamp || '').toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Verification Registry</span>
                        <span style={{ color: 'var(--accent-mint)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Verified Authentic
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                      <img src={fullRec.qrCodeUrl} alt="Verification QR Code" style={{ width: '72px', height: '72px', borderRadius: '4px', border: '2px solid #fff' }} />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Scan QR code to check verification signature on the decentralized MediVault Public Ledger.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <Button variant="ghost" style={{ flex: 1 }} onClick={() => setSelectedRecord(null)}>
                        Cancel
                      </Button>
                      <Button variant="primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent-mint) 0%, var(--accent-violet) 100%)', borderColor: 'var(--accent-mint)' }} onClick={() => setVerifiedRecordId(selectedRecord.id)}>
                        Verify &amp; Enter secure Viewer
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="document-modal-overlay viewer-modal-overlay" onClick={() => setSelectedRecord(null)}>
                <div className="document-viewer-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Left Section: Document & Actions */}
                  <div className="viewer-left-panel">
                    
                    {/* Toolbar Headers */}
                    <div className="viewer-toolbar">
                      <div className="toolbar-info">
                        <Badge variant="violet">{selectedRecord.category}</Badge>
                        <span className="toolbar-date">{selectedRecord.date}</span>
                      </div>
                      
                      <div className="toolbar-actions">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            alert('PDF generation initiated... [Demo Only]');
                            activityLogService.logAction(
                              `Dr. ${doctorName} (Clinician)`,
                              `Downloaded ${selectedRecord.title}`,
                              `${selectedPatient.uhid.toLowerCase()}@medivault.app`
                            );
                          }}
                          icon={<Download size={14} />}
                        >
                          Download PDF
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => alert('Opening raw document binary... [Demo Only]')}
                          icon={<Eye size={14} />}
                        >
                          View Original
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.print()}
                          icon={<Printer size={14} />}
                        >
                          Print
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => alert(`Record shared link compiled for consult: /patient/vault/${selectedRecord.id}`)}
                          icon={<Share2 size={14} />}
                        >
                          Share
                        </Button>
                        <button 
                          className="viewer-close-btn" 
                          onClick={() => setSelectedRecord(null)}
                          aria-label="Close viewer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="viewer-title-block">
                      <h2 className="viewer-title">{selectedRecord.title}</h2>
                      <div className="viewer-metadata-row">
                        <span className="metadata-item"><strong>Hospital/Facility:</strong> {selectedRecord.provider}</span>
                        <span className="metadata-item"><strong>Doctor:</strong> {selectedRecord.doctor}</span>
                        <span className="metadata-item"><strong>Uploaded Date:</strong> {selectedRecord.date}</span>
                      </div>
                    </div>

                    {/* Document Scroll Content */}
                    <div className="viewer-document-scroll">
                      <div className="clinical-sheet-container">
                        {selectedRecord.details}
                      </div>
                    </div>

                  </div>

                  {/* Right Section: AI Summary Glass Card */}
                  <div className="viewer-right-panel">
                    <div className="ai-glass-card">
                      <div className="ai-card-glow"></div>
                      
                      <div className="ai-card-header">
                        <div className="ai-badge-group">
                          <div className="ai-sparkle-glow">
                            <Sparkles size={16} className="text-violet" />
                          </div>
                          <span className="ai-title-text">Gemini Clinical Intelligence</span>
                        </div>
                        <Badge variant="violet">AI Sandbox</Badge>
                      </div>

                      <p className="ai-description-text">
                        Automated summarization and clinical biomarker assessment index parsed from uploaded records.
                      </p>

                      <div className="ai-summary-sections">
                        
                        {/* Patient Summary Section */}
                        <div className="ai-section">
                          <h4 className="ai-section-title">Patient Summary</h4>
                          <ul className="ai-bullet-list">
                            {aiData.summary.map((bullet, idx) => (
                              <li key={idx} className="ai-bullet-item">{bullet}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommended Follow-up Section */}
                        <div className="ai-section">
                          <h4 className="ai-section-title">Recommended Follow-up</h4>
                          <ul className="ai-bullet-list">
                            {aiData.followup.map((item, idx) => (
                              <li key={idx} className="ai-bullet-item followup">{item}</li>
                            ))}
                          </ul>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Access Request Modal */}
      {arModalPatient && (
        <AccessRequestModal
          patient={arModalPatient}
          doctorName={doctorName}
          doctorEmail={doctorEmail}
          doctorSpecialization={doctorSpecialization}
          hospital={hospital}
          onClose={() => setArModalPatient(null)}
          onSubmitted={handleRequestSubmitted}
        />
      )}

    </div>
  );
};

// 2. Access Requests Log — Live Data View
// const generatePermissionToken = () => {
//   return `MV-PERM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
// };

// interface AccessRequestCard {
//   id: string;
//   patientName: string;
//   hospital: string;
//   reason: string;
//   duration: string;
//   status: 'pending' | 'approved' | 'declined';
//   token?: string;
// }

// interface ActivityLogEntry {
//   time: string;
//   action: string;
//   patientName: string;
//   date: string;
// }

export const DoctorAccessRequests: React.FC = () => {
  const { user } = useRouter();
  const doctorEmail = user?.email || 'doctor@medivault.app';

  // Load live requests from service
  const [requests, setRequests] = useState<ARRecord[]>(() =>
    accessRequestService.getRequestsForDoctor(doctorEmail)
  );

  const [logs, setLogs] = useState<any[]>(() =>
    activityLogService.getAll()
  );

  const refresh = () => {
    setRequests(accessRequestService.getRequestsForDoctor(doctorEmail));
    setLogs(activityLogService.getAll());
  };

  const handleViewHistory = (patientName: string) => {
    alert(`Audit Trail for ${patientName}:\n- Request sent and awaiting patient approval.\n- All access is governed by patient consent.`);
  };

  return (
    <div className="placeholder-view-wrapper access-requests-management-view animate-fade-in">
      <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title-text text-gradient">Access Requests</h2>
          <p className="section-subtitle-text">Track the status of all your medical record access requests to patients.</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={refresh}>
          Refresh
        </Button>
      </div>

      <div className="requests-management-grid">
        
        {/* Left Column: Request Cards */}
        <div className="requests-cards-column">
          <h3 className="grid-column-title">My Requests
            <Badge variant="warning" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
              {requests.filter(r => r.status === 'pending').length} Pending
            </Badge>
          </h3>
          
          <div className="management-requests-list">
            {requests.length === 0 ? (
              <div className="ar-empty-state">
                <Send size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
                  You haven't sent any access requests yet. Search for a patient and click <strong>Request Access</strong>.
                </p>
              </div>
            ) : requests.map((req) => {
              const cardBorderColor = req.isEmergency ? 'var(--color-danger)' : undefined;
              const shadowGlow = req.isEmergency ? '0 0 10px rgba(244,63,94,0.15)' : undefined;
              return (
                <Card 
                  key={req.id} 
                  className={`management-request-card ${req.status}`} 
                  style={{ borderColor: cardBorderColor, boxShadow: shadowGlow }} 
                  padding="md"
                >
                  <div className="request-card-header-row">
                    <div>
                      <h4 className="patient-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {req.patientName}
                        {req.isEmergency && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 700 }}>[EMERGENCY]</span>}
                      </h4>
                      <span className="hospital-name">{req.hospital}</span>
                    </div>
                    {req.status === 'pending' ? (
                      <Badge variant={req.isEmergency ? "danger" : "warning"}>Pending</Badge>
                    ) : req.status === 'approved' ? (
                      <Badge variant={req.isEmergency ? "danger" : "success"}>Approved</Badge>
                    ) : (
                      <Badge variant="danger">Declined</Badge>
                    )}
                  </div>

                  <div className="request-card-body-details">
                    <div className="detail-item">
                      <span className="label">Purpose</span>
                      <span className="value" style={{ color: req.isEmergency ? 'var(--color-danger)' : undefined, fontWeight: req.isEmergency ? 600 : undefined }}>{req.purpose}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration</span>
                      <span className="value duration-val">{req.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Submitted</span>
                      <span className="value">{accessRequestService.formatTime(req.submittedAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Request ID</span>
                      <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-lavender)' }}>{req.requestId}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div className="ar-request-notes">
                      <span className="ar-notes-label">Notes:</span>
                      <span className="ar-notes-value">{req.notes}</span>
                    </div>
                  )}

                  {req.status === 'approved' && req.permissionToken && (
                    <div className="generated-token-row">
                      <span className="token-label">Permission Token:</span>
                      <span className="token-badge" style={{ background: req.isEmergency ? 'rgba(244,63,94,0.1)' : undefined, borderColor: req.isEmergency ? 'rgba(244,63,94,0.3)' : undefined, color: req.isEmergency ? 'var(--color-danger)' : undefined }}>{req.permissionToken}</span>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="ar-pending-notice" style={{ color: req.isEmergency ? 'var(--color-danger)' : undefined }}>
                      <Clock3 size={12} />
                      <span>Waiting for {req.patientName} to approve this request.</span>
                    </div>
                  )}

                  {req.status === 'approved' && (
                    <div className="ar-approved-notice" style={{ color: req.isEmergency ? 'var(--color-danger)' : undefined, background: req.isEmergency ? 'rgba(244,63,94,0.06)' : undefined, borderColor: req.isEmergency ? 'rgba(244,63,94,0.18)' : undefined }}>
                      <CheckCircle2 size={12} style={{ color: req.isEmergency ? 'var(--color-danger)' : undefined }} />
                      <span>{req.isEmergency ? "Access granted under Emergency protocol. Subject to strict audit." : "Access granted. You may now view this patient's medical records."}</span>
                    </div>
                  )}

                {req.status === 'declined' && (
                  <div className="ar-declined-notice">
                    <XCircle size={12} />
                    <span>Patient declined this request. You may search and request again.</span>
                  </div>
                )}

                <div className="request-card-actions-row" style={{ marginTop: '0.75rem' }}>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleViewHistory(req.patientName)}
                  >
                    View History
                  </Button>
                </div>
              </Card>
            );
          })}
          </div>
        </div>

        {/* Right Column: Activity Logs Audit Table */}
        <div className="activity-logs-column">
          <h3 className="grid-column-title">Activity Logs Audit</h3>
          
          <Card className="activity-logs-table-card" padding="none">
            <div className="logs-table-scroll">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>User &amp; Action</th>
                    <th>IP &amp; Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="log-row">
                      <td className="log-time-cell">
                        <span className="time">{log.time}</span>
                        <span className="date">{log.date}</span>
                      </td>
                      <td className="log-action-cell">
                        <div style={{ fontWeight: 600 }}>{log.user}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>{log.action}</div>
                      </td>
                      <td className="log-patient-cell">
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.ip}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{log.device}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

// 3. Patient Timeline Placeholder View
export const DoctorPatientTimeline: React.FC = () => {
  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">Patient Timeline</h2>
          <p className="section-subtitle-text">Chronological history mapping of patient consultation logs and diagnostic timelines.</p>
        </div>
      </div>

      <Card padding="lg" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Activity size={48} className="text-muted animate-float" style={{ margin: '0 auto 1.5rem auto' }} />
        <h3>Longitudinal Health Timelines</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto', lineHeight: '1.5' }}>
          Select a patient from search or active requests to map their historical clinical events and test parameters in a centralized longitudinal timeline.
        </p>
        <Button variant="outline" size="sm">Select Patient</Button>
      </Card>
    </div>
  );
};

// 4. Medical Records Placeholder View
export const DoctorMedicalRecords: React.FC = () => {
  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">Medical Records Vault</h2>
          <p className="section-subtitle-text">Shared clinical files and patient records decrypted under cryptographic clearance.</p>
        </div>
      </div>

      <Card padding="lg" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <FileText size={48} className="text-muted animate-float" style={{ margin: '0 auto 1.5rem auto' }} />
        <h3>Decrypted Local Index</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto', lineHeight: '1.5' }}>
          Shared files (Lab reports, scan imaging, doctor prescriptions) decrypt locally inside the browser. No unencrypted files are hosted on public servers.
        </p>
        <Button variant="secondary" size="md">Refresh Index</Button>
      </Card>
    </div>
  );
};

// 5. AI Insights Placeholder View
export const DoctorAIInsights: React.FC = () => {
  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">AI Insights & OCR</h2>
          <p className="section-subtitle-text">Intelligent report biomarker summary parameters and diagnostic indicators.</p>
        </div>
      </div>

      <Card padding="lg" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Brain size={48} className="text-muted animate-float" style={{ margin: '0 auto 1.5rem auto', color: 'var(--accent-violet)' }} />
        <h3>Clinical Intelligence Summary</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto', lineHeight: '1.5' }}>
          Phase 5 clinical models automatically compile biomarker ranges from scan files and text layouts to map health indicators. Clearances are audited on patient consent structures.
        </p>
        <Badge variant="violet" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>Sandbox Phase 4 active &bull; AI is offline</Badge>
      </Card>
    </div>
  );
};

// 6. Notifications View
export const DoctorNotificationsView: React.FC = () => {
  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">Clinician Notifications</h2>
          <p className="section-subtitle-text">System alerts, record access requests updates, and verification status channels.</p>
        </div>
      </div>

      <Card padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <Bell size={18} className="text-warning" />
            <div>
              <h4 style={{ fontWeight: 600 }}>Access Clearance Approved</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aarav Sharma approved your lease request for Complete Blood Count parameters.</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 hour ago</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ShieldCheck size={18} className="text-success" />
            <div>
              <h4 style={{ fontWeight: 600 }}>Clinician Credentials Verified</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your doctor license registration was successfully validated against state registries.</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 days ago</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 7. Profile View
export const DoctorProfileView: React.FC<{ user: UserProfile | null; signOut: () => void }> = ({ user, signOut }) => {
  const onboarding = user?.onboardingData || {};
  const specialization = (onboarding.specialization as string) || 'Neurology';
  const hospital = (onboarding.hospital as string) || 'CityCare Hospital';
  const licenseNumber = (onboarding.licenseNumber as string) || 'CARD-48892';

  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">Clinician Profile</h2>
          <p className="section-subtitle-text">Manage professional registrations, license certificates, and workplace associations.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dr. {user?.name || 'Roseanne Park'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.email || 'roseanne.park@citycare.org'}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Medical Specialty</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{specialization}</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hospital Facility</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{hospital}</p>
          </div>
        </Card>

        <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Verified License Certificate</h4>
            <Badge variant="success" style={{ display: 'inline-block', marginBottom: '1rem' }}>Active Certificate</Badge>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>License ID:</strong> {licenseNumber}</p>
          </div>
          <Button variant="ghost" size="sm" className="btn-danger-hover" onClick={signOut}>Sign Out Account</Button>
        </Card>
      </div>
    </div>
  );
};

// 8. Settings View
export const DoctorSettingsView: React.FC = () => {
  return (
    <div className="placeholder-view-wrapper animate-fade-in">
      <div className="section-title-row">
        <div>
          <h2 className="section-title-text text-gradient">Workspace Settings</h2>
          <p className="section-subtitle-text">Configure clinician dashboard preferences, cryptographic session leases, and notification rules.</p>
        </div>
      </div>

      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <h4 style={{ fontWeight: 600 }}>Cryptographic Auto-Session Clear</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Erase memory session keys after 15 minutes of inactivity.</p>
            </div>
            <Badge variant="mint">Enabled</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 600 }}>Push Consent Proposals Alerts</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify instantly when patient approves record credentials clearance requests.</p>
            </div>
            <Badge variant="lavender">Enabled</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
