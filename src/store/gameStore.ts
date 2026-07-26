import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isDevelopmentMode } from '@/utils/inputValidation';
import { PASSING_SCORE, MAX_ATTEMPTS, QUESTION_HISTORY_LIMIT } from '@/constants/gameConfig';
import { applyGenderTheme } from '@/utils/theme';

export type Gender = 'male' | 'female';

export interface Law {
  id: string;
  name: string;
  formula: string;
  scene: string;
  completed: boolean;
  gemEarned: boolean;
}

export interface QuizAttempt {
  score: number;
  date: string;
  missedLaws: string[];
}

export interface QuizLevel {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  unlocked: boolean;
  completed: boolean;
  score: number | null;
  attempts: QuizAttempt[];
  averageScore: number | null;
}

export interface QuestionHistory {
  questionId: string;
  correct: boolean;
  timestamp: string;
}

export interface GameState {
  // Player data
  playerName: string;
  playerGender: Gender | null;
  
  // Game progress
  hasStarted: boolean;
  introCompleted: boolean;
  currentLawIndex: number;
  
  // Laws progress
  laws: Law[];
  
  // Quiz levels
  quizLevels: QuizLevel[];
  
  // Stats
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  lawMissedCount: Record<string, number>;
  
  // Adaptive quiz
  questionHistory: QuestionHistory[];
  
  // Report data
  needsAttention: boolean;
  attentionReason: string | null;
  
  // Debug mode
  debugMode: boolean;

  // UX settings
  hapticsEnabled: boolean;

  // Offline sync queue
  pendingSyncResults: PendingSyncResult[];

  // Actions
  setPlayerName: (name: string) => void;
  setPlayerGender: (gender: Gender) => void;
  startGame: () => void;
  completeIntro: () => void;
  completeLaw: (lawId: string) => void;
  earnGem: (lawId: string) => void;
  unlockQuizLevels: () => void;
  unlockAllForTesting: () => void;
  completeQuizLevel: (levelId: string, score: number, missedLaws: string[]) => void;
  incrementLawMissed: (lawName: string) => void;
  trackAnswer: (correct: boolean) => void;
  recordQuestionAnswer: (questionId: string, correct: boolean) => void;
  resetGame: () => void;
  toggleDebugMode: () => void;
  setHapticsEnabled: (enabled: boolean) => void;
  addPendingSyncResult: (result: PendingSyncResult) => void;
  clearPendingSyncResults: () => void;
  getStudentReport: () => StudentReport;
  exportStudentData: () => Record<string, unknown>;
}

export interface StudentReport {
  playerName: string;
  overallPerformance: 'excellent' | 'good' | 'needs_improvement' | 'needs_attention' | 'not_assessed';
  easyLevel: LevelReport | null;
  mediumLevel: LevelReport | null;
  hardLevel: LevelReport | null;
  lawsToFocus: string[];
  recommendations: string[];
  totalAttempts: number;
  averageScore: number | null;
  completedLevels: number;
}

export interface LevelReport {
  attempts: number;
  scores: number[];
  averageScore: number;
  passed: boolean;
  missedLaws: string[];
}

export interface PendingSyncResult {
  id: string;
  levelId: string;
  score: number;
  missedLaws: string[];
  completedAt: string;
}

const initialLaws: Law[] = [
  {
    id: 'product',
    name: 'Product of Powers',
    formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    scene: 'Fusion Forge',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'quotient',
    name: 'Quotient of Powers',
    formula: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ',
    scene: 'Frost Divide Cavern',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'power',
    name: 'Power of a Power',
    formula: '(aᵐ)ⁿ = aᵐⁿ',
    scene: 'Echo Temple',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'zero',
    name: 'Zero Exponent Rule',
    formula: 'a⁰ = 1',
    scene: 'Silent Tower',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'negative',
    name: 'Negative Exponent Rule',
    formula: 'a⁻ⁿ = 1/aⁿ',
    scene: 'Mirror Dimension Portal',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'product-power',
    name: 'Power of a Product',
    formula: '(ab)ⁿ = aⁿbⁿ',
    scene: 'Twin Core Nexus',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'quotient-power',
    name: 'Power of a Quotient',
    formula: '(a/b)ⁿ = aⁿ / bⁿ',
    scene: 'Sky Temple of Balance',
    completed: false,
    gemEarned: false,
  },
  {
    id: 'identity',
    name: 'Identity Exponent Rule',
    formula: 'a¹ = a',
    scene: 'Origin Crystal Chamber',
    completed: false,
    gemEarned: false,
  },
];

const initialQuizLevels: QuizLevel[] = [
  { id: 'easy', name: 'Easy', unlocked: false, completed: false, score: null, attempts: [], averageScore: null },
  { id: 'medium', name: 'Medium', unlocked: false, completed: false, score: null, attempts: [], averageScore: null },
  { id: 'hard', name: 'Hard', unlocked: false, completed: false, score: null, attempts: [], averageScore: null },
];

const calculateAverageScore = (attempts: QuizAttempt[]): number | null => {
  if (attempts.length === 0) return null;
  const total = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  return Math.round(total / attempts.length);
};

const checkUnlockNextLevel = (attempts: QuizAttempt[]): boolean => {
  if (attempts.length === 0) return false;
  
  if (attempts.length >= 1 && attempts[0].score >= PASSING_SCORE) {
    return true;
  }
  
  // Otherwise, calculate average of all attempts (max 3)
  const relevantAttempts = attempts.slice(0, 3);
  const avgScore = calculateAverageScore(relevantAttempts);
  return avgScore !== null && avgScore >= PASSING_SCORE;
};

const checkNeedsAttention = (quizLevels: QuizLevel[]): { needsAttention: boolean; reason: string | null } => {
  for (const level of quizLevels) {
    if (level.attempts.length >= 3) {
      const avgScore = calculateAverageScore(level.attempts.slice(0, 3));
      if (avgScore !== null && avgScore < PASSING_SCORE) {
        return {
          needsAttention: true,
          reason: `Student struggled with ${level.name} level after ${MAX_ATTEMPTS} attempts (Average: ${avgScore}%)`
        };
      }
    }
  }
  return { needsAttention: false, reason: null };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      playerName: '',
      playerGender: null,
      hasStarted: false,
      introCompleted: false,
      currentLawIndex: 0,
      laws: initialLaws,
      quizLevels: initialQuizLevels,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      lawMissedCount: {},
      questionHistory: [],
      needsAttention: false,
      attentionReason: null,
      debugMode: false,
      hapticsEnabled: true,
      pendingSyncResults: [],

      // Actions
      setPlayerName: (name) => set({ playerName: name }),
      
      setPlayerGender: (gender) => {
        set({ playerGender: gender });
        applyGenderTheme(gender);
      },

      startGame: () => set({ hasStarted: true }),
      
      completeIntro: () => set({ introCompleted: true }),
      
      completeLaw: (lawId) =>
        set((state) => ({
          laws: state.laws.map((law) =>
            law.id === lawId ? { ...law, completed: true } : law
          ),
        })),
      
      earnGem: (lawId) =>
        set((state) => ({
          laws: state.laws.map((law) =>
            law.id === lawId ? { ...law, gemEarned: true } : law
          ),
        })),
      
      unlockQuizLevels: () =>
        set((state) => ({
          quizLevels: state.quizLevels.map((level, index) =>
            index === 0 ? { ...level, unlocked: true } : level
          ),
        })),
      
      unlockAllForTesting: () =>
        set((state) => ({
          laws: state.laws.map((law) => ({ ...law, completed: true, gemEarned: true })),
          quizLevels: state.quizLevels.map((level) => ({ ...level, unlocked: true })),
        })),
      
      toggleDebugMode: () =>
        set((state) => {
          if (!isDevelopmentMode()) {
            return state;
          }
          return { debugMode: !state.debugMode };
        }),

      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),

      addPendingSyncResult: (result) =>
        set((state) => ({
          pendingSyncResults: [...state.pendingSyncResults, result],
        })),

      clearPendingSyncResults: () => set({ pendingSyncResults: [] }),
      
      completeQuizLevel: (levelId, score, missedLaws) =>
        set((state) => {
          const levelIndex = state.quizLevels.findIndex((l) => l.id === levelId);
          const currentLevel = state.quizLevels[levelIndex];
          
          // Create new attempt
          const newAttempt: QuizAttempt = {
            score,
            date: new Date().toISOString(),
            missedLaws,
          };
          
          // Add attempt to the level (max 3 stored for average calculation)
          const updatedAttempts = [...currentLevel.attempts, newAttempt];
          
          // Check if next level should be unlocked
          const shouldUnlockNext = checkUnlockNextLevel(updatedAttempts);
          
          // Update missed laws count
          const newMissedCount = { ...state.lawMissedCount };
          missedLaws.forEach((law) => {
            newMissedCount[law] = (newMissedCount[law] || 0) + 1;
          });

          // Check if student needs attention
          const updatedLevels = state.quizLevels.map((level, index) => {
            if (level.id === levelId) {
              return {
                ...level,
                completed: shouldUnlockNext,
                score: Math.max(level.score || 0, score),
                attempts: updatedAttempts,
                averageScore: calculateAverageScore(updatedAttempts),
              };
            }
            // Unlock next level if current passed
            if (index === levelIndex + 1 && shouldUnlockNext) {
              return { ...level, unlocked: true };
            }
            return level;
          });

          const attentionStatus = checkNeedsAttention(updatedLevels);

          return {
            quizLevels: updatedLevels,
            lawMissedCount: newMissedCount,
            needsAttention: attentionStatus.needsAttention,
            attentionReason: attentionStatus.reason,
          };
        }),

      incrementLawMissed: (lawName) =>
        set((state) => ({
          lawMissedCount: {
            ...state.lawMissedCount,
            [lawName]: (state.lawMissedCount[lawName] || 0) + 1,
          },
        })),

      trackAnswer: (correct) =>
        set((state) => ({
          totalCorrectAnswers: state.totalCorrectAnswers + (correct ? 1 : 0),
          totalIncorrectAnswers: state.totalIncorrectAnswers + (correct ? 0 : 1),
        })),

      recordQuestionAnswer: (questionId, correct) =>
        set((state) => ({
          questionHistory: [
            ...state.questionHistory.slice(-QUESTION_HISTORY_LIMIT),
            { questionId, correct, timestamp: new Date().toISOString() },
          ],
        })),

      resetGame: () => {
        applyGenderTheme(null);
        set({
          playerName: '',
          playerGender: null,
          hasStarted: false,
          introCompleted: false,
          currentLawIndex: 0,
          laws: initialLaws,
          quizLevels: initialQuizLevels,
          totalCorrectAnswers: 0,
          totalIncorrectAnswers: 0,
          lawMissedCount: {},
          questionHistory: [],
          needsAttention: false,
          attentionReason: null,
          debugMode: false,
          hapticsEnabled: true,
          pendingSyncResults: [],
        });
      },

      getStudentReport: (): StudentReport => {
        const state = get();
        
        const getLevelReport = (level: QuizLevel): LevelReport | null => {
          // Handle legacy data where attempts might be a number instead of array
          const attempts = Array.isArray(level.attempts) ? level.attempts : [];
          if (attempts.length === 0) return null;
          
          const allMissedLaws: string[] = [];
          attempts.forEach(attempt => {
            allMissedLaws.push(...attempt.missedLaws);
          });
          
          // Count frequency and get unique
          const lawFrequency: Record<string, number> = {};
          allMissedLaws.forEach(law => {
            lawFrequency[law] = (lawFrequency[law] || 0) + 1;
          });
          
          const uniqueMissedLaws = [...new Set(allMissedLaws)];
          
          return {
            attempts: attempts.length,
            scores: attempts.map(a => a.score),
            averageScore: level.averageScore || 0,
            passed: level.completed,
            missedLaws: uniqueMissedLaws,
          };
        };

        // Get all missed laws across all levels
        const allMissedLaws = Object.entries(state.lawMissedCount)
          .sort((a, b) => b[1] - a[1])
          .map(([law]) => law);

        // Calculate total attempts and average (handle legacy data where attempts might be a number)
        const totalAttempts = state.quizLevels.reduce((sum, level) => {
          const attempts = Array.isArray(level.attempts) ? level.attempts : [];
          return sum + attempts.length;
        }, 0);
        const allScores = state.quizLevels.flatMap(level => {
          const attempts = Array.isArray(level.attempts) ? level.attempts : [];
          return attempts.map(a => a.score);
        });
        const averageScore = allScores.length > 0 
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : null;

        const completedLevels = state.quizLevels.filter(l => l.completed).length;

        // Determine overall performance - only based on quiz attempts
        let overallPerformance: StudentReport['overallPerformance'] = 'not_assessed';
        if (totalAttempts === 0) {
          overallPerformance = 'not_assessed';
        } else if (state.needsAttention) {
          overallPerformance = 'needs_attention';
        } else if (averageScore !== null) {
          if (averageScore >= 90) overallPerformance = 'excellent';
          else if (averageScore >= 75) overallPerformance = 'good';
          else overallPerformance = 'needs_improvement';
        }

        // Generate recommendations
        const recommendations: string[] = [];
        
        if (state.needsAttention) {
          recommendations.push('Student requires additional support and guidance with exponential laws.');
          recommendations.push('Consider one-on-one tutoring sessions to address fundamental concepts.');
          recommendations.push('Review basic multiplication and division concepts before continuing.');
        }
        
        if (allMissedLaws.length > 0) {
          recommendations.push(`Focus on reviewing: ${allMissedLaws.slice(0, 3).join(', ')}`);
        }
        
        if (averageScore !== null && averageScore < 75) {
          recommendations.push('Practice more problems with step-by-step solutions.');
          recommendations.push('Watch tutorial videos for visual learning reinforcement.');
        }
        
        if (completedLevels === 3) {
          recommendations.push('Excellent progress! Consider advancing to more complex algebra topics.');
        }

        return {
          playerName: state.playerName,
          overallPerformance,
          easyLevel: getLevelReport(state.quizLevels[0]),
          mediumLevel: getLevelReport(state.quizLevels[1]),
          hardLevel: getLevelReport(state.quizLevels[2]),
          lawsToFocus: allMissedLaws.slice(0, 5),
          recommendations,
          totalAttempts,
          averageScore,
          completedLevels,
        };
      },

      exportStudentData: () => {
        const state = get();
        return {
          exportVersion: 1,
          exportDate: new Date().toISOString(),
          playerName: state.playerName,
          playerGender: state.playerGender,
          laws: state.laws,
          quizLevels: state.quizLevels,
          totalCorrectAnswers: state.totalCorrectAnswers,
          totalIncorrectAnswers: state.totalIncorrectAnswers,
          lawMissedCount: state.lawMissedCount,
          needsAttention: state.needsAttention,
          attentionReason: state.attentionReason,
        };
      },
    }),
    {
      name: 'exponentia-game-storage',
    }
  )
);
