import { Question } from '@/types/game';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shuffleQuestionOptions(q: Question): Question {
  const optionsWithIndices = q.options.map((opt, idx) => ({ opt, isCorrect: idx === q.correctIndex }));
  const shuffledOptions = shuffleArray(optionsWithIndices);
  const newCorrectIndex = shuffledOptions.findIndex(o => o.isCorrect);
  return {
    ...q,
    options: shuffledOptions.map(o => o.opt),
    correctIndex: newCorrectIndex,
  };
}

export function weightedShuffle(questions: Question[], history: { questionId: string; correct: boolean }[], limit: number): Question[] {
  const historyMap = new Map<string, number>();
  history.forEach(h => {
    const prev = historyMap.get(h.questionId) || 0;
    historyMap.set(h.questionId, prev + (h.correct ? -1 : 1));
  });

  const scored = questions.map(q => {
    const misses = historyMap.get(q.id) || 0;
    const weight = 1 + Math.max(0, misses) * 2;
    return { question: q, weight };
  });

  const pool: Question[] = [];
  const remaining = [...scored];

  while (pool.length < Math.min(limit, questions.length) && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, s) => sum + s.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosen = 0;
    for (let i = 0; i < remaining.length; i++) {
      roll -= remaining[i].weight;
      if (roll <= 0) { chosen = i; break; }
    }
    pool.push(remaining[chosen].question);
    remaining.splice(chosen, 1);
  }

  return pool;
}
