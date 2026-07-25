import { z } from 'zod';

const playerNameSchema = z
  .string()
  .trim()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name must be less than 50 characters')
  .refine(
    (val) => /^[a-zA-Z0-9\s\-']+$/.test(val),
    'Name can only contain letters, numbers, spaces, hyphens, and apostrophes'
  );

export function validatePlayerName(input: string): {
  success: boolean;
  data?: string;
  error?: string;
} {
  const result = playerNameSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0]?.message || 'Invalid name' };
}

export function isDevelopmentMode(): boolean {
  try {
    return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
  } catch {
    return false;
  }
}
