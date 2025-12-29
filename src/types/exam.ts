export interface ExamScore {
  literacy: number;
  conversation: number;
  comprehension: number;
  production: number;
  overall: number;
}

export interface ExamResult {
  id: string;
  date: string;
  score: ExamScore;
  duration: number; // in minutes
  accuracy: number; // percentage
  correctAnswers: number;
  totalQuestions: number;
}

export interface ExamStats {
  totalHours: number;
  testsCompleted: number;
  averageAccuracy: number;
  pointsThisWeek: number;
}

export type ExamLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ExamLevelInfo {
  level: ExamLevel;
  name: string;
  icon: string;
  minScore: number;
  maxScore: number;
}

export const EXAM_LEVELS: ExamLevelInfo[] = [
  { level: 'A1', name: 'Iniciante', icon: '🌱', minScore: 10, maxScore: 55 },
  { level: 'A2', name: 'Básico', icon: '📖', minScore: 55, maxScore: 75 },
  { level: 'B1', name: 'Intermediário', icon: '📚', minScore: 75, maxScore: 95 },
  { level: 'B2', name: 'Avançado', icon: '⭐', minScore: 95, maxScore: 115 },
  { level: 'C1', name: 'Proficiente', icon: '🎓', minScore: 115, maxScore: 140 },
  { level: 'C2', name: 'Mestre', icon: '🏆', minScore: 140, maxScore: 160 },
];

export function getExamLevel(score: number): ExamLevelInfo {
  return EXAM_LEVELS.find(level => score >= level.minScore && score <= level.maxScore) || EXAM_LEVELS[0];
}
