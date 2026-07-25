const STORAGE_KEY = 'exponentia-haptics-enabled';

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved !== null ? saved === 'true' : true;
}

function setEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

function vibrate(pattern: number | number[]): boolean {
  if (!isEnabled()) return false;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

function isSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export const haptics = {
  isEnabled,
  setEnabled,
  isSupported,

  light() {
    vibrate(10);
  },

  medium() {
    vibrate(20);
  },

  heavy() {
    vibrate(40);
  },

  success() {
    vibrate([10, 50, 20]);
  },

  error() {
    vibrate([30, 50, 30, 50, 30]);
  },

  selection() {
    vibrate(5);
  },
};