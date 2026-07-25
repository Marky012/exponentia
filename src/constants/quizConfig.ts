export const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', enemy: 'Shadow Nuller', colorClass: 'text-emerald-500' },
  medium: { label: 'Medium', enemy: 'Void Nuller', colorClass: 'text-amber-500' },
  hard: { label: 'Hard', enemy: 'Chaos Nuller', colorClass: 'text-rose-500' },
} as const;

export const STORAGE_KEYS = {
  SOUND_ENABLED: 'soundEnabled',
  SOUND_VOLUME: 'soundVolume',
  MUSIC_ENABLED: 'musicEnabled',
  MUSIC_VOLUME: 'musicVolume',
} as const;

export const LAW_ID_TO_PRETEST_KEY: Record<string, string> = {
  'product': 'product',
  'quotient': 'quotient',
  'power': 'power',
  'zero': 'zero',
  'negative': 'negative',
  'product-power': 'productpower',
  'quotient-power': 'quotientpower',
  'identity': 'identity',
};

export const PERFORMANCE_CONFIG = {
  excellent: { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10' },
  good: { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  needs_improvement: { label: 'Needs Improvement', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  needs_attention: { label: 'Needs Attention', color: 'text-red-500', bg: 'bg-red-500/10' },
  not_assessed: { label: 'Not Assessed', color: 'text-gray-500', bg: 'bg-gray-500/10' },
} as const;
