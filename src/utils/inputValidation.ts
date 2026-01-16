import { z } from 'zod';

/**
 * Input validation utilities for future user-generated content
 * This module provides reusable validation schemas and sanitization functions
 * to prevent injection attacks and ensure data integrity
 */

// ============= Validation Schemas =============

/**
 * Schema for validating math expressions entered by users
 * Allows only safe characters used in mathematical notation
 */
export const mathExpressionSchema = z
  .string()
  .trim()
  .min(1, 'Expression cannot be empty')
  .max(200, 'Expression must be less than 200 characters')
  .refine(
    (val) => /^[a-zA-Z0-9\s\+\-\*\/\^\(\)\[\]\{\}×÷±⁰¹²³⁴⁵⁶⁷⁸⁹ⁿᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐᵒᵖʳˢᵗᵘᵛʷˣʸᶻ⁺⁻⁼₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ₊₋₌=<>≤≥≠≈\.]+$/.test(val),
    'Expression contains invalid characters'
  );

/**
 * Schema for validating player names
 */
export const playerNameSchema = z
  .string()
  .trim()
  .min(1, 'Name cannot be empty')
  .max(50, 'Name must be less than 50 characters')
  .refine(
    (val) => /^[a-zA-Z0-9\s\-']+$/.test(val),
    'Name can only contain letters, numbers, spaces, hyphens, and apostrophes'
  );

/**
 * Schema for validating user feedback/comments (if added in future)
 */
export const userCommentSchema = z
  .string()
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(1000, 'Comment must be less than 1000 characters')
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Comment contains potentially unsafe content'
  );

/**
 * Schema for validating custom question text (if user-generated questions are added)
 */
export const questionTextSchema = z
  .string()
  .trim()
  .min(5, 'Question must be at least 5 characters')
  .max(500, 'Question must be less than 500 characters')
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Question contains potentially unsafe content'
  );

// ============= Sanitization Functions =============

/**
 * Sanitize a string by removing potentially dangerous HTML/script content
 * Use this for any user input that will be rendered
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize math expression - allows math symbols but removes dangerous content
 */
export function sanitizeMathExpression(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove javascript: and other protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Trim and limit length
  return sanitized.trim().slice(0, 200);
}

/**
 * Validate and sanitize URL parameters for external links
 * Use when constructing URLs from user input
 */
export function sanitizeUrlParam(input: string): string {
  return encodeURIComponent(input.trim().slice(0, 100));
}

// ============= Validation Functions =============

/**
 * Validate a math expression input
 * Returns { success: true, data: string } or { success: false, error: string }
 */
export function validateMathExpression(input: string): { 
  success: boolean; 
  data?: string; 
  error?: string;
} {
  const result = mathExpressionSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: sanitizeMathExpression(result.data) };
  }
  return { success: false, error: result.error.errors[0]?.message || 'Invalid expression' };
}

/**
 * Validate player name input
 */
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

/**
 * Check if running in development mode
 * Used for enabling debug features only in development
 */
export function isDevelopmentMode(): boolean {
  // Check Vite's import.meta.env
  try {
    return import.meta.env.DEV === true || import.meta.env.MODE === 'development';
  } catch {
    // Fallback for environments where import.meta might not be available
    return false;
  }
}

/**
 * Safe logging function that only logs in development
 */
export function devLog(...args: unknown[]): void {
  if (isDevelopmentMode()) {
    console.log('[DEV]', ...args);
  }
}

/**
 * Safe error logging that sanitizes sensitive data in production
 */
export function safeErrorLog(error: unknown, context?: string): void {
  if (isDevelopmentMode()) {
    console.error(`[DEV ERROR]${context ? ` ${context}:` : ''}`, error);
  } else {
    // In production, log minimal info
    console.error(`Error${context ? ` in ${context}` : ''}`);
  }
}
