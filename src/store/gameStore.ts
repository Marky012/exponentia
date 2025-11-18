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

export interface QuizLevel {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  unlocked: boolean;
  completed: boolean;
  score: number | null;
  attempts: number;
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
  { id: 'easy', name: 'Easy', unlocked: false, completed: false, score: null, attempts: 0 },
  { id: 'medium', name: 'Medium', unlocked: false, completed: false, score: null, attempts: 0 },
  { id: 'hard', name: 'Hard', unlocked: false, completed: false, score: null, attempts: 0 },
];

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
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

      // Actions
      setPlayerName: (name) => set({ playerName: name }),
      
      setPlayerGender: (gender) => {
        set({ playerGender: gender });
        // Update theme
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
          const passed = score >= 75;
          const levelIndex = state.quizLevels.findIndex((l) => l.id === levelId);
          
          // Update missed laws count
          const newMissedCount = { ...state.lawMissedCount };
          missedLaws.forEach((law) => {
            newMissedCount[law] = (newMissedCount[law] || 0) + 1;
          });

          return {
            quizLevels: state.quizLevels.map((level, index) => {
              if (level.id === levelId) {
                return {
                  ...level,
                  completed: passed,
                  score,
                  attempts: level.attempts + 1,
                };
              }
              // Unlock next level if current passed
              if (index === levelIndex + 1 && passed) {
                return { ...level, unlocked: true };
              }
              return level;
            }),
            lawMissedCount: newMissedCount,
          };
        }),

      incrementLawMissed: (lawName) =>
        set((state) => ({
          lawMissedCount: {
            ...state.lawMissedCount,
            [lawName]: (state.lawMissedCount[lawName] || 0) + 1,
          },
        })),

      resetGame: () =>
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
        }),
    }),
    {
      name: 'exponentia-game-storage',
    }
  )
);
