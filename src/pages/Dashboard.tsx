import { useExamStore } from '@/store/examStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScoreGauge } from '@/components/dashboard/ScoreGauge';
import { RadarChart } from '@/components/dashboard/RadarChart';
import { HistoryList } from '@/components/dashboard/HistoryList';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { results, stats, getScoreRange, getLatestResult } = useExamStore();

  const latestResult = getLatestResult();
  const scoreRange = getScoreRange();
  const hasResults = results.length > 0;

  const radarScores = latestResult
    ? {
        literacy: latestResult.score.literacy,
        conversation: latestResult.score.conversation,
        comprehension: latestResult.score.comprehension,
        production: latestResult.score.production,
      }
    : { literacy: 0, conversation: 0, comprehension: 0, production: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 w-12 h-12">
              <div className="h-3 bg-gradient-to-r from-purple to-purple-dark rounded-md" />
              <div className="h-3 bg-gradient-to-r from-secondary to-secondary-dark rounded-md" />
              <div className="h-3 bg-gradient-to-r from-primary to-primary-dark rounded-md" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">DET Simulator</h1>
              <p className="text-sm text-gray-500">Dashboard do Aluno</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">Aluno</p>
              <p className="text-sm text-green-600 font-medium">
                {hasResults ? 'Nível ' + getExamLevel(latestResult.score.overall).level : 'Iniciante'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Bento Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-5 auto-rows-min">
          {/* Score Gauge - Large */}
          <Card className="col-span-12 md:col-span-7 row-span-2">
            <CardHeader>
              <CardTitle>Sua Estimativa DET</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreGauge
                score={latestResult?.score.overall || 0}
                scoreRange={hasResults ? scoreRange : undefined}
              />
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="col-span-12 md:col-span-5 row-span-2">
            <CardHeader>
              <CardTitle>Desempenho por Habilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart scores={radarScores} />
            </CardContent>
          </Card>

          {/* History */}
          <Card className="col-span-12 md:col-span-7 row-span-2">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Histórico de Simulados</CardTitle>
              {results.length > 4 && (
                <button className="text-sm text-secondary font-semibold hover:underline">
                  Ver tudo
                </button>
              )}
            </CardHeader>
            <CardContent>
              <HistoryList results={results} limit={4} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-12 md:col-span-5 row-span-3">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/menu')}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                      fill="white"
                    />
                  </svg>
                }
              >
                <div>
                  <div className="font-bold">Novo Simulado Completo</div>
                  <div className="text-sm opacity-90">~45 minutos</div>
                </div>
              </Button>

              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={() => navigate('/flashcards')}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="6"
                      width="16"
                      height="12"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                }
              >
                <div>
                  <div className="font-bold">Revisar Flashcards</div>
                  <div className="text-sm opacity-90">24 cards disponíveis</div>
                </div>
              </Button>

              <Button
                variant="purple"
                size="lg"
                className="w-full"
                onClick={() => navigate('/speaking')}
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                      fill="white"
                    />
                  </svg>
                }
              >
                <div>
                  <div className="font-bold">Praticar Speaking</div>
                  <div className="text-sm opacity-90">Treino rápido</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="col-span-12 md:col-span-7">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <StatItem value={stats.totalHours} label="Horas de Estudo" />
                <StatItem value={stats.testsCompleted} label="Simulados Feitos" />
                <StatItem value={`${stats.averageAccuracy}%`} label="Taxa de Acerto" />
                <StatItem
                  value={`+${stats.pointsThisWeek}`}
                  label="Pontos esta semana"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black bg-gradient-to-br from-secondary to-secondary-dark bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function getExamLevel(score: number) {
  if (score >= 140) return { level: 'C2' };
  if (score >= 115) return { level: 'C1' };
  if (score >= 95) return { level: 'B2' };
  if (score >= 75) return { level: 'B1' };
  if (score >= 55) return { level: 'A2' };
  return { level: 'A1' };
}
