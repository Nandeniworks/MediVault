import type { MedicalRecord } from './vaultService';

export interface AccessRequest {
  id: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  requestedCategories: string[];
  duration: string;
  status: 'Awaiting Review' | 'Approved' | 'Rejected' | 'Expired';
  requestedDate: string;
}

export interface ActivityEvent {
  id: string;
  year: string;
  date: string;
  title: string;
  category: string;
  provider: string;
  details?: string;
  iconType: 'report' | 'scan' | 'prescription' | 'doctor';
}

export interface DemoPatientProfile {
  name: string;
  dob: string;
  healthId: string;
  bloodGroup: string;
  memberSince: string;
  email: string;
  avatarUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

// 1. Mock Patient Profile
export const demoPatient: DemoPatientProfile = {
  name: 'Aarav Sharma',
  dob: '1992-08-15',
  healthId: 'MV-2026-7A9K2X',
  bloodGroup: 'O Positive (O+)',
  memberSince: '2026',
  email: 'aarav.sharma@example.com',
  emergencyContact: {
    name: 'Priya Sharma',
    phone: '+1 (555) 987-6543'
  }
};

// 2. Mock Medical Records (Bento Section 1)
export const demoRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'aarav.sharma@example.com',
    title: 'Complete Blood Count (CBC)',
    category: 'Lab Report',
    recordDate: '2026-06-12',
    provider: 'Apex Diagnostics',
    fileName: 'cbc_report.pdf',
    fileType: 'application/pdf',
    fileSize: '1.2 MB',
    createdAt: '2026-06-12T10:00:00.000Z',
    updatedAt: '2026-06-12T10:00:00.000Z'
  },
  {
    id: 'rec-2',
    patientId: 'aarav.sharma@example.com',
    title: 'Chest X-Ray (Post-Recovery)',
    category: 'Imaging & Scan',
    recordDate: '2026-05-18',
    provider: 'City Care Imaging',
    fileName: 'chest_xray.png',
    fileType: 'image/png',
    fileSize: '18.4 MB',
    createdAt: '2026-05-18T14:30:00.000Z',
    updatedAt: '2026-05-18T14:30:00.000Z'
  },
  {
    id: 'rec-3',
    patientId: 'aarav.sharma@example.com',
    title: 'Thyroid Profile (T3, T4, TSH)',
    category: 'Lab Report',
    recordDate: '2026-04-02',
    provider: 'Apex Diagnostics',
    fileName: 'thyroid.pdf',
    fileType: 'application/pdf',
    fileSize: '890 KB',
    createdAt: '2026-04-02T09:15:00.000Z',
    updatedAt: '2026-04-02T09:15:00.000Z'
  },
  {
    id: 'rec-4',
    patientId: 'aarav.sharma@example.com',
    title: 'Lipitor 20mg Daily Prescription',
    category: 'Prescription',
    recordDate: '2026-01-10',
    provider: 'Dr. Robert Chen',
    fileName: 'lipitor_prescription.pdf',
    fileType: 'application/pdf',
    fileSize: '320 KB',
    createdAt: '2026-01-10T11:00:00.000Z',
    updatedAt: '2026-01-10T11:00:00.000Z'
  }
];

// 3. Mock Access Requests (Bento Section 2)
export const demoAccessRequests: AccessRequest[] = [
  {
    id: 'req-1',
    doctorName: 'Dr. Ananya Sharma',
    specialization: 'Cardiology',
    hospital: 'City Care Hospital',
    requestedCategories: ['Lab Results', 'Imaging Scans', 'Prescriptions'],
    duration: '24 hours',
    status: 'Awaiting Review',
    requestedDate: 'Today, 2:15 PM'
  }
];

// 4. Mock Timeline Activity (Lower Area Section)
export const demoActivity: ActivityEvent[] = [
  {
    id: 'act-1',
    year: '2026',
    date: 'Jun 12',
    title: 'Complete Blood Count (CBC)',
    category: 'Lab Report',
    provider: 'Apex Diagnostics',
    details: 'Haemoglobin: 14.2 g/dL (Normal Range)',
    iconType: 'report'
  },
  {
    id: 'act-2',
    year: '2026',
    date: 'May 18',
    title: 'Chest X-Ray',
    category: 'Imaging Scan',
    provider: 'City Care Imaging',
    details: 'Lung fields clear, no focal consolidation.',
    iconType: 'scan'
  },
  {
    id: 'act-3',
    year: '2026',
    date: 'Apr 02',
    title: 'Thyroid Profile',
    category: 'Lab Report',
    provider: 'Apex Diagnostics',
    details: 'TSH: 2.1 mIU/L (Within normal parameters)',
    iconType: 'report'
  },
  {
    id: 'act-4',
    year: '2026',
    date: 'Jan 10',
    title: 'Cardiology Consultation',
    category: 'Doctor visit',
    provider: 'Dr. Robert Chen',
    details: 'Routine follow-up. Prescribed Lipitor 20mg.',
    iconType: 'doctor'
  },
  {
    id: 'act-5',
    year: '2025',
    date: 'Sep 14',
    title: 'Brain MRI Scan',
    category: 'Imaging Scan',
    provider: 'City Care Imaging',
    details: 'No abnormal intracranial enhancement.',
    iconType: 'scan'
  },
  {
    id: 'act-6',
    year: '2025',
    date: 'Mar 22',
    title: 'Annual Physical & ECG',
    category: 'Doctor visit',
    provider: 'Dr. Sarah Jenkins',
    details: 'ECG shows normal sinus rhythm. Overall checkup clear.',
    iconType: 'doctor'
  },
  {
    id: 'act-7',
    year: '2024',
    date: 'Nov 05',
    title: 'Influenza Immunization',
    category: 'Immunization',
    provider: 'City Pharmacy',
    details: 'Quadrivalent flu vaccine administered.',
    iconType: 'prescription'
  },
  {
    id: 'act-8',
    year: '2024',
    date: 'Jun 30',
    title: 'Lipid Panel Screen',
    category: 'Lab Report',
    provider: 'Apex Diagnostics',
    details: 'Total Cholesterol: 210 mg/dL (Slightly elevated)',
    iconType: 'report'
  }
];
