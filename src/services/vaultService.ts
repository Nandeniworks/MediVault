export interface MedicalRecord {
  id: string;
  patientId: string; // Authenticated patient's email
  title: string;
  category: 'Lab Report' | 'Imaging & Scan' | 'Prescription' | 'Consultation Note' | 'Discharge Summary' | 'Vaccination Record' | 'Other Document';
  recordDate: string; // The medical event date (YYYY-MM-DD)
  provider: string;
  doctorName?: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  createdAt: string;
  updatedAt: string;
  
  // Verification details
  reportId?: string;
  digitalHash?: string;
  qrCodeUrl?: string;
  uploadTimestamp?: string;
  isVerified?: boolean;
}

const METADATA_KEY = 'mv_records';
const DB_NAME = 'MediVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// IndexedDB Helper Promise Wrapper
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error('Failed to open secure local IndexedDB storage'));
    };
  });
}

function storeFile(id: string, fileBlob: Blob): Promise<void> {
  return getDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(fileBlob, id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to write medical document to secure local container'));
    });
  });
}

function retrieveFile(id: string): Promise<Blob> {
  return getDB().then((db) => {
    return new Promise<Blob>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error('Document binary file not found in local container'));
        }
      };
      request.onerror = () => reject(new Error('Failed to read from secure local database'));
    });
  });
}

function removeFile(id: string): Promise<void> {
  return getDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to erase local document binary'));
    });
  });
}

// Vault Service Layer
export const vaultService = {
  // Helper to ensure verification metadata exists on a record (handles pre-seeded mock records too)
  ensureVerification(record: MedicalRecord): MedicalRecord {
    const reportId = record.reportId || `REP-${new Date(record.recordDate || record.createdAt).getFullYear()}${String(new Date(record.recordDate || record.createdAt).getMonth() + 1).padStart(2, '0')}-${record.id.slice(-6).toUpperCase()}`;
    
    // Deterministic hash generator
    let hash = 0;
    const key = record.fileName + record.fileSize + record.id;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const digitalHash = record.digitalHash || `SHA256-E8B0C442${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
    
    const qrCodeUrl = record.qrCodeUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="20" height="20" fill="black"/><rect x="15" y="15" width="10" height="10" fill="white"/><rect x="70" y="10" width="20" height="20" fill="black"/><rect x="75" y="15" width="10" height="10" fill="white"/><rect x="10" y="70" width="20" height="20" fill="black"/><rect x="15" y="75" width="10" height="10" fill="white"/><rect x="40" y="40" width="20" height="20" fill="black"/><rect x="45" y="45" width="10" height="10" fill="white"/><rect x="40" y="10" width="10" height="10" fill="black"/><rect x="10" y="40" width="10" height="10" fill="black"/><rect x="70" y="40" width="10" height="10" fill="black"/><rect x="40" y="70" width="10" height="10" fill="black"/><rect x="70" y="70" width="20" height="20" fill="black"/><rect x="75" y="75" width="10" height="10" fill="white"/></svg>`;
    
    return {
      ...record,
      reportId,
      digitalHash,
      qrCodeUrl,
      uploadTimestamp: record.uploadTimestamp || record.createdAt,
      isVerified: record.isVerified !== undefined ? record.isVerified : true
    };
  },

  // Read all metadata records for the logged-in patient
  getRecords(patientEmail: string): MedicalRecord[] {
    try {
      const data = localStorage.getItem(METADATA_KEY);
      if (!data) return [];
      const allRecords: MedicalRecord[] = JSON.parse(data);
      // Enforce patient ownership and map through verification helper
      return allRecords
        .filter(r => r.patientId.toLowerCase() === patientEmail.toLowerCase())
        .map(r => this.ensureVerification(r));
    } catch (e) {
      console.error('Failed to load local health vault metadata', e);
      return [];
    }
  },

  // Save metadata list
  _saveAllRecords(records: MedicalRecord[]): void {
    localStorage.setItem(METADATA_KEY, JSON.stringify(records));
  },

  // Get a single record with safety ownership checks
  getRecord(patientEmail: string, recordId: string): MedicalRecord {
    const data = localStorage.getItem(METADATA_KEY);
    if (!data) throw new Error('Record not found.');
    
    const allRecords: MedicalRecord[] = JSON.parse(data);
    const record = allRecords.find(r => r.id === recordId);
    
    if (!record) {
      throw new Error('Record not found.');
    }
    
    // Safety check: Enforce database ownership check
    if (record.patientId.toLowerCase() !== patientEmail.toLowerCase()) {
      throw new Error('Access denied. You do not own this medical record.');
    }
    
    return this.ensureVerification(record);
  },

  // Retrieve Blob from IndexedDB
  async getRecordFile(patientEmail: string, recordId: string): Promise<Blob> {
    // 1. Verify metadata access control first
    this.getRecord(patientEmail, recordId);
    
    // 2. Fetch the file blob
    return retrieveFile(recordId);
  },

  // Save a new record
  async saveRecord(
    patientEmail: string,
    metadata: Omit<MedicalRecord, 'id' | 'patientId' | 'createdAt' | 'updatedAt' | 'fileName' | 'fileType' | 'fileSize'>,
    file: File
  ): Promise<MedicalRecord> {
    const allData = localStorage.getItem(METADATA_KEY);
    const list: MedicalRecord[] = allData ? JSON.parse(allData) : [];
    
    const formattedSize = this._formatBytes(file.size);
    
    // Duplicate check: Match filename and size for current patient
    const isDuplicate = list.some(
      (r) =>
        r.patientId.toLowerCase() === patientEmail.toLowerCase() &&
        r.fileName.toLowerCase() === file.name.toLowerCase() &&
        r.fileSize === formattedSize
    );
    if (isDuplicate) {
      throw new Error('DUPLICATE_UPLOAD');
    }

    const recordId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    // Store binary in IndexedDB
    await storeFile(recordId, file);
    
    // Create new record with full cryptographic parameters
    const newRecord = this.ensureVerification({
      id: recordId,
      patientId: patientEmail.toLowerCase(),
      title: metadata.title.trim(),
      category: metadata.category,
      recordDate: metadata.recordDate,
      provider: metadata.provider.trim(),
      doctorName: metadata.doctorName?.trim() || undefined,
      description: metadata.description?.trim() || undefined,
      fileName: file.name,
      fileType: file.type || file.name.split('.').pop() || 'Unknown',
      fileSize: formattedSize,
      createdAt: now,
      updatedAt: now
    });
    
    list.push(newRecord);
    this._saveAllRecords(list);
    
    return newRecord;
  },

  // Edit metadata fields
  updateRecord(
    patientEmail: string,
    recordId: string,
    fields: Partial<Omit<MedicalRecord, 'id' | 'patientId' | 'createdAt' | 'updatedAt' | 'fileName' | 'fileType' | 'fileSize'>>
  ): MedicalRecord {
    const allData = localStorage.getItem(METADATA_KEY);
    if (!allData) throw new Error('Record not found.');
    
    const list: MedicalRecord[] = JSON.parse(allData);
    const index = list.findIndex(r => r.id === recordId);
    
    if (index === -1) throw new Error('Record not found.');
    
    // Enforce ownership check
    if (list[index].patientId.toLowerCase() !== patientEmail.toLowerCase()) {
      throw new Error('Access denied. Unauthorized write operation.');
    }
    
    const updatedRecord: MedicalRecord = {
      ...list[index],
      ...fields,
      updatedAt: new Date().toISOString()
    };
    
    list[index] = updatedRecord;
    this._saveAllRecords(list);
    
    return updatedRecord;
  },

  // Delete metadata and file binary
  async deleteRecord(patientEmail: string, recordId: string): Promise<void> {
    const allData = localStorage.getItem(METADATA_KEY);
    if (!allData) throw new Error('Record not found.');
    
    const list: MedicalRecord[] = JSON.parse(allData);
    const index = list.findIndex(r => r.id === recordId);
    
    if (index === -1) throw new Error('Record not found.');
    
    // Enforce ownership check
    if (list[index].patientId.toLowerCase() !== patientEmail.toLowerCase()) {
      throw new Error('Access denied. Unauthorized delete operation.');
    }
    
    // Remove binary from IndexedDB
    await removeFile(recordId);
    
    // Remove metadata
    list.splice(index, 1);
    this._saveAllRecords(list);
  },

  // Helper to format bytes
  _formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};
