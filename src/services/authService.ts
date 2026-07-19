export interface UserProfile {
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  isOnboardingComplete: boolean;
  onboardingData?: Record<string, unknown>;
  healthId?: string;
}

interface UserRecord extends UserProfile {
  passwordHash: string;
}

// Utility: Hash credentials using native SHA-256 Web Crypto
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utility: Generate a human-readable, non-sequential Health ID (e.g., MV-2026-7A9K2X)
export function generateHealthId(existingUsers: UserRecord[] = []): string {
  const year = new Date().getFullYear();
  // Safe alphanumeric characters (omitting similar looking: 0, O, 1, I, L)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  
  let attempts = 0;
  while (attempts < 100) {
    let randStr = '';
    for (let i = 0; i < 6; i++) {
      randStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidateId = `MV-${year}-${randStr}`;
    
    const isDuplicate = existingUsers.some(u => u.healthId === candidateId);
    if (!isDuplicate) {
      return candidateId;
    }
    attempts++;
  }
  
  return `MV-${year}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

const USERS_KEY = 'mv_users';
const SESSION_KEY = 'mv_session';

// Helper: Strip sensitive hash data from user records
function toProfile(record: UserRecord): UserProfile {
  return {
    email: record.email,
    name: record.name,
    role: record.role,
    isOnboardingComplete: record.isOnboardingComplete,
    onboardingData: record.onboardingData,
    healthId: record.healthId
  };
}

export const authService = {
  getUsers(): UserRecord[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users: UserRecord[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  async signUp(email: string, password: string, name: string, role: 'patient' | 'doctor'): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock latency
    
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users.some(u => u.email === normalizedEmail)) {
      console.warn(`[authService.signUp] Email conflict detected: ${normalizedEmail} is already registered.`);
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);
    
    let healthId: string | undefined;
    if (role === 'patient') {
      healthId = generateHealthId(users);
    }

    const newRecord: UserRecord = {
      email: normalizedEmail,
      name: name.trim(),
      role,
      isOnboardingComplete: false,
      healthId,
      passwordHash,
    };

    users.push(newRecord);
    this.saveUsers(users);

    localStorage.setItem(SESSION_KEY, normalizedEmail);

    return toProfile(newRecord);
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock latency

    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const record = users.find(u => u.email === normalizedEmail);

    if (!record) {
      throw new Error('Invalid email address or password.');
    }

    const inputHash = await hashPassword(password);
    if (record.passwordHash !== inputHash) {
      throw new Error('Invalid email address or password.');
    }

    localStorage.setItem(SESSION_KEY, normalizedEmail);

    return toProfile(record);
  },

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const sessionEmail = localStorage.getItem(SESSION_KEY);
    if (!sessionEmail) return null;

    const users = this.getUsers();
    const record = users.find(u => u.email === sessionEmail);
    if (!record) return null;

    return toProfile(record);
  },

  saveOnboardingData(email: string, onboardingData: Record<string, unknown>): UserProfile {
    const users = this.getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const userIndex = users.findIndex(u => u.email === normalizedEmail);

    if (userIndex === -1) {
      throw new Error('User not found in system.');
    }

    users[userIndex].onboardingData = onboardingData;
    users[userIndex].isOnboardingComplete = true;

    this.saveUsers(users);

    return toProfile(users[userIndex]);
  },

  async requestPasswordReset(_email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Password reset request placeholder/simulation.
  }
};
