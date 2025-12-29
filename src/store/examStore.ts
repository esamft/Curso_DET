import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamResult, ExamStats } from '@/types/exam';

interface ExamStore {
  // State
  results: ExamResult[];
  stats: ExamStats;
  currentExam: Partial<ExamResult> | null;

  // Actions
  addResult: (result: ExamResult) => void;
  updateStats: (stats: Partial<ExamStats>) => void;
  startExam: () => void;
  endExam: (result: ExamResult) => void;
  clearHistory: () => void;

  // Computed
  getLatestResult: () => ExamResult | null;
  getAverageScore: () => number;
  getScoreRange: () => { min: number; max: number };
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      results: [],
      stats: {
        totalHours: 0,
        testsCompleted: 0,
        averageAccuracy: 0,
        pointsThisWeek: 0,
      },
      currentExam: null,

      // Actions
      addResult: (result) =>
        set((state) => {
          const newResults = [result, ...state.results].slice(0, 10); // Keep last 10
          const testsCompleted = newResults.length;
          const averageAccuracy =
            newResults.reduce((sum, r) => sum + r.accuracy, 0) / testsCompleted;
          const totalHours = newResults.reduce((sum, r) => sum + r.duration / 60, 0);

          return {
            results: newResults,
            stats: {
              ...state.stats,
              testsCompleted,
              averageAccuracy: Math.round(averageAccuracy),
              totalHours: Math.round(totalHours),
            },
          };
        }),

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),

      startExam: () =>
        set({
          currentExam: {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          },
        }),

      endExam: (result) =>
        set((state) => {
          const updatedState = get().addResult(result);
          return { ...updatedState, currentExam: null };
        }),

      clearHistory: () =>
        set({
          results: [],
          stats: {
            totalHours: 0,
            testsCompleted: 0,
            averageAccuracy: 0,
            pointsThisWeek: 0,
          },
        }),

      // Computed
      getLatestResult: () => {
        const { results } = get();
        return results[0] || null;
      },

      getAverageScore: () => {
        const { results } = get();
        if (results.length === 0) return 0;
        const sum = results.reduce((acc, r) => acc + r.score.overall, 0);
        return Math.round(sum / results.length);
      },

      getScoreRange: () => {
        const { results } = get();
        if (results.length === 0) return { min: 0, max: 0 };

        const scores = results.map(r => r.score.overall);
        const recentScores = scores.slice(0, 3); // Last 3 tests
        const min = Math.min(...recentScores);
        const max = Math.max(...recentScores);

        return { min, max };
      },
    }),
    {
      name: 'det-exam-storage',
    }
  )
);
