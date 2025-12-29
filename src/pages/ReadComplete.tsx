import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExamTimer } from '@/components/ui/ExamTimer';
import { useExamStore } from '@/store/examStore';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Gap {
  id: number;
  answer: string;
  maxLength: number;
}

// Texto corrigido conforme especificação anterior
const GAPS: Gap[] = [
  { id: 1, answer: 'tro', maxLength: 4 },
  { id: 2, answer: 'ating', maxLength: 5 },
  { id: 3, answer: 'ation', maxLength: 5 },
  { id: 4, answer: 'te', maxLength: 2 },
];

const MAX_TIME = 180; // 3 minutos

export function ReadComplete() {
  const navigate = useNavigate();
  const addResult = useExamStore((state) => state.addResult);

  const [answers, setAnswers] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    // Focus no primeiro input
    inputRefs.current[1]?.focus();
  }, []);

  const handleInputChange = (gapId: number, value: string) => {
    // Limitar ao maxLength e remover espaços
    const gap = GAPS.find(g => g.id === gapId);
    if (!gap) return;

    const cleanValue = value.replace(/\s/g, '').toLowerCase();
    const limitedValue = cleanValue.slice(0, gap.maxLength);

    setAnswers(prev => ({
      ...prev,
      [gapId]: limitedValue,
    }));

    // Auto-focus no próximo input quando atingir maxLength
    if (limitedValue.length === gap.maxLength && gapId < GAPS.length) {
      setTimeout(() => {
        inputRefs.current[gapId + 1]?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (gapId: number, e: React.KeyboardEvent) => {
    // Navegar com Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      if (gapId < GAPS.length) {
        inputRefs.current[gapId + 1]?.focus();
      } else if (allFieldsFilled()) {
        handleSubmit();
      }
    }

    // Navegar com Tab (padrão já funciona, mas garantir)
    if (e.key === 'Tab' && !e.shiftKey && gapId < GAPS.length) {
      e.preventDefault();
      inputRefs.current[gapId + 1]?.focus();
    }

    // Backspace para voltar ao input anterior se estiver vazio
    if (e.key === 'Backspace' && answers[gapId] === '' && gapId > 1) {
      inputRefs.current[gapId - 1]?.focus();
    }
  };

  const allFieldsFilled = () => {
    return GAPS.every(gap => answers[gap.id]?.trim().length > 0);
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Calcular score baseado na precisão
    let correctAnswers = 0;
    GAPS.forEach(gap => {
      if (answers[gap.id]?.toLowerCase() === gap.answer.toLowerCase()) {
        correctAnswers++;
      }
    });

    const accuracy = (correctAnswers / GAPS.length) * 100;
    const score = Math.round((correctAnswers / GAPS.length) * 160); // 0-160

    // Salvar no Zustand
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
      duration: Math.ceil(MAX_TIME / 60), // 3 minutos
      accuracy: Math.round(accuracy),
      correctAnswers,
      totalQuestions: GAPS.length,
    });

    // Redirecionar para resultados
    navigate(`/results?score=${score}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-3 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Read & Complete</h1>
                <p className="text-sm text-gray-600">
                  Preencha as lacunas com as palavras corretas
                </p>
              </div>
            </div>

            <ExamTimer
              duration={MAX_TIME}
              onTimeUp={handleTimeUp}
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <Card className="animate-scale-in">
            {/* Instructions */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="text-sm font-bold text-orange-900 mb-2">📖 Instructions:</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Type the missing letters to complete each word</li>
                <li>• Press Tab or Enter to move to the next field</li>
                <li>• All fields must be filled before submitting</li>
                <li>• Spelling must be exact to receive credit</li>
              </ul>
            </div>

            {/* Text with inline inputs */}
            <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
              <div className="text-2xl leading-relaxed text-gray-800 font-serif">
                The study of as
                <input
                  ref={el => inputRefs.current[1] = el}
                  type="text"
                  value={answers[1]}
                  onChange={(e) => handleInputChange(1, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(1, e)}
                  maxLength={GAPS[0].maxLength}
                  className="inline-block mx-1 px-2 py-1 border-b-2 border-primary bg-yellow-100 text-center font-mono text-xl font-bold focus:outline-none focus:border-primary-dark focus:bg-yellow-200 transition-all"
                  style={{ width: `${GAPS[0].maxLength * 1.2}ch` }}
                  disabled={isSubmitting}
                />
                nomy has fascin
                <input
                  ref={el => inputRefs.current[2] = el}
                  type="text"
                  value={answers[2]}
                  onChange={(e) => handleInputChange(2, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(2, e)}
                  maxLength={GAPS[1].maxLength}
                  className="inline-block mx-1 px-2 py-1 border-b-2 border-primary bg-yellow-100 text-center font-mono text-xl font-bold focus:outline-none focus:border-primary-dark focus:bg-yellow-200 transition-all"
                  style={{ width: `${GAPS[1].maxLength * 1.2}ch` }}
                  disabled={isSubmitting}
                />
                {' '}implications for our dedic
                <input
                  ref={el => inputRefs.current[3] = el}
                  type="text"
                  value={answers[3]}
                  onChange={(e) => handleInputChange(3, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(3, e)}
                  maxLength={GAPS[2].maxLength}
                  className="inline-block mx-1 px-2 py-1 border-b-2 border-primary bg-yellow-100 text-center font-mono text-xl font-bold focus:outline-none focus:border-primary-dark focus:bg-yellow-200 transition-all"
                  style={{ width: `${GAPS[2].maxLength * 1.2}ch` }}
                  disabled={isSubmitting}
                />
                {' '}to solving the mys
                <input
                  ref={el => inputRefs.current[4] = el}
                  type="text"
                  value={answers[4]}
                  onChange={(e) => handleInputChange(4, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(4, e)}
                  maxLength={GAPS[3].maxLength}
                  className="inline-block mx-1 px-2 py-1 border-b-2 border-primary bg-yellow-100 text-center font-mono text-xl font-bold focus:outline-none focus:border-primary-dark focus:bg-yellow-200 transition-all"
                  style={{ width: `${GAPS[3].maxLength * 1.2}ch` }}
                  disabled={isSubmitting}
                />
                ries of the universe.
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <span className="text-sm font-semibold text-gray-700">
                  {Object.values(answers).filter(a => a.trim().length > 0).length} / {GAPS.length} fields completed
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                  style={{
                    width: `${(Object.values(answers).filter(a => a.trim().length > 0).length / GAPS.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={handleSubmit}
                disabled={!allFieldsFilled() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
              </Button>
            </div>

            {/* Help Text */}
            {!allFieldsFilled() && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Fill all fields to enable submission
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
