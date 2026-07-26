import defaultQuestions from '@/data/questions.json';
import type { Question } from '@/types/game';

const CUSTOM_QUESTIONS_KEY = 'exponentia-custom-questions';

export interface QuestionBankData {
  easy: Question[];
  medium: Question[];
  hard: Question[];
  preTest: Record<string, Question[]>;
}

export function getQuestions(): QuestionBankData {
  try {
    const custom = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.easy && parsed.medium && parsed.hard && parsed.preTest) {
        return parsed;
      }
    }
  } catch {}
  return defaultQuestions as QuestionBankData;
}

export function saveQuestions(data: QuestionBankData): void {
  localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(data));
}

export function hasCustomQuestions(): boolean {
  try {
    const custom = localStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (!custom) return false;
    const parsed = JSON.parse(custom);
    return !!(parsed.easy && parsed.medium && parsed.hard);
  } catch {
    return false;
  }
}

export function resetToDefaultQuestions(): void {
  localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
}
