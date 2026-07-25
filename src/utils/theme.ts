import { type Gender } from '@/store/gameStore';

export type ThemeMode = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'exponentia-theme-mode';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}

export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme(mode);
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const resolved = mode === 'system' ? getSystemTheme() : mode;
  if (resolved === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
}

export function initTheme(): void {
  applyTheme(getThemeMode());
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getThemeMode() === 'system') applyTheme('system');
    });
  }
}

export function applyGenderTheme(gender: Gender | null): void {
  if (typeof document === 'undefined') return;
  if (gender === 'female') {
    document.body.classList.add('theme-female');
  } else {
    document.body.classList.remove('theme-female');
  }
}