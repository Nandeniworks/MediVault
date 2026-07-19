/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState, LoadingState } from '../common/States';
import { TextInput, SelectInput } from '../common/FormElements';
import { useRouter } from '../../context/RouterContext';
import { vaultService } from '../../services/vaultService';
import type { MedicalRecord } from '../../services/vaultService';
import { demoRecords } from '../../services/patientService';
import { activityLogService } from '../../services/activityLogService';
import { 
  FileText, Image, Pill, Clipboard, FileSpreadsheet, Syringe, File, 
  Search, Grid, List, Plus, Upload, X, Check, ArrowLeft, ArrowRight, 
  Calendar, Edit3, Trash2, Eye, Filter, AlertCircle, Info, MoreVertical
} from 'lucide-react';

interface VaultProps {
  isDemoMode?: boolean;
  onToggleDemoMode?: (val: boolean) => void;
}

export const PatientVault: React.FC<VaultProps> = ({ isDemoMode = false, onToggleDemoMode }) => {
  const { user, navigate, path } = useRouter();
  const patientEmail = user?.email || '';

  // Data State
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, recently_uploaded, alpha
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('mv_vault_view_mode') as 'grid' | 'list') || 'grid';
  });

  // Action Menu Dropdown active IDs
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);

  // Add flow Wizard Step State
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFilePreview, setUploadFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [savingRecord, setSavingRecord] = useState(false);

  // Add flow Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MedicalRecord['category']>('Lab Report');
  const [formDate, setFormDate] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Drag and Drop Visual State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Records
  const loadRecords = () => {
    if (!patientEmail) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        const deletedDemoIds = JSON.parse(sessionStorage.getItem('mv_deleted_demo_ids') || '[]');
        const editedDemoRecords = JSON.parse(sessionStorage.getItem('mv_edited_demo_records') || '{}');
        const activeDemo = demoRecords
          .filter(r => !deletedDemoIds.includes(r.id))
          .map(r => editedDemoRecords[r.id] ? { ...r, ...editedDemoRecords[r.id] } : r);
        setRecords(activeDemo);
        setError(null);
      } else {
        const list = vaultService.getRecords(patientEmail);
        setRecords(list);
        setError(null);
      }
    } catch {
      setError('Could not access your health records catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientEmail, isDemoMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upload') === 'true') {
      setUploadStep(1);
      setAddModalOpen(true);
      window.history.replaceState(null, '', '/patient/vault');
    }
  }, [path]);

  // Persist View Mode
  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('mv_vault_view_mode', mode);
  };

  // Helper category icon retriever
  const getCategoryIcon = (category: MedicalRecord['category']) => {
    switch (category) {
      case 'Lab Report':
        return <FileText size={18} />;
      case 'Imaging & Scan':
        return <Image size={18} />;
      case 'Prescription':
        return <Pill size={18} />;
      case 'Consultation Note':
        return <Clipboard size={18} />;
      case 'Discharge Summary':
        return <FileSpreadsheet size={18} />;
      case 'Vaccination Record':
        return <Syringe size={18} />;
      case 'Other Document':
      default:
        return <File size={18} />;
    }
  };

  // Helper category colors
  const getCategoryColor = (category: MedicalRecord['category']): 'mint' | 'lavender' | 'violet' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (category) {
      case 'Lab Report': return 'lavender';
      case 'Imaging & Scan': return 'mint';
      case 'Prescription': return 'violet';
      case 'Consultation Note': return 'warning';
      case 'Discharge Summary': return 'info';
      case 'Vaccination Record': return 'success';
      case 'Other Document':
      default:
        return 'info';
    }
  };

  // Drag handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    setFileError(null);
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload PDF, JPG, JPEG, or PNG.');
      return;
    }

    if (file.size > maxSize) {
      setFileError('File size exceeds the 10MB limit.');
      return;
    }

    setUploadFile(file);
    
    // Generate image preview if applicable
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadFilePreview(null);
    setFileError(null);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Step 1 to Step 2 transition validation
  const handleStep1Next = () => {
    if (!uploadFile) {
      setFileError('Please select or drop a valid file document.');
      return;
    }
    // Pre-fill form title with file name minus extension
    const baseName = uploadFile.name.replace(/\.[^/.]+$/, "");
    setFormTitle(baseName.replace(/[_-]/g, ' '));
    setUploadStep(2);
  };

  // Save Record Submission
  const handleSaveRecord = async () => {
    if (!formTitle.trim() || !formDate || !formCategory) {
      alert('Please fill out all required details (Title, Category, and Medical Date)');
      return;
    }

    if (!uploadFile) return;

    setSavingRecord(true);
    try {
      await vaultService.saveRecord(
        patientEmail,
        {
          title: formTitle,
          category: formCategory,
          recordDate: formDate,
          provider: formProvider,
          doctorName: formDoctor || undefined,
          description: formDescription || undefined
        },
        uploadFile
      );

      // Log this action: Patient uploaded report
      const userName = user?.name ? `${user.name} (Patient)` : 'Patient';
      activityLogService.logAction(userName, `Uploaded ${formTitle}`, patientEmail);

      // Clean form inputs
      handleRemoveFile();
      setFormTitle('');
      setFormCategory('Lab Report');
      setFormDate('');
      setFormProvider('');
      setFormDoctor('');
      setFormDescription('');
      
      setAddModalOpen(false);
      setUploadStep(1);
      
      // Reload lists
      loadRecords();

      // Switch to real vault to see the uploaded record if currently in demo mode
      if (isDemoMode && onToggleDemoMode) {
        onToggleDemoMode(false);
      }
    } catch (e: any) {
      if (e?.message === 'DUPLICATE_UPLOAD') {
        alert('Duplicate Upload Blocked: This document is already secure in your health vault.');
      } else {
        alert('E-0441: Failed to write and save document metadata to database.');
      }
    } finally {
      setSavingRecord(false);
    }
  };

  // Delete Record flow
  const triggerDelete = (rec: MedicalRecord) => {
    setRecordToDelete(rec);
    setDeleteConfirmOpen(true);
    setActiveMenuId(null);
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      if (isDemoMode) {
        const deletedDemoIds = JSON.parse(sessionStorage.getItem('mv_deleted_demo_ids') || '[]');
        deletedDemoIds.push(recordToDelete.id);
        sessionStorage.setItem('mv_deleted_demo_ids', JSON.stringify(deletedDemoIds));
        setDeleteConfirmOpen(false);
        setRecordToDelete(null);
        loadRecords();
      } else {
        await vaultService.deleteRecord(patientEmail, recordToDelete.id);
        setDeleteConfirmOpen(false);
        setRecordToDelete(null);
        loadRecords();
      }
    } catch {
      alert('Failed to delete medical file.');
    }
  };

  // Sorter / Filter queries
  const categoriesList = [
    'All',
    'Lab Report',
    'Imaging & Scan',
    'Prescription',
    'Consultation Note',
    'Discharge Summary',
    'Vaccination Record',
    'Other Document'
  ];

  // Dynamic Year range calculations for filters
  const yearsList = ['All', ...Array.from(new Set(records.map(r => new Date(r.recordDate).getFullYear().toString())))].sort((a,b) => b.localeCompare(a));

  const filteredRecords = records
    .filter(rec => {
      // 1. Search Query Match
      const matchesSearch = 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category Pill Filter Match
      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;

      // 3. Year Date Filter Match
      const matchesYear = selectedYear === 'All' || new Date(rec.recordDate).getFullYear().toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesYear;
    })
    .sort((a, b) => {
      // 4. Sort selection logic
      if (sortBy === 'newest') {
        return new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime();
      } else if (sortBy === 'recently_uploaded') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setSortBy('newest');
  };

  const toggleDropdownMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  useEffect(() => {
    const closeMenus = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  return (
    <div className="health-vault-container">
      
      {/* ==================================================
          VAULT HEADER
          ================================================== */}
      <div className="vault-header-row">
        <div>
          <h2 className="vault-title-text text-gradient">Health Vault</h2>
          <p className="vault-sub-text">Your medical records, organized in one place. Only you control access.</p>
        </div>
        <Button 
          variant="primary" 
          size="md"
          icon={<Plus size={16} />}
          onClick={() => { setUploadStep(1); setAddModalOpen(true); }}
        >
          Add Medical Record
        </Button>
      </div>

      {/* ==================================================
          VAULT CONTROL AREA: SEARCH, PILLS, FILTERS
          ================================================== */}
      <Card className="vault-controls-card animate-fade-in" padding="md">
        
        {/* Search & Sort & View Toggle */}
        <div className="controls-row-top">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by record title, provider, doctor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-box"
              id="search-records-field"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="selectors-flex-wrap">
            {/* Year Selector */}
            <div className="selector-group">
              <Calendar size={14} className="sel-icon" />
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="control-select-box"
                aria-label="Filter by record year"
              >
                <option value="All">All Years</option>
                {yearsList.filter(y => y !== 'All').map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="selector-group">
              <Filter size={14} className="sel-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select-box"
                aria-label="Sort records order"
              >
                <option value="newest">Newest Medical Date</option>
                <option value="oldest">Oldest Medical Date</option>
                <option value="recently_uploaded">Recently Uploaded</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>

            {/* Layout Toggles */}
            <div className="view-mode-pill">
              <button 
                onClick={() => toggleViewMode('grid')}
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                aria-label="Grid view layout"
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => toggleViewMode('list')}
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                aria-label="List view layout"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="controls-row-bottom">
          <span className="pills-label">Category:</span>
          <div className="category-pills-row">
            {categoriesList.map((cat) => {
              const getCategoryLabel = (category: string) => {
                switch (category) {
                  case 'All': return 'All Records';
                  case 'Lab Report': return 'Lab Reports';
                  case 'Imaging & Scan': return 'Imaging & Scans';
                  case 'Prescription': return 'Prescriptions';
                  case 'Consultation Note': return 'Consultation Notes';
                  case 'Discharge Summary': return 'Discharge Summaries';
                  case 'Vaccination Record': return 'Vaccination Records';
                  case 'Other Document': return 'Other Documents';
                  default: return category;
                }
              };
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {getCategoryLabel(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'All' || selectedYear !== 'All' || searchQuery) && (
          <div className="active-filters-info-row">
            <span className="info-txt">Showing filtered records:</span>
            <button className="clear-filters-txt-btn" onClick={clearAllFilters}>
              Reset filters & search
            </button>
          </div>
        )}
      </Card>

      {/* ==================================================
          RECORDS RENDER OR LOADING / EMPTY STATES
          ================================================== */}
      {loading ? (
        <div style={{ padding: '4rem 0' }}>
          <LoadingState message="Loading secure vault documents..." type="spinner" />
        </div>
      ) : error ? (
        <div className="error-banner">
          <AlertCircle size={20} className="text-danger" />
          <span>{error}</span>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={{ padding: '3rem 0' }}>
          {records.length === 0 ? (
            <EmptyState 
              title="Your Health Vault is ready"
              description="Upload your clinical reports, prescriptions, scans, or vaccinations to build a secure medical history catalog."
              icon={<Upload size={40} className="text-muted" />}
              action={
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={() => { setUploadStep(1); setAddModalOpen(true); }}
                >
                  Add Your First Record
                </Button>
              }
            />
          ) : (
            <EmptyState 
              title="No records match current filters"
              description="Try adjusting your query terms, removing category restrictions, or resetting sort configurations."
              icon={<Search size={40} className="text-muted" />}
              action={
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              }
            />
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW LAYOUT */
        <div className="vault-records-grid animate-fade-in">
          {filteredRecords.map((rec) => (
            <Card key={rec.id} className="record-grid-card" padding="none" hoverable>
              
              {/* Document/Category top preview panel */}
              <div className="card-top-preview" onClick={() => navigate(`/patient/vault/${rec.id}`)}>
                <div className={`category-icon-bubble ${rec.category.replace(/ & /g, '-').replace(/ /g, '-').toLowerCase()}`}>
                  {getCategoryIcon(rec.category)}
                </div>
                <Badge variant={getCategoryColor(rec.category)} className="preview-cat-badge">
                  {rec.category}
                </Badge>
                
                {/* Visual filetype signifier */}
                <div className="filetype-tab-badge">
                  {rec.fileType.split('/').pop()?.toUpperCase() || 'FILE'}
                </div>
              </div>

              {/* Text metadata content block */}
              <div className="card-body-meta">
                <div className="title-action-row">
                  <h4 className="rec-title" onClick={() => navigate(`/patient/vault/${rec.id}`)}>
                    {rec.title}
                  </h4>
                  
                  {/* More options menu dropdown trigger */}
                  <div className="dropdown-options-trigger-wrapper">
                    <button 
                      className="options-dots-btn"
                      onClick={(e) => toggleDropdownMenu(rec.id, e)}
                      aria-label="Record options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === rec.id && (
                      <div className="dropdown-options-menu animate-fade-in">
                        <button className="menu-opt-btn" onClick={() => navigate(`/patient/vault/${rec.id}?edit=true`)}>
                          <Edit3 size={14} />
                          Edit Details
                        </button>
                        <button className="menu-opt-btn text-danger" onClick={() => triggerDelete(rec)}>
                          <Trash2 size={14} />
                          Delete Record
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rec-meta-details">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                    <span className="provider-name">{rec.provider || 'Unspecified Provider'}</span>
                    <span style={{ color: 'var(--accent-mint)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                      <Check size={12} /> Verified
                    </span>
                  </div>
                  <div className="meta-footer-info">
                    <span className="medical-date">{new Date(rec.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="dot-spacer">•</span>
                    <span className="file-size">{rec.fileSize}</span>
                  </div>
                </div>
              </div>

            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW LAYOUT (TABLE) */
        <Card className="vault-records-list-card animate-fade-in" padding="none">
          <div className="table-responsive-wrapper">
            <table className="vault-records-table">
              <thead>
                <tr>
                  <th>Record Name</th>
                  <th>Category</th>
                  <th>Medical Date</th>
                  <th>Healthcare Provider</th>
                  <th>Verification</th>
                  <th>File Spec</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="table-row-hoverable" onClick={() => navigate(`/patient/vault/${rec.id}`)}>
                    
                    <td className="cell-record-title">
                      <div className="title-icon-flex">
                        <div className="cell-icon">
                          {getCategoryIcon(rec.category)}
                        </div>
                        <span className="title-text-lit">{rec.title}</span>
                      </div>
                    </td>

                    <td>
                      <Badge variant={getCategoryColor(rec.category)}>
                        {rec.category}
                      </Badge>
                    </td>

                    <td>
                      <span className="table-date">
                        {new Date(rec.recordDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    <td>
                      <span className="table-provider">{rec.provider || 'Unspecified'}</span>
                    </td>

                    <td>
                      <span style={{ color: 'var(--accent-mint)', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                        <Check size={12} /> Verified
                      </span>
                    </td>

                    <td>
                      <span className="table-filespec">{rec.fileType.split('/').pop()?.toUpperCase()} ({rec.fileSize})</span>
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="list-actions-flex-row">
                        <button 
                          className="list-action-btn"
                          onClick={() => navigate(`/patient/vault/${rec.id}`)}
                          title="Open inspector"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="list-action-btn"
                          onClick={() => navigate(`/patient/vault/${rec.id}?edit=true`)}
                          title="Edit details"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="list-action-btn text-danger"
                          onClick={() => triggerDelete(rec)}
                          title="Delete record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ==================================================
          ADD MEDICAL RECORD FLOW MODAL (3 WIZARD STEPS)
          ================================================== */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => { if (!savingRecord) setAddModalOpen(false); }}
        title="Add Medical Record"
      >
        <div className="add-record-wizard-container">
          
          {/* Progress node labels */}
          <div className="wizard-progress-bar">
            <div className={`progress-node ${uploadStep >= 1 ? 'active' : ''} ${uploadStep > 1 ? 'complete' : ''}`}>
              <span className="node-num">{uploadStep > 1 ? <Check size={12} /> : '1'}</span>
              <span className="node-label">Choose Document</span>
            </div>
            <div className="progress-line-connect">
              <div className="fill-progress" style={{ width: uploadStep > 1 ? '100%' : '0%' }}></div>
            </div>
            <div className={`progress-node ${uploadStep >= 2 ? 'active' : ''} ${uploadStep > 2 ? 'complete' : ''}`}>
              <span className="node-num">{uploadStep > 2 ? <Check size={12} /> : '2'}</span>
              <span className="node-label">Enter Details</span>
            </div>
            <div className="progress-line-connect">
              <div className="fill-progress" style={{ width: uploadStep > 2 ? '100%' : '0%' }}></div>
            </div>
            <div className={`progress-node ${uploadStep >= 3 ? 'active' : ''}`}>
              <span className="node-num">3</span>
              <span className="node-label">Review & Save</span>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.25rem 0' }} />

          {/* WIZARD CONTENT SWAP */}
          
          {/* STEP 1: CHOOSE DOCUMENT */}
          {uploadStep === 1 && (
            <div className="wizard-step-panel animate-fade-in">
              <h3 className="step-heading-txt">Select document source</h3>
              <p className="step-desc-txt">Upload a local medical file (PDF or images) to save into your secure health archive.</p>
              
              <div 
                className={`drag-drop-upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerUploadClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  id="vault-file-picker"
                />

                <div className="upload-zone-graphics">
                  <div className="icon-envelope">
                    <Upload size={32} />
                  </div>
                  
                  {dragActive ? (
                    <span className="label-main">Drop document here...</span>
                  ) : (
                    <>
                      <span className="label-main">Drag and drop file or <span className="text-mint">browse files</span></span>
                      <span className="label-limits">Supports: PDF, JPG, JPEG, PNG (Max size: 10MB)</span>
                    </>
                  )}
                </div>
              </div>

              {fileError && (
                <div className="file-error-alert animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Selected File presentation */}
              {uploadFile && (
                <Card className="selected-file-preview-card animate-fade-in" padding="sm">
                  <div className="file-summary-row">
                    <div className="icon-preview-lit">
                      {uploadFile.type.startsWith('image/') ? (
                        uploadFilePreview ? (
                          <img src={uploadFilePreview} alt="Thumbnail preview" className="thumb-fit" />
                        ) : (
                          <Image size={18} />
                        )
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    
                    <div className="file-meta-strings">
                      <span className="name-string">{uploadFile.name}</span>
                      <span className="size-string">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {uploadFile.type || 'Unknown Type'}</span>
                    </div>

                    <button className="remove-file-x-btn" onClick={handleRemoveFile} aria-label="Erase selected file">
                      <X size={16} />
                    </button>
                  </div>
                </Card>
              )}

              <div className="wizard-action-footer">
                <Button variant="secondary" size="md" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleStep1Next}
                  disabled={!uploadFile}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS FORM */}
          {uploadStep === 2 && (
            <div className="wizard-step-panel animate-fade-in">
              <h3 className="step-heading-txt">Document Metadata details</h3>
              <p className="step-desc-txt">Add tags to describe this record for convenient chronological querying.</p>

              <div className="wizard-form-grid">
                <TextInput 
                  label="Record Title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count"
                  required
                />

                <div className="form-double-col">
                  <SelectInput 
                    label="Record Category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MedicalRecord['category'])}
                    options={[
                      { value: 'Lab Report', label: 'Lab Report' },
                      { value: 'Imaging & Scan', label: 'Imaging & Scan' },
                      { value: 'Prescription', label: 'Prescription' },
                      { value: 'Consultation Note', label: 'Consultation Note' },
                      { value: 'Discharge Summary', label: 'Discharge Summary' },
                      { value: 'Vaccination Record', label: 'Vaccination Record' },
                      { value: 'Other Document', label: 'Other Document' }
                    ]}
                    required
                  />

                  <TextInput 
                    label="Medical Record Date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-double-col">
                  <TextInput 
                    label="Healthcare Provider / Clinic"
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    placeholder="e.g. Apex Diagnostics"
                  />

                  <TextInput 
                    label="Doctor Name (Optional)"
                    value={formDoctor}
                    onChange={(e) => setFormDoctor(e.target.value)}
                    placeholder="e.g. Dr. Robert Chen"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Personal Notes (Optional)</label>
                  <textarea 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="form-textarea-box"
                    placeholder="Provide supplementary descriptions, parameters, or reasons for this test result..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="wizard-action-footer">
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => setUploadStep(1)}
                  icon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={() => setUploadStep(3)}
                  disabled={!formTitle.trim() || !formDate || !formCategory}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Review Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW AND SAVE */}
          {uploadStep === 3 && (
            <div className="wizard-step-panel animate-fade-in">
              <h3 className="step-heading-txt">Confirm metadata mapping</h3>
              <p className="step-desc-txt">Please inspect your record metadata parameters before final local vault index keys are generated.</p>

              <Card className="review-summary-bento" padding="md">
                <div className="review-file-badge-row">
                  <div className="f-icon">
                    {uploadFile?.type.startsWith('image/') ? <Image size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="f-meta">
                    <span className="name">{uploadFile?.name}</span>
                    <span className="size">{(uploadFile?.size ? uploadFile.size / (1024 * 1024) : 0).toFixed(2)} MB &bull; {uploadFile?.type || 'binary'}</span>
                  </div>
                </div>

                <div className="review-fields-grid">
                  <div className="field-cell">
                    <span className="label">Record Title</span>
                    <span className="val">{formTitle}</span>
                  </div>
                  <div className="field-cell">
                    <span className="label">Category</span>
                    <span className="val">
                      <Badge variant={getCategoryColor(formCategory)}>{formCategory}</Badge>
                    </span>
                  </div>
                  <div className="field-cell">
                    <span className="label">Record Date</span>
                    <span className="val">{new Date(formDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="field-cell">
                    <span className="label">Healthcare Provider</span>
                    <span className="val">{formProvider || 'Unspecified'}</span>
                  </div>
                  <div className="field-cell">
                    <span className="label">Doctor Name</span>
                    <span className="val">{formDoctor || 'Unspecified'}</span>
                  </div>
                  <div className="field-cell">
                    <span className="label">Storage Location</span>
                    <span className="val text-mint">✓ Secure Local Browser Sandbox (IndexedDB)</span>
                  </div>
                </div>

                {formDescription && (
                  <div className="review-notes-cell">
                    <span className="label">Personal notes / Description:</span>
                    <p className="note-desc">{formDescription}</p>
                  </div>
                )}
              </Card>

              {/* Informational Disclaimer */}
              <div className="info-box-caveat">
                <Info size={16} className="text-lavender" />
                <span>Saving registers your document locally. Since this sandbox runs in-browser, files do not transfer automatically across devices.</span>
              </div>

              {/* Submit panel */}
              <div className="wizard-action-footer">
                <Button 
                  variant="secondary" 
                  size="md" 
                  onClick={() => setUploadStep(2)}
                  disabled={savingRecord}
                  icon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>
                
                <Button 
                  variant="mint" 
                  size="md" 
                  onClick={handleSaveRecord}
                  isLoading={savingRecord}
                  icon={!savingRecord && <Check size={16} />}
                >
                  {savingRecord ? 'Encrypting & Saving...' : 'Save to Health Vault'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* ==================================================
          DELETE CONFIRMATION MODAL
          ================================================== */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete this medical record?"
      >
        <div className="delete-confirmation-modal-layout">
          <div className="alert-badge-circle">
            <AlertCircle size={28} className="text-danger" />
          </div>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '1rem 0', lineHeight: '1.5' }}>
            This will remove the record from your Health Vault. This action may not be reversible.
          </p>
          
          <div className="modal-action-row" style={{ marginTop: '1.5rem' }}>
            <Button variant="secondary" size="md" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={confirmDeleteRecord} className="btn-danger-hover">
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
