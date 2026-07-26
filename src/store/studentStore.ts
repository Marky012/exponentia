import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Law, QuizLevel } from './gameStore';

export interface ImportedStudent {
  playerName: string;
  playerGender: 'male' | 'female' | null;
  laws: Law[];
  quizLevels: QuizLevel[];
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  lawMissedCount: Record<string, number>;
  needsAttention: boolean;
  attentionReason: string | null;
  importedAt: string;
}

interface StudentState {
  students: ImportedStudent[];
  importStudent: (data: Omit<ImportedStudent, 'importedAt'>) => { success: boolean; isNew: boolean };
  importStudents: (dataArray: Omit<ImportedStudent, 'importedAt'>[]) => { imported: number; updated: number; failed: number };
  removeStudent: (playerName: string) => void;
  clearStudents: () => void;
  getStudentByName: (name: string) => ImportedStudent | undefined;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: [],

      importStudent: (data) => {
        const existing = get().students.findIndex(s => s.playerName === data.playerName);
        const student: ImportedStudent = { ...data, importedAt: new Date().toISOString() };
        set(state => {
          const students = [...state.students];
          if (existing >= 0) {
            students[existing] = student;
            return { students };
          }
          return { students: [...students, student] };
        });
        return { success: true, isNew: existing < 0 };
      },

      importStudents: (dataArray) => {
        let imported = 0;
        let updated = 0;
        let failed = 0;
        const current = [...get().students];

        for (const data of dataArray) {
          try {
            if (!data.playerName || !data.laws || !data.quizLevels) {
              failed++;
              continue;
            }
            const idx = current.findIndex(s => s.playerName === data.playerName);
            const student: ImportedStudent = { ...data, importedAt: new Date().toISOString() };
            if (idx >= 0) {
              current[idx] = student;
              updated++;
            } else {
              current.push(student);
              imported++;
            }
          } catch {
            failed++;
          }
        }

        set({ students: current });
        return { imported, updated, failed };
      },

      removeStudent: (playerName) => {
        set(state => ({
          students: state.students.filter(s => s.playerName !== playerName),
        }));
      },

      clearStudents: () => set({ students: [] }),

      getStudentByName: (name) => {
        return get().students.find(s => s.playerName === name);
      },
    }),
    {
      name: 'exponentia-admin-students',
    }
  )
);
