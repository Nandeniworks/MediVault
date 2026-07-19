import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TextInput, SelectInput } from '../common/FormElements';
import { LoadingState } from '../common/States';
import { useRouter } from '../../context/RouterContext';
import { vaultService } from '../../services/vaultService';
import type { MedicalRecord } from '../../services/vaultService';
import { 
  ArrowLeft, Calendar, FileText, User, Building, 
  Download, Edit, Trash2, AlertCircle,
  ZoomIn, ZoomOut, RotateCw, Printer, X, ShieldCheck, Sparkles
} from 'lucide-react';
import { demoRecords } from '../../services/patientService';

interface DetailViewProps {
  recordId: string;
  isDemoMode?: boolean;
}

export const RecordDetailView: React.FC<DetailViewProps> = ({ recordId, isDemoMode = false }) => {
  const { user, navigate } = useRouter();
  const patientEmail = user?.email || '';

  // Data States
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals/Dialogs States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Edit Fields State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MedicalRecord['category']>('Lab Report');
  const [editDate, setEditDate] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Interactive controls state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Load Record Metadata and File Blob
  const loadRecordData = async () => {
    if (!patientEmail || !recordId) return;
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode || recordId.startsWith('seed-')) {
        const deletedDemoIds = JSON.parse(sessionStorage.getItem('mv_deleted_demo_ids') || '[]');
        if (deletedDemoIds.includes(recordId)) {
          throw new Error('Record not found.');
        }

        let baseRecord = demoRecords.find(r => r.id === recordId);
        if (!baseRecord) {
          const seeds = [
            {
              id: 'seed-cbc',
              patientId: patientEmail,
              title: 'Complete Blood Count (CBC)',
              provider: 'MediLab Diagnostics',
              recordDate: '2025-03-14',
              category: 'Lab Report' as const,
              doctorName: 'Dr. Sarah Jenkins',
              description: 'Standard hematological screening showing normal red cell indices with mild platelet variation.',
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
              description: 'Serum vitamin levels assessment. Vitamin D is borderline low, supplementation recommended.',
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
              description: 'Radiological examination of the right wrist. No osseous fracture or dislocation seen.',
              fileName: 'right_wrist_xray.png',
              fileType: 'image/png',
              fileSize: '12.8 MB',
              isVerified: true,
              createdAt: '2026-02-06T11:15:00.000Z',
              updatedAt: '2026-02-06T11:15:00.000Z'
            }
          ];
          baseRecord = seeds.find(r => r.id === recordId);
        }

        if (!baseRecord) throw new Error('Record not found.');

        const editedDemoRecords = JSON.parse(sessionStorage.getItem('mv_edited_demo_records') || '{}');
        const data = editedDemoRecords[recordId] ? { ...baseRecord, ...editedDemoRecords[recordId] } : baseRecord;

        // Ensure cryptographic tokens are simulated
        const verifiedData = vaultService.ensureVerification(data);

        setRecord(verifiedData);

        // Initialize Edit values
        setEditTitle(verifiedData.title);
        setEditCategory(verifiedData.category);
        setEditDate(verifiedData.recordDate);
        setEditProvider(verifiedData.provider);
        setEditDoctor(verifiedData.doctorName || '');
        setEditDescription(verifiedData.description || '');
        setFileUrl('demo-url');
      } else {
        // 1. Fetch metadata (verifies email ownership)
        const data = vaultService.getRecord(patientEmail, recordId);
        setRecord(data);

        // Initialize Edit values
        setEditTitle(data.title);
        setEditCategory(data.category);
        setEditDate(data.recordDate);
        setEditProvider(data.provider);
        setEditDoctor(data.doctorName || '');
        setEditDescription(data.description || '');

        // 2. Fetch binary file Blob from IndexedDB
        const blob = await vaultService.getRecordFile(patientEmail, recordId);
        
        // Clean previous URL if existing
        if (fileUrl) {
          URL.revokeObjectURL(fileUrl);
        }
        
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as Error;
      setError(err.message || 'E-0444: Could not open the requested medical file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordData();

    // Cleanup Blob URL on unmount
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [recordId, patientEmail]);

  // Handle Edit details Submission
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDate || !editCategory) {
      alert('Please fill out all required details');
      return;
    }

    setSavingEdit(true);
    try {
      if (isDemoMode || recordId.startsWith('seed-')) {
        const editedDemoRecords = JSON.parse(sessionStorage.getItem('mv_edited_demo_records') || '{}');
        editedDemoRecords[recordId] = {
          title: editTitle,
          category: editCategory,
          recordDate: editDate,
          provider: editProvider,
          doctorName: editDoctor || undefined,
          description: editDescription || undefined,
          updatedAt: new Date().toISOString()
        };
        sessionStorage.setItem('mv_edited_demo_records', JSON.stringify(editedDemoRecords));

        setRecord(prev => prev ? { ...prev, ...editedDemoRecords[recordId] } : null);
        setEditModalOpen(false);
      } else {
        const updated = vaultService.updateRecord(patientEmail, recordId, {
          title: editTitle,
          category: editCategory,
          recordDate: editDate,
          provider: editProvider,
          doctorName: editDoctor || undefined,
          description: editDescription || undefined
        });
        
        setRecord(updated);
        setEditModalOpen(false);
      }
    } catch {
      alert('Failed to save record modifications.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Record Flow
  const handleDeleteRecord = async () => {
    try {
      if (isDemoMode || recordId.startsWith('seed-')) {
        const deletedDemoIds = JSON.parse(sessionStorage.getItem('mv_deleted_demo_ids') || '[]');
        deletedDemoIds.push(recordId);
        sessionStorage.setItem('mv_deleted_demo_ids', JSON.stringify(deletedDemoIds));
        setDeleteConfirmOpen(false);
        navigate('/patient/vault');
      } else {
        await vaultService.deleteRecord(patientEmail, recordId);
        setDeleteConfirmOpen(false);
        navigate('/patient/vault');
      }
    } catch {
      alert('Failed to erase record files.');
    }
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${record?.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #000; }
            h2 { border-bottom: 2px solid #8b5cf6; padding-bottom: 0.5rem; }
            .meta { margin-bottom: 2rem; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <h2>${record?.title}</h2>
          <div class="meta">
            <p><strong>Provider:</strong> ${record?.provider}</p>
            <p><strong>Doctor:</strong> ${record?.doctorName || 'Unspecified'}</p>
            <p><strong>Date:</strong> ${record?.recordDate}</p>
            <p><strong>Status:</strong> Verified Medical Record</p>
          </div>
          <div>
            <h3>Findings Summary</h3>
            <p>${record?.description || 'No notes attached.'}</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // AI Summary & Findings Generator
  const getAISummaryAndFindings = () => {
    if (recordId === 'seed-cbc' || recordId === 'rec-1') {
      return {
        summary: 'Standard hematological screening. White blood cells and red blood cells are normal. Platelet count is mildly decreased, indicating slight thrombocytopenia.',
        findings: [
          'Hemoglobin (Hb): 14.2 g/dL (Normal)',
          'White Blood Cells (WBC): 7.2 x10^3/µL (Normal)',
          'Platelet Count: 142 x10^3/µL (Low)',
          'No significant systemic hematological threat observed.'
        ]
      };
    }
    if (recordId === 'seed-vit') {
      return {
        summary: 'Vitamin Panel screening. The patient displays moderate deficiencies in both Vitamin D and Vitamin B12. Supplementation is highly recommended.',
        findings: [
          'Vitamin D (25-Hydroxy): 18.5 ng/mL (Low)',
          'Vitamin B12 (Cobalamin): 180 pg/mL (Low)',
          'Active supplement support indicated.'
        ]
      };
    }
    if (recordId === 'seed-xray' || recordId === 'rec-2') {
      return {
        summary: 'Radiological scan review of the wrist structure. Bone densities are normal with no displacement, fracture lines, or joint dislocations.',
        findings: [
          'Osseous alignment: Intact',
          'Joint Space: Preserved',
          'Diagnosis: Normal post-recovery right wrist study.'
        ]
      };
    }
    return {
      summary: 'Report successfully parsed. Health index parameters are within standard baselines. No acute alarms detected.',
      findings: [
        'Document Type: ' + (record?.category || 'Medical Report'),
        'Provider: ' + (record?.provider || 'Vault Clinic'),
        'Verified: Cryptographically signed'
      ]
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 0' }}>
        <LoadingState message="Decrypting secure health document..." type="spinner" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="detail-error-container animate-fade-in" style={{ padding: '3rem 0', maxWidth: '600px', margin: '0 auto' }}>
        <Card className="error-card" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
            <AlertCircle size={48} className="text-danger" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Access Denied or Missing File</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{error}</p>
            <Button variant="secondary" size="md" onClick={() => navigate('/patient/vault')} icon={<ArrowLeft size={16} />}>
              Back to Health Vault
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { summary, findings } = getAISummaryAndFindings();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0813',
      color: '#fff',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Fullscreen Header */}
      <header style={{
        height: '60px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/patient/vault')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#fff' }}>{record.title}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.category} &bull; {record.provider}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} icon={<Edit size={14} />}>
            Edit Tags
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(true)} icon={<Trash2 size={14} className="text-danger" />} className="btn-danger-hover">
            Delete
          </Button>
          <button 
            onClick={() => navigate('/patient/vault')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem'
            }}
          >
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main split dashboard view */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Document Preview & Interactive Tools (65% width) */}
        <div style={{
          width: '65%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0c0b16',
          overflow: 'hidden'
        }}>
          {/* Action Toolbar */}
          <div style={{
            height: '48px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            flexShrink: 0
          }}>
            <button onClick={() => setZoom(prev => Math.max(prev - 20, 40))} className="icon-circle-btn" style={{ color: '#fff' }} title="Zoom Out"><ZoomOut size={16} /></button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '45px', textAlign: 'center' }}>{zoom}%</span>
            <button onClick={() => setZoom(prev => Math.min(prev + 20, 200))} className="icon-circle-btn" style={{ color: '#fff' }} title="Zoom In"><ZoomIn size={16} /></button>
            
            <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.1)' }} />

            <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="icon-circle-btn" style={{ color: '#fff' }} title="Rotate"><RotateCw size={16} /></button>
            <button onClick={handlePrint} className="icon-circle-btn" style={{ color: '#fff' }} title="Print"><Printer size={16} /></button>
            
            {fileUrl && (
              <a href={fileUrl} download={record.fileName} className="icon-circle-btn" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Download"><Download size={16} /></a>
            )}
          </div>

          {/* Canvas area container */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <div style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Custom mock preview views */}
              {record.id === 'seed-cbc' || record.id === 'rec-1' ? (
                <div className="demo-doc-preview cbc-report-preview" style={{ width: '600px', background: '#131120', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
                  <div className="demo-doc-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>MediLab Diagnostics</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accredited Testing Center</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <p style={{ margin: 0 }}><strong>Patient:</strong> Aarav Sharma</p>
                      <p style={{ margin: 0 }}><strong>Ref No:</strong> LAB-2025-9921</p>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: 'var(--accent-violet)', margin: '1rem 0' }}>COMPLETE BLOOD COUNT (CBC)</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Parameter</th>
                        <th style={{ padding: '8px' }}>Observed</th>
                        <th style={{ padding: '8px' }}>Reference</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px' }}>Hemoglobin</td>
                        <td style={{ padding: '8px' }}>14.2 g/dL</td>
                        <td style={{ padding: '8px' }}>13.8 - 17.2</td>
                        <td style={{ padding: '8px', color: 'var(--accent-mint)' }}>Normal</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px' }}>Platelet Count</td>
                        <td style={{ padding: '8px' }}>142 x10^3/µL</td>
                        <td style={{ padding: '8px' }}>150 - 450</td>
                        <td style={{ padding: '8px', color: 'var(--color-danger)' }}>Low</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : record.id === 'seed-vit' ? (
                <div className="demo-doc-preview cbc-report-preview" style={{ width: '600px', background: '#131120', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
                  <div className="demo-doc-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Nova Diagnostic Centre</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pathology Labs Network</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <p style={{ margin: 0 }}><strong>Patient:</strong> Aarav Sharma</p>
                      <p style={{ margin: 0 }}><strong>Ref No:</strong> LAB-2025-7792</p>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: 'var(--accent-violet)', margin: '1rem 0' }}>VITAMIN PROFILE PANEL</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Parameter</th>
                        <th style={{ padding: '8px' }}>Observed</th>
                        <th style={{ padding: '8px' }}>Reference</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px' }}>Vitamin D (25-OH)</td>
                        <td style={{ padding: '8px' }}>18.5 ng/mL</td>
                        <td style={{ padding: '8px' }}>30.0 - 100.0</td>
                        <td style={{ padding: '8px', color: 'var(--color-danger)' }}>Low</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px' }}>Vitamin B12</td>
                        <td style={{ padding: '8px' }}>180 pg/mL</td>
                        <td style={{ padding: '8px' }}>200 - 900</td>
                        <td style={{ padding: '8px', color: 'var(--color-danger)' }}>Low</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : record.id === 'seed-xray' || record.id === 'rec-2' ? (
                <div className="demo-doc-preview xray-report-preview" style={{ width: '600px', background: '#131120', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
                  <div className="demo-doc-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>CityCare Hospital</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Radiology Department</span>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', textAlign: 'center', color: 'var(--accent-mint)', margin: '1rem 0' }}>RIGHT WRIST STUDY</h3>
                  <div style={{ background: '#0b0914', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <svg width="200" height="150" viewBox="0 0 200 150">
                      <rect width="200" height="150" rx="8" fill="#12101b" />
                      <line x1="100" y1="20" x2="100" y2="130" stroke="#a7a3b4" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                      <circle cx="100" cy="75" r="30" fill="none" stroke="#3cd1a1" strokeWidth="2" strokeDasharray="4" />
                      <text x="100" y="142" textAnchor="middle" fill="#3cd1a1" fontSize="9" fontWeight="bold">ALIGNMENT: INTACT</text>
                    </svg>
                  </div>
                </div>
              ) : fileUrl && fileUrl !== 'demo-url' ? (
                record.fileName.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={fileUrl} title={record.title} style={{ width: '650px', height: '500px', border: 'none' }} />
                ) : (
                  <img src={fileUrl} alt={record.title} style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px' }} />
                )
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Document preview unavailable in demo mode.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Medical & Verification Metadata (35% width) */}
        <div style={{
          width: '35%',
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(20px)',
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* AI Summary Section */}
          <Card padding="md" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-lavender)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} /> AI Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              {summary}
            </p>
          </Card>

          {/* Important Findings Section */}
          <Card padding="md" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '0 0 0.75rem 0' }}>
              Important Findings
            </h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {findings.map((finding, i) => (
                <li key={i}>{finding}</li>
              ))}
            </ul>
          </Card>

          {/* Doctor Notes Section */}
          <Card padding="md" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem 0' }}>
              Doctor Notes
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0, fontStyle: record.description ? 'normal' : 'italic' }}>
              {record.description || 'No notes attached by prescribing physician.'}
            </p>
          </Card>

          {/* Hospital, Doctor, Date Metadata */}
          <Card padding="md" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '0 0 0.75rem 0' }}>
              Care Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={14} className="text-muted" />
                <span>Hospital: <strong>{record.provider}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} className="text-muted" />
                <span>Physician: <strong>{record.doctorName || 'Unspecified'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} className="text-muted" />
                <span>Upload Date: <strong>{new Date(record.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
              </div>
            </div>
          </Card>

          {/* Verification, Hash and QR Code */}
          <Card padding="md" style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Verification Status</span>
              {record.isVerified && (
                <span style={{ color: 'var(--accent-mint)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified
                </span>
              )}
            </div>
            
            {/* Display security QR Code */}
            {record.qrCodeUrl && (
              <div style={{
                background: '#fff',
                padding: '0.5rem',
                borderRadius: '8px',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}>
                <img src={record.qrCodeUrl} alt="Security verification QR Code" style={{ width: '100%', height: '100%' }} />
              </div>
            )}

            <div style={{ width: '100%', fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'monospace', textAlign: 'center' }}>
              Hash: {record.digitalHash || 'N/A'}
            </div>
          </Card>
        </div>
      </div>

      {/* EDIT TAGS MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Record Details">
        <div className="edit-record-modal-layout">
          <div className="wizard-form-grid" style={{ padding: 0 }}>
            <TextInput label="Record Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            <div className="form-double-col">
              <SelectInput 
                label="Category" 
                value={editCategory} 
                onChange={(e) => setEditCategory(e.target.value as any)} 
                options={[
                  { value: 'Lab Report', label: 'Lab Report' },
                  { value: 'Imaging & Scan', label: 'Imaging & Scan' },
                  { value: 'Prescription', label: 'Prescription' }
                ]} 
                required 
              />
              <TextInput label="Date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
            </div>
            <div className="form-double-col">
              <TextInput label="Hospital" value={editProvider} onChange={(e) => setEditProvider(e.target.value)} required />
              <TextInput label="Doctor Name" value={editDoctor} onChange={(e) => setEditDoctor(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Description</label>
              <textarea className="form-textarea-box" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="modal-action-row" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <Button variant="secondary" size="md" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="mint" size="md" onClick={handleSaveEdit} isLoading={savingEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Delete Medical Record?">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <AlertCircle size={40} className="text-danger" style={{ marginBottom: '1rem' }} />
          <p>Are you sure you want to permanently delete this medical record from your vault? This action is irreversible.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Button variant="secondary" size="md" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleDeleteRecord} className="btn-danger-hover">Delete Record</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
