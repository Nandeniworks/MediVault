// ============================================================
//  accessRequestService.ts
//  Shared in-browser data layer for the Access Request workflow.
//  localStorage key: mv_access_requests
// ============================================================

export type AccessRequestPurpose =
  | 'Consultation'
  | 'Emergency'
  | 'Second Opinion'
  | 'Surgery Planning'
  | 'Follow-up'
  | 'Other';

export type AccessRequestDuration = '1 Hour' | '24 Hours' | '7 Days';

export type AccessRequestStatus = 'pending' | 'approved' | 'declined';

export interface AccessRequest {
  /** Unique internal ID */
  id: string;
  /** Human-friendly display ID shown in cards */
  requestId: string;

  // Doctor info
  doctorName: string;
  doctorEmail: string;
  doctorSpecialization?: string;
  hospital: string;

  // Request details
  purpose: AccessRequestPurpose;
  duration: AccessRequestDuration;
  notes?: string;

  // Patient info
  patientName: string;
  patientEmail: string;
  patientUhid: string;

  // Meta
  submittedAt: string; // ISO 8601
  status: AccessRequestStatus;
  /** Token generated when patient approves */
  permissionToken?: string;

  // Emergency fields
  isEmergency?: boolean;
  hospitalId?: string;
  approvedAt?: string; // ISO 8601 approved time
}

const STORAGE_KEY = 'mv_access_requests';

// ─── Helpers ────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
}

function generateRequestId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let id = 'REQ-';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generatePermissionToken(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let token = 'MV-PERM-';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ─── Service ─────────────────────────────────────────────────

export const accessRequestService = {
  /** Load all requests from localStorage */
  getAll(): AccessRequest[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw) as AccessRequest[];
      
      // Auto-expire emergency requests older than 2 hours
      let changed = false;
      const updatedList = list.map(req => {
        if (req.status === 'approved' && req.isEmergency && req.approvedAt) {
          const elapsed = Date.now() - new Date(req.approvedAt).getTime();
          if (elapsed > 2 * 3600 * 1000) { // 2 hours
            changed = true;
            return { ...req, status: 'declined' as AccessRequestStatus };
          }
        }
        return req;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    } catch {
      return [];
    }
  },

  /** Persist all requests to localStorage */
  saveAll(requests: AccessRequest[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  },

  /**
   * Create a new access request from the doctor's modal.
   * Returns the created record.
   */
  createRequest(data: {
    doctorName: string;
    doctorEmail: string;
    doctorSpecialization?: string;
    hospital: string;
    purpose: AccessRequestPurpose;
    duration: AccessRequestDuration;
    notes?: string;
    patientName: string;
    patientEmail: string;
    patientUhid: string;
  }): AccessRequest {
    const requests = this.getAll();

    const newRequest: AccessRequest = {
      id: generateId(),
      requestId: generateRequestId(),
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    requests.unshift(newRequest); // newest first
    this.saveAll(requests);
    return newRequest;
  },

  /**
   * Retrieve all requests where this doctor is the requester.
   * Used by the Doctor Access Requests page.
   */
  getRequestsForDoctor(doctorEmail: string): AccessRequest[] {
    return this.getAll().filter(
      (r) => r.doctorEmail.toLowerCase() === doctorEmail.toLowerCase()
    );
  },

  /**
   * Retrieve all requests targeting a specific patient.
   * Used by the Patient Access Requests tab.
   */
  getRequestsForPatient(patientEmail: string): AccessRequest[] {
    return this.getAll().filter(
      (r) => r.patientEmail.toLowerCase() === patientEmail.toLowerCase()
    );
  },

  /**
   * Check whether a specific doctor already has a pending (or approved) request
   * for a specific patient.
   */
  getRequestStatus(
    doctorEmail: string,
    patientUhid: string
  ): AccessRequestStatus | null {
    const all = this.getAll();
    const match = all.find(
      (r) =>
        r.doctorEmail.toLowerCase() === doctorEmail.toLowerCase() &&
        r.patientUhid === patientUhid
    );
    return match ? match.status : null;
  },

  /**
   * Get the most recent request from a doctor for a patient.
   */
  getLatestRequest(
    doctorEmail: string,
    patientUhid: string
  ): AccessRequest | null {
    const all = this.getAll();
    const matches = all.filter(
      (r) =>
        r.doctorEmail.toLowerCase() === doctorEmail.toLowerCase() &&
        r.patientUhid === patientUhid
    );
    return matches.length > 0 ? matches[0] : null;
  },

  /** Approve a request — generates a permission token */
  approveRequest(id: string): AccessRequest | null {
    const requests = this.getAll();
    const idx = requests.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    requests[idx] = {
      ...requests[idx],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      permissionToken: generatePermissionToken(),
    };
    this.saveAll(requests);
    return requests[idx];
  },

  /** Decline a request */
  declineRequest(id: string): AccessRequest | null {
    const requests = this.getAll();
    const idx = requests.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    requests[idx] = { ...requests[idx], status: 'declined' };
    this.saveAll(requests);
    return requests[idx];
  },

  /** Format a submitted ISO date as a human-readable relative string */
  formatTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },

  /** Format a submitted ISO date as a friendly date string */
  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};
