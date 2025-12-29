import { ExamResult } from '@/types/exam';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { formatDistanceToNow } from '@/utils/date';

interface HistoryListProps {
  results: ExamResult[];
  limit?: number;
}

export function HistoryList({ results, limit = 4 }: HistoryListProps) {
  const displayResults = results.slice(0, limit);

  if (displayResults.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg mb-2">📚 Nenhum simulado realizado ainda</p>
        <p className="text-sm">Comece seu primeiro teste para ver seu histórico aqui!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayResults.map((result, index) => (
        <div
          key={result.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke={getScoreColor(result.score.overall)}
                strokeWidth="2"
              />
              <path
                d="M8 12l2 2 4-4"
                stroke={getScoreColor(result.score.overall)}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="font-semibold text-gray-800">
              Simulado #{results.length - index}
            </div>
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(result.date)}
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0">
            <ScoreBadge score={result.score.overall} />
          </div>
        </div>
      ))}
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 140) return '#4CAF50';
  if (score >= 115) return '#8BC34A';
  if (score >= 95) return '#FFC107';
  if (score >= 70) return '#FF9800';
  return '#F44336';
}
