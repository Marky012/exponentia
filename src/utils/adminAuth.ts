const ADMIN_STORAGE_KEY = 'exponentia-admin-auth';
const DEFAULT_PASSWORD = 'exponentia2024';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface AdminAuthData {
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin: string | null;
}

interface AdminSession {
  authenticatedAt: number;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getSessionKey(): string {
  return `${ADMIN_STORAGE_KEY}-session`;
}

export function isSetUp(): boolean {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return false;
  try {
    const data: AdminAuthData = JSON.parse(raw);
    return !!data.passwordHash && !!data.salt;
  } catch {
    return false;
  }
}

export async function setupPassword(password: string): Promise<void> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const authData: AdminAuthData = {
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(authData));
}

export async function verifyPassword(password: string): Promise<boolean> {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return false;
  try {
    const data: AdminAuthData = JSON.parse(raw);
    const hash = await hashPassword(password, data.salt);
    return hash === data.passwordHash;
  } catch {
    return false;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const valid = await verifyPassword(currentPassword);
  if (!valid) return { success: false, error: 'Current password is incorrect' };

  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return { success: false, error: 'Auth data not found' };

  try {
    const data: AdminAuthData = JSON.parse(raw);
    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);
    const updated: AdminAuthData = {
      ...data,
      passwordHash: newHash,
      salt: newSalt,
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to change password' };
  }
}

export function startSession(): void {
  const session: AdminSession = { authenticatedAt: Date.now() };
  localStorage.setItem(getSessionKey(), JSON.stringify(session));
}

export function isSessionValid(): boolean {
  const raw = localStorage.getItem(getSessionKey());
  if (!raw) return false;
  try {
    const session: AdminSession = JSON.parse(raw);
    return Date.now() - session.authenticatedAt < SESSION_TIMEOUT_MS;
  } catch {
    return false;
  }
}

export function endSession(): void {
  localStorage.removeItem(getSessionKey());
}

export function updateLastLogin(): void {
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return;
  try {
    const data: AdminAuthData = JSON.parse(raw);
    data.lastLogin = new Date().toISOString();
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function resetAuth(): void {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(getSessionKey());
}

export { DEFAULT_PASSWORD, SESSION_TIMEOUT_MS };
