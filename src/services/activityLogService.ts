// ============================================================
//  activityLogService.ts
//  Global Activity Audit Log persisted to localStorage.
//  key: mv_activity_log
// ============================================================

export interface ActivityLogEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  ip: string;
  device: string;
  patientEmail: string; // for filtering patient-specific logs
  timestamp: string; // ISO 8601 for sorting
}

const STORAGE_KEY = 'mv_activity_log';

function generateId(): string {
  return `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
}

export const activityLogService = {
  getAll(): ActivityLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ActivityLogEntry[]) : [];
    } catch {
      return [];
    }
  },

  getForPatient(patientEmail: string): ActivityLogEntry[] {
    return this.getAll()
      .filter((e) => e.patientEmail.toLowerCase() === patientEmail.toLowerCase() || e.patientEmail === 'global')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  log(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): ActivityLogEntry {
    const all = this.getAll();
    const newEntry: ActivityLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    all.unshift(newEntry);
    // Keep only last 200 entries (immutable, nothing deleted in UI, but buffer capped for storage size limits)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 200)));
    return newEntry;
  },

  logAction(user: string, action: string, patientEmail: string = 'global') {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const ips = ['192.168.1.45', '172.20.10.2', '10.0.0.8', '192.168.2.14'];
    // hash somewhat stably based on time to look realistic
    const demoIp = ips[Math.floor((now.getMinutes() + now.getSeconds()) % ips.length)];
    const demoDevice = 'Chrome / macOS (Desktop)';

    return this.log({
      date: dateStr,
      time: timeStr,
      user,
      action,
      ip: demoIp,
      device: demoDevice,
      patientEmail,
    });
  }
};

// Seed default logs if none exist
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  const seedLogs: ActivityLogEntry[] = [
    {
      id: 'LOG-SEED-1',
      date: 'Jul 17, 2026',
      time: '10:42:15',
      user: 'Dr. Roseanne Park (Clinician)',
      action: 'Viewed CBC Report',
      ip: '192.168.1.45',
      device: 'Chrome / macOS (Desktop)',
      patientEmail: 'nandeni.tiwari@medivault.app',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'LOG-SEED-2',
      date: 'Jul 17, 2026',
      time: '11:10:30',
      user: 'Dr. Roseanne Park (Clinician)',
      action: 'Downloaded Wrist X-Ray',
      ip: '192.168.1.45',
      device: 'Chrome / macOS (Desktop)',
      patientEmail: 'nandeni.tiwari@medivault.app',
      timestamp: new Date(Date.now() - 23 * 3600 * 1000).toISOString()
    },
    {
      id: 'LOG-SEED-3',
      date: 'Jul 17, 2026',
      time: '11:25:00',
      user: 'Dr. Roseanne Park (Clinician)',
      action: 'Generated AI Summary',
      ip: '192.168.1.45',
      device: 'Chrome / macOS (Desktop)',
      patientEmail: 'nandeni.tiwari@medivault.app',
      timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLogs));
}
