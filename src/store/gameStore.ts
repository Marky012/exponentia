import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  // Report data
  needsAttention: boolean;
  attentionReason: string | null;
  
  // Actions
  setPlayerName: (name: string) => void;
  setPlayerGender: (gender: Gender) => void;
  startGame: () => void;
  completeIntro: () => void;
  completeLaw: (lawId: string) => void;
  earnGem: (lawId: string) => void;
  unlockQuizLevels: () => void;
  completeQuizLevel: (levelId: string, score: number, missedLaws: string[]) => void;
  incrementLawMissed: (lawName: string) => void;
  resetGame: () => void;
  getStudentReport: () => StudentReport;
}

export interface StudentReport {
  playerName: string;
  overallPerformance: 'excellent' | 'good' | 'needs_improvement' | 'needs_attention';
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
  
  // If first attempt passes with 75% or more, unlock immediately
  if (attempts.length >= 1 && attempts[0].score >= 75) {
    return true;
  }
  
  // Otherwise, calculate average of all attempts (max 3)
  const relevantAttempts = attempts.slice(0, 3);
  const avgScore = calculateAverageScore(relevantAttempts);
  return avgScore !== null && avgScore >= 75;
};

const checkNeedsAttention = (quizLevels: QuizLevel[]): { needsAttention: boolean; reason: string | null } => {
  for (const level of quizLevels) {
    if (level.attempts.length >= 3) {
      const avgScore = calculateAverageScore(level.attempts.slice(0, 3));
      if (avgScore !== null && avgScore < 75) {
        return {
          needsAttention: true,
          reason: `Student struggled with ${level.name} level after 3 attempts (Average: ${avgScore}%)`
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
      needsAttention: false,
      attentionReason: null,

      // Actions
      setPlayerName: (name) => set({ playerName: name }),
      
      setPlayerGender: (gender) => {
        set({ playerGender: gender });
        if (typeof document !== 'undefined') {
          if (gender === 'female') {
            document.body.classList.add('theme-female');
          } else {
            document.body.classList.remove('theme-female');
          }
        }
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

      resetGame: () => {
        if (typeof document !== 'undefined') {
          document.body.classList.remove('theme-female');
        }
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
          needsAttention: false,
          attentionReason: null,
        });
      },

      getStudentReport: (): StudentReport => {
        const state = get();
        
        const getLevelReport = (level: QuizLevel): LevelReport | null => {
          if (level.attempts.length === 0) return null;
          
          const allMissedLaws: string[] = [];
          level.attempts.forEach(attempt => {
            allMissedLaws.push(...attempt.missedLaws);
          });
          
          // Count frequency and get unique
          const lawFrequency: Record<string, number> = {};
          allMissedLaws.forEach(law => {
            lawFrequency[law] = (lawFrequency[law] || 0) + 1;
          });
          
          const uniqueMissedLaws = [...new Set(allMissedLaws)];
          
          return {
            attempts: level.attempts.length,
            scores: level.attempts.map(a => a.score),
            averageScore: level.averageScore || 0,
            passed: level.completed,
            missedLaws: uniqueMissedLaws,
          };
        };

        // Get all missed laws across all levels
        const allMissedLaws = Object.entries(state.lawMissedCount)
          .sort((a, b) => b[1] - a[1])
          .map(([law]) => law);

        // Calculate total attempts and average
        const totalAttempts = state.quizLevels.reduce((sum, level) => sum + level.attempts.length, 0);
        const allScores = state.quizLevels.flatMap(level => level.attempts.map(a => a.score));
        const averageScore = allScores.length > 0 
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : null;

        const completedLevels = state.quizLevels.filter(l => l.completed).length;

        // Determine overall performance
        let overallPerformance: StudentReport['overallPerformance'] = 'excellent';
        if (state.needsAttention) {
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
    }),
    {
      name: 'exponentia-game-storage',
    }
  )
);
