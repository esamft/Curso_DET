import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getExamLevel } from '@/types/exam';
import { useExamStore } from '@/store/examStore';

export function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scoreRef = useRef<HTMLDivElement>(null);
  const addResult = useExamStore((state) => state.addResult);

  const score = parseInt(searchParams.get('score') || '135');
  const level = getExamLevel(score);

  const sectionScores = {
    literacy: Math.min(160, score + 5),
    conversation: Math.max(10, score - 10),
    comprehension: Math.max(10, score - 5),
    production: score,
  };

  useEffect(() => {
    // Confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#98D8C8', '#F7DC6F', '#BB8FCE'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Animate score
    let current = 0;
    const increment = score / 60;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      if (scoreRef.current) {
        scoreRef.current.textContent = Math.floor(current).toString();
      }
    }, 25);

    // Save result
    const result = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score: { ...sectionScores, overall: score },
      duration: 42,
      accuracy: 89,
      correctAnswers: 45,
      totalQuestions: 50,
    };
    addResult(result);

    return () => clearInterval(interval);
  }, [score, addResult]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple to-purple-dark p-5">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-5 animate-bounce-slow">
            <span className="text-3xl">{level.icon}</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Teste Concluído!</h1>
          <p className="text-lg text-white/90">Parabéns por completar o simulado DET</p>
        </header>

        {/* Score Hero */}
        <Card className="animate-scale-in">
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
              Sua Pontuação
            </p>
            <div
              ref={scoreRef}
              className="text-9xl font-black bg-gradient-to-br from-purple to-purple-dark bg-clip-text text-transparent mb-2"
            >
              0
            </div>
            <p className="text-xl text-gray-500">de 160</p>

            {/* Scale Bar */}
            <div className="mt-10 max-w-lg mx-auto">
              <div className="flex justify-between text-sm text-gray-500 mb-3 px-3">
                <span>10</span>
                <span>60</span>
                <span>110</span>
                <span>160</span>
              </div>
              <div className="relative h-3 bg-gradient-to-r from-red-500 via-yellow-400 via-lime-400 to-green-500 rounded-full">
                <div
                  className="absolute top-0 -translate-x-1/2 -translate-y-2"
                  style={{ left: `${((score - 10) / 150) * 100}%` }}
                >
                  <div className="w-7 h-7 bg-white border-4 border-purple rounded-full animate-pulse-slow" />
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-purple text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    {score}
                  </div>
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <div className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-4 rounded-full shadow-lg">
              <span className="text-3xl">{level.icon}</span>
              <span className="text-lg font-bold text-gray-800">
                Nível {level.level} {level.name}
              </span>
            </div>
          </div>
        </Card>

        {/* Breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-5">
            Desempenho por Seção
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {Object.entries(sectionLabels).map(([key, label]) => (
              <SectionCard
                key={key}
                label={label.name}
                score={sectionScores[key as keyof typeof sectionScores]}
                icon={label.icon}
                color={label.color}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard icon="⏱️" value="42 min" label="Tempo Total" />
          <StatCard icon="✅" value="89%" label="Taxa de Acerto" />
          <StatCard icon="🎯" value="45/50" label="Questões Corretas" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => alert('Correções em desenvolvimento')}
          >
            Ver Correções Detalhadas
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

const sectionLabels = {
  literacy: { name: 'Literacy', icon: '📖', color: 'from-blue-400 to-blue-600' },
  conversation: { name: 'Conversation', icon: '🎤', color: 'from-purple to-purple-dark' },
  comprehension: { name: 'Comprehension', icon: '👂', color: 'from-primary to-primary-dark' },
  production: { name: 'Production', icon: '✍️', color: 'from-success to-success-dark' },
};

function SectionCard({
  label,
  score,
  icon,
  color,
}: {
  label: string;
  score: number;
  icon: string;
  color: string;
}) {
  const variant = score >= 130 ? 'success' : score >= 110 ? 'warning' : 'primary';

  return (
    <Card className="animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">{label}</h3>
          <p className="text-sm text-gray-500 mb-3">Leitura e Escrita</p>
          <ProgressBar value={score} max={160} variant={variant} animated />
          <p className="text-right mt-2 font-bold text-gray-700">{score}</p>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <Card className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-2xl font-black text-gray-800 mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </Card>
  );
}
