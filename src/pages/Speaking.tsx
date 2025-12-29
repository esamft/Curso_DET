import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useExamStore } from '@/store/examStore';
import { Mic, Square, Loader2, Play } from 'lucide-react';

const SPEAKING_QUESTION = "Do you think technology brings people closer together or pushes them apart? Explain your opinion with examples from your own experience.";
const MAX_TIME = 35; // 35 segundos

type SpeakingState = 'reading' | 'recording' | 'processing';

export function Speaking() {
  const navigate = useNavigate();
  const addResult = useExamStore((state) => state.addResult);
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    error,
    amplitude,
  } = useAudioRecorder();

  const [state, setState] = useState<SpeakingState>('reading');
  const [timer, setTimer] = useState(MAX_TIME);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  // Timer countdown durante gravação
  useEffect(() => {
    if (state === 'recording' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0.1) {
            // Tempo esgotado - parar gravação forçadamente
            handleStopRecording();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state, timer]);

  // Processar áudio quando blob estiver disponível
  useEffect(() => {
    if (audioBlob && state === 'recording') {
      setState('processing');
      // Simular processamento
      setTimeout(() => {
        handleSubmit();
      }, 1500);
    }
  }, [audioBlob, state]);

  const handleStartRecording = async () => {
    setState('recording');
    setHasStartedOnce(true);
    setTimer(MAX_TIME);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // O estado mudará para 'processing' automaticamente no useEffect
  };

  const handleSubmit = () => {
    // Calcular score mockado baseado no tempo de gravação
    const recordedTime = MAX_TIME - timer;
    let score = 0;

    if (recordedTime >= 30) {
      score = 135;
    } else if (recordedTime >= 20) {
      score = 115;
    } else if (recordedTime >= 10) {
      score = 95;
    } else {
      score = 70;
    }

    // Salvar no Zustand
    addResult({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score: {
        literacy: 0,
        conversation: score,
        comprehension: 0,
        production: score,
        overall: score,
      },
      duration: 1, // 1 minuto (35s arredondado)
      accuracy: recordedTime >= 20 ? 100 : Math.round((recordedTime / 20) * 100),
      correctAnswers: recordedTime >= 20 ? 1 : 0,
      totalQuestions: 1,
    });

    // Redirecionar para resultados
    navigate(`/results?score=${score}`);
  };

  const timerProgress = (timer / MAX_TIME) * 100;
  const circumference = 2 * Math.PI * 45; // raio = 45
  const strokeDashoffset = circumference - (timerProgress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple to-purple-dark text-white p-3 rounded-xl">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Interactive Speaking</h1>
                <p className="text-sm text-gray-600">
                  Grave sua resposta em até {MAX_TIME} segundos
                </p>
              </div>
            </div>

            {/* Circular Timer */}
            {state === 'recording' && (
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r="45"
                    stroke={timer <= 10 ? '#EF4444' : timer <= 20 ? '#F59E0B' : '#8B5CF6'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${
                    timer <= 10 ? 'text-danger' : timer <= 20 ? 'text-orange-500' : 'text-purple'
                  }`}>
                    {Math.ceil(timer)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Side - Avatar Section */}
        <div className="flex flex-col items-center justify-center gap-6">
          <Card className="w-full max-w-md">
            {/* Avatar Placeholder */}
            <div className="bg-gradient-to-br from-purple/20 to-purple-dark/20 rounded-2xl p-8 mb-4">
              <div className="relative">
                <div className="w-64 h-80 mx-auto bg-gradient-to-br from-purple/30 to-purple-dark/30 rounded-3xl flex items-center justify-center">
                  <div className="text-6xl">👩‍🏫</div>
                </div>

                {/* Status indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isRecording
                      ? 'bg-danger text-white'
                      : 'bg-purple/10 text-purple-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      isRecording ? 'bg-white animate-pulse' : 'bg-purple'
                    }`} />
                    <span className="text-sm font-semibold">
                      {isRecording ? 'Recording...' : 'Bea is listening'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sound Wave Visualizer */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(4, Math.sin(i * 0.5 + amplitude * 0.1) * amplitude * 0.5 + amplitude * 0.3)}px`,
                    }}
                  />
                ))}
              </div>
            )}

            {!isRecording && hasStartedOnce && state !== 'processing' && (
              <div className="text-center text-sm text-gray-500">
                Click "Start Recording" to begin
              </div>
            )}

            {state === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-purple">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold">Processing your answer...</span>
              </div>
            )}

            {/* Instruction Card */}
            <div className="mt-4 bg-purple/10 rounded-lg p-4 border border-purple/20">
              <div className="flex items-start gap-3">
                <Play className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-900 font-medium">
                  Listen and then speak.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side - Task Section */}
        <div className="flex flex-col justify-center">
          <Card>
            {/* Task Header */}
            <div className="bg-gradient-to-r from-purple/10 to-purple-dark/10 -m-6 p-6 mb-6 rounded-t-2xl border-b-2 border-purple/20">
              <div className="text-xs font-bold text-purple mb-2 uppercase tracking-wide">
                Speaking Task
              </div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-3">
                {SPEAKING_QUESTION}
              </h2>
              <p className="text-sm text-gray-600">
                Speak for at least 30 seconds about the topic. Explain your opinion with examples.
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-bold text-blue-900 mb-2">🎤 Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Start Recording" to begin</li>
                <li>• You have {MAX_TIME} seconds to respond</li>
                <li>• Recording will stop automatically when time runs out</li>
                <li>• Make sure your microphone is working properly</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Recording Button */}
            <div className="flex flex-col items-center gap-4">
              {state === 'reading' && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Mic className="w-6 h-6" />}
                  onClick={handleStartRecording}
                  className="w-full max-w-xs"
                >
                  Start Recording
                </Button>
              )}

              {state === 'recording' && (
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Square className="w-6 h-6" />}
                  onClick={handleStopRecording}
                  className="w-full max-w-xs border-danger text-danger hover:bg-danger hover:text-white"
                >
                  Stop Recording
                </Button>
              )}

              {state === 'processing' && (
                <div className="w-full max-w-xs py-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Processing your response...</p>
                </div>
              )}

              {/* Help Text */}
              <p className="text-sm text-gray-500 text-center max-w-md">
                {state === 'reading' && "Certifique-se de que seu microfone está funcionando corretamente."}
                {state === 'recording' && `Gravando... ${Math.ceil(timer)}s restantes`}
                {state === 'processing' && "Analisando sua resposta..."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
