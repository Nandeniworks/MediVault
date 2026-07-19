import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useRouter } from '../../context/RouterContext';
import { vaultService } from '../../services/vaultService';
import type { MedicalRecord } from '../../services/vaultService';
import { 
  FileText, Search, Filter, ShieldCheck, Eye, Download, Share2, 
  Calendar, User, Building, Pill, Syringe, HeartPulse, 
  CheckCircle2
} from 'lucide-react';

export const TestHistoryView: React.FC = () => {
  const { user, navigate } = useRouter();
  const patientEmail = user?.email || '';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, hospital, category, doctor
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seeded example cards requested by user
  const seedRecords: MedicalRecord[] = [
    {
      id: 'seed-cbc',
      patientId: patientEmail,
      title: 'Complete Blood Count (CBC)',
      provider: 'MediLab Diagnostics',
      recordDate: '2025-03-14',
      category: 'Lab Report',
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
      category: 'Lab Report',
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
      category: 'Imaging & Scan',
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

  // Load records from vaultService and combine with seed records
  useEffect(() => {
    if (!patientEmail) return;
    const userRecords = vaultService.getRecords(patientEmail);
    
    // Prevent duplicate keys if user already has seed records
    const filteredUserRecords = userRecords.filter(
      ur => !seedRecords.some(sr => sr.id === ur.id || (sr.title === ur.title && sr.recordDate === ur.recordDate))
    );

    setRecords([...seedRecords, ...filteredUserRecords]);
  }, [patientEmail]);

  // Show a temporary toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper category mapping to filter categories
  const getFilterCategory = (category: MedicalRecord['category']): string => {
    switch (category) {
      case 'Lab Report':
        return 'Lab Reports';
      case 'Imaging & Scan':
        return 'Radiology';
      case 'Prescription':
        return 'Prescriptions';
      case 'Vaccination Record':
        return 'Vaccinations';
      case 'Consultation Note':
      case 'Discharge Summary':
        return 'Hospital Visits';
      default:
        return 'Lab Reports'; // Default fallback
    }
  };

  // Filter & Search
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'All' || getFilterCategory(rec.category) === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime();
    }
    if (sortBy === 'hospital') {
      return a.provider.localeCompare(b.provider);
    }
    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    if (sortBy === 'doctor') {
      const docA = a.doctorName || '';
      const docB = b.doctorName || '';
      return docA.localeCompare(docB);
    }
    return 0;
  });

  // Action helpers
  const handleDownload = (e: React.MouseEvent, record: MedicalRecord) => {
    e.stopPropagation();
    showToast(`Downloading "${record.fileName}"...`);
    // Create a dummy download
    const element = document.createElement('a');
    const file = new Blob([`Dummy content for ${record.title}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = record.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = (e: React.MouseEvent, record: MedicalRecord) => {
    e.stopPropagation();
    const shareLink = `${window.location.origin}/patient/vault/${record.id}?share=true`;
    navigator.clipboard.writeText(shareLink);
    showToast(`Share link copied to clipboard!`);
  };

  // Helper icons
  const getCategoryIcon = (category: MedicalRecord['category']) => {
    switch (category) {
      case 'Lab Report':
        return <FileText className="text-violet-400" size={20} />;
      case 'Imaging & Scan':
        return <HeartPulse className="text-teal-400" size={20} />;
      case 'Prescription':
        return <Pill className="text-pink-400" size={20} />;
      case 'Vaccination Record':
        return <Syringe className="text-emerald-400" size={20} />;
      default:
        return <FileText className="text-blue-400" size={20} />;
    }
  };

  // Category Colors
  const getCategoryColor = (category: MedicalRecord['category']): 'mint' | 'lavender' | 'violet' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (category) {
      case 'Lab Report': return 'lavender';
      case 'Imaging & Scan': return 'mint';
      case 'Prescription': return 'violet';
      case 'Vaccination Record': return 'success';
      case 'Consultation Note': return 'warning';
      case 'Discharge Summary': return 'info';
      default: return 'info';
    }
  };

  return (
    <div className="health-vault-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-fade-in" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          color: '#fff',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}>
          <CheckCircle2 size={16} className="text-mint" />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Medical Records Explorer</h2>
          <p className="vault-sub-text">Search, filter, and inspect all diagnostic reports, imaging scans, and prescriptions.</p>
        </div>
      </div>

      {/* Controls Card */}
      <Card className="vault-controls-card animate-fade-in" padding="md">
        <div className="controls-row-top">
          {/* Search bar */}
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by report name, doctor, hospital, or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-box"
              id="explorer-search-field"
            />
          </div>

          <div className="selectors-flex-wrap">
            {/* Sort Selector */}
            <div className="selector-group">
              <Filter size={14} className="sel-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select-box"
                aria-label="Sort records order"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="hospital">Hospital A-Z</option>
                <option value="category">Category A-Z</option>
                <option value="doctor">Doctor A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="controls-row-bottom">
          <span className="pills-label">Filter:</span>
          <div className="category-pills-row">
            {['All', 'Lab Reports', 'Radiology', 'Prescriptions', 'Vaccinations', 'Hospital Visits'].map((filter) => (
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

      {/* Card Grid */}
      {sortedRecords.length === 0 ? (
        <div className="empty-explorer-state" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-medium)',
          marginTop: '1.5rem'
        }}>
          <Search size={40} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No medical records found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Try refining your search keyword or selecting a different filter category.
          </p>
        </div>
      ) : (
        <div className="vault-records-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {sortedRecords.map((rec) => (
            <Card 
              key={rec.id} 
              className="record-grid-card border-glow-hover" 
              padding="none" 
              hoverable
              onClick={() => navigate(`/patient/vault/${rec.id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Card Header & category tag */}
              <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    {getCategoryIcon(rec.category)}
                  </div>
                  <Badge variant={getCategoryColor(rec.category)}>
                    {rec.category}
                  </Badge>
                </div>

                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.75rem',
                  lineHeight: 1.4
                }}>
                  {rec.title}
                </h3>

                {/* Info Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={14} className="text-muted" />
                    <span>{rec.provider}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} className="text-muted" />
                    <span>{rec.doctorName || 'Unspecified Doctor'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} className="text-muted" />
                    <span>{new Date(rec.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Verification & Actions bar */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '0.75rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  {rec.isVerified && (
                    <span style={{ 
                      color: 'var(--accent-mint)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.25rem' 
                    }}>
                      <ShieldCheck size={14} /> Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => navigate(`/patient/vault/${rec.id}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="View Full Report"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDownload(e, rec)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Download Report"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleShare(e, rec)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Share Report"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
