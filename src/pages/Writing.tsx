import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExamTimer } from '@/components/ui/ExamTimer';
import { useExamStore } from '@/store/examStore';
import { PenTool, Save, Send } from 'lucide-react';

const WRITING_PROMPT =
  "Do you agree or disagree with the following statement? Technology has made our lives more complicated rather than simpler. Use specific reasons and examples to support your answer.";

const MIN_WORDS = 50;
const MAX_TIME = 300; // 5 minutos
const AUTO_SAVE_INTERVAL = 5000; // 5 segundos

export function Writing() {
  const navigate = useNavigate();
  const addResult = useExamStore((state) => state.addResult);

  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar rascunho do localStorage ao montar
  useEffect(() => {
    const savedDraft = localStorage.getItem('writing-draft');
    if (savedDraft) {
      setText(savedDraft);
      countWords(savedDraft);
    }

    // Focus no textarea
    textareaRef.current?.focus();
  }, []);

  // Auto-save a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (text.trim()) {
        localStorage.setItem('writing-draft', text);
        setLastSaved(new Date());
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [text]);

  const countWords = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    return words.length;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    countWords(newText);
  };

  const handleTimeUp = () => {
    // Tempo esgotado - submeter automaticamente
    handleSubmit();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const finalWordCount = countWords(text);

    // Calcular score baseado em quantidade de palavras
    // 50 palavras = 80 pontos, 100+ palavras = 140 pontos
    let score = 0;
    if (finalWordCount >= 100) {
      score = 140;
    } else if (finalWordCount >= 75) {
      score = 120;
    } else if (finalWordCount >= 50) {
      score = 100;
    } else if (finalWordCount >= 25) {
      score = 80;
    } else {
      score = 60;
    }

    // Salvar no Zustand
    addResult({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      score: {
        literacy: score,
        conversation: 0,
        comprehension: 0,
        production: score,
        overall: score,
      },
      duration: Math.ceil(MAX_TIME / 60), // 5 minutos
      accuracy: finalWordCount >= MIN_WORDS ? 100 : Math.round((finalWordCount / MIN_WORDS) * 100),
      correctAnswers: finalWordCount >= MIN_WORDS ? 1 : 0,
      totalQuestions: 1,
    });

    // Limpar rascunho
    localStorage.removeItem('writing-draft');

    // Redirecionar para resultados
    navigate(`/results?score=${score}`);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 10) return 'Salvo agora';
    if (seconds < 60) return `Salvo há ${seconds}s`;
    return 'Salvo há mais de 1min';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-success to-success-dark text-white p-3 rounded-xl">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Interactive Writing</h1>
                <p className="text-sm text-gray-600">
                  Escreva pelo menos {MIN_WORDS} palavras
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Save className="w-4 h-4" />
                  <span>{formatLastSaved()}</span>
                </div>
              )}

              {/* Timer */}
              <ExamTimer
                duration={MAX_TIME}
                onTimeUp={handleTimeUp}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="max-w-5xl w-full">
          {/* Prompt Card */}
          <Card className="mb-6 animate-fade-in-down">
            <div className="bg-gradient-to-r from-success/10 to-success-dark/10 -m-6 p-6 mb-6 rounded-t-2xl border-b-2 border-success/20">
              <div className="text-xs font-bold text-success mb-2 uppercase tracking-wide">
                Writing Prompt
              </div>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {WRITING_PROMPT}
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-bold text-blue-900 mb-2">📝 Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Write at least {MIN_WORDS} words to get a good score</li>
                <li>• Use specific examples to support your answer</li>
                <li>• Your response is auto-saved every 5 seconds</li>
                <li>• Check your grammar and spelling before submitting</li>
              </ul>
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                spellCheck={false}
                autoCorrect="off"
                autoComplete="off"
                placeholder="Start typing your answer here..."
                className="w-full h-96 p-4 border-2 border-gray-300 rounded-xl font-mono text-base leading-relaxed resize-none focus:outline-none focus:border-success focus:ring-2 focus:ring-success/20 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                {/* Word Counter */}
                <div className={`text-sm font-semibold ${
                  wordCount >= MIN_WORDS
                    ? 'text-success'
                    : wordCount >= MIN_WORDS / 2
                    ? 'text-orange-600'
                    : 'text-gray-500'
                }`}>
                  <span className="text-2xl">{wordCount}</span>
                  <span className="text-gray-500 ml-1">/ {MIN_WORDS} words</span>
                </div>

                {/* Progress indicator */}
                {wordCount > 0 && wordCount < MIN_WORDS && (
                  <div className="text-xs text-gray-500">
                    {MIN_WORDS - wordCount} more words needed
                  </div>
                )}

                {wordCount >= MIN_WORDS && (
                  <div className="flex items-center gap-1 text-success text-sm font-semibold">
                    <span className="text-lg">✓</span>
                    Minimum reached!
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                variant="success"
                size="lg"
                icon={<Send className="w-5 h-5" />}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
