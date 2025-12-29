import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useExamStore } from '@/store/examStore';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Word {
  text: string;
  isReal: boolean;
}

// Mock data: 20 palavras (reais e inventadas)
const WORDS: Word[] = [
  { text: 'beautiful', isReal: true },
  { text: 'flumptious', isReal: false },
  { text: 'knowledge', isReal: true },
  { text: 'brindle', isReal: true },
  { text: 'quozzle', isReal: false },
  { text: 'ephemeral', isReal: true },
  { text: 'cromulent', isReal: false },
  { text: 'serendipity', isReal: true },
  { text: 'snarfle', isReal: false },
  { text: 'abundance', isReal: true },
  { text: 'flibbert', isReal: false },
  { text: 'magnificent', isReal: true },
  { text: 'zephyr', isReal: true },
  { text: 'blornag', isReal: false },
  { text: 'resilience', isReal: true },
  { text: 'quibble', isReal: true },
  { text: 'fribble', isReal: false },
  { text: 'eloquent', isReal: true },
  { text: 'snizzle', isReal: false },
  { text: 'catastrophe', isReal: true },
];

const TIME_PER_WORD = 5; // 5 segundos por palavra

export function ReadSelect() {
  const navigate = useNavigate();
  const addResult = useExamStore((state) => state.addResult);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(TIME_PER_WORD);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(WORDS.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = WORDS[currentIndex];
  const progress = ((currentIndex + 1) / WORDS.length) * 100;
  const timerProgress = (timer / TIME_PER_WORD) * 100;

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0.1) {
          // Tempo esgotado - marca como não respondeu e avança
          handleAnswer(null);
          return TIME_PER_WORD;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isFinished]);

  const handleAnswer = (userAnswer: boolean | null) => {
    // Salva a resposta do usuário
    const newAnswers = [...answers];
    newAnswers[currentIndex] = userAnswer;
    setAnswers(newAnswers);

    // Avança para próxima palavra
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimer(TIME_PER_WORD);
    } else {
      // Finaliza o teste
      finishTest(newAnswers);
    }
  };

  const finishTest = (finalAnswers: (boolean | null)[]) => {
    setIsFinished(true);

    // Calcula o score
    let correctAnswers = 0;
    let totalAnswered = 0;

    finalAnswers.forEach((answer, index) => {
      if (answer !== null) {
        totalAnswered++;
        const word = WORDS[index];
        // Usuário disse "SIM" (true) e palavra é real, OU usuário disse "NÃO" (false) e palavra é falsa
        if (answer === word.isReal) {
          correctAnswers++;
        }
      }
    });

    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
    const score = Math.round((correctAnswers / WORDS.length) * 160); // Score de 0-160

    // Salva resultado no Zustand
    addResult({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score: {
        literacy: score,
        conversation: 0,
        comprehension: score,
        production: 0,
        overall: score,
      },
      duration: Math.round((WORDS.length * TIME_PER_WORD - timer) / 60), // Minutos
      accuracy: Math.round(accuracy),
      correctAnswers,
      totalQuestions: WORDS.length,
    });

    // Redireciona para resultados
    setTimeout(() => {
      navigate(`/results?score=${score}`);
    }, 1000);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Teste Concluído!
          </h2>
          <p className="text-gray-600">
            Redirecionando para os resultados...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Read & Select</h1>
              <p className="text-sm text-gray-600">
                Identifique se a palavra é real ou inventada
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {currentIndex + 1}/{WORDS.length}
                </div>
                <div className="text-xs text-gray-500">Progresso</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <ProgressBar value={progress} max={100} variant="secondary" animated={false} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="text-center animate-scale-in">
            {/* Timer Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${timer <= 2 ? 'text-danger animate-pulse' : 'text-gray-500'}`} />
                <span className={`text-lg font-bold ${timer <= 2 ? 'text-danger' : 'text-gray-700'}`}>
                  {timer.toFixed(1)}s
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    timer <= 2 ? 'bg-danger' : timer <= 3 ? 'bg-orange-500' : 'bg-primary'
                  }`}
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
            </div>

            {/* Word Display */}
            <div className="my-12">
              <div className="text-7xl font-bold text-gray-800 tracking-tight animate-fade-in-up">
                {currentWord.text}
              </div>
              <div className="mt-6 text-lg text-gray-600">
                Esta palavra existe em inglês?
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="flex gap-4 justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                icon={<XCircle className="w-6 h-6" />}
                onClick={() => handleAnswer(false)}
                className="flex-1 max-w-xs hover:bg-gray-100 hover:border-gray-400"
              >
                NÃO
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<CheckCircle className="w-6 h-6" />}
                onClick={() => handleAnswer(true)}
                className="flex-1 max-w-xs"
              >
                SIM
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500">
              Pressione SIM se a palavra for real, NÃO se for inventada
            </div>
          </Card>

          {/* Answer History Dots */}
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary scale-125 ring-2 ring-primary ring-offset-2'
                    : answer === null
                    ? 'bg-gray-300'
                    : answer === WORDS[index].isReal
                    ? 'bg-success'
                    : 'bg-danger'
                }`}
                title={
                  answer === null
                    ? 'Não respondida'
                    : answer === WORDS[index].isReal
                    ? 'Correta'
                    : 'Incorreta'
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
