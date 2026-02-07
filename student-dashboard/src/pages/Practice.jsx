import { useState, useEffect } from 'react';
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  ArrowRight,
  RotateCcw,
  Send,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { practiceAPI } from '../services/api';

const taskTypes = [
  {
    id: 'read_complete',
    name: 'Read & Complete',
    description: 'Complete as lacunas no texto',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    id: 'read_select',
    name: 'Read & Select',
    description: 'Selecione as palavras reais',
    icon: BookOpen,
    color: 'bg-indigo-500',
  },
  {
    id: 'listen_type',
    name: 'Listen & Type',
    description: 'Ouça e escreva o que ouviu',
    icon: Headphones,
    color: 'bg-purple-500',
  },
  {
    id: 'speak_about',
    name: 'Speak About Photo',
    description: 'Descreva a foto em inglês',
    icon: Mic,
    color: 'bg-pink-500',
  },
  {
    id: 'write_essay',
    name: 'Write About Topic',
    description: 'Escreva sobre um tópico (50+ palavras)',
    icon: PenTool,
    color: 'bg-green-500',
  },
  {
    id: 'write_sample',
    name: 'Write Sample',
    description: 'Escreva uma resposta (50+ palavras)',
    icon: PenTool,
    color: 'bg-teal-500',
  },
];

export default function Practice() {
  const [selectedType, setSelectedType] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    if (selectedType) {
      loadTask();
    }
  }, [selectedType]);

  const loadTask = async () => {
    setIsLoading(true);
    setCurrentTask(null);
    setResponse('');
    setEvaluation(null);

    try {
      const task = await practiceAPI.getTask(selectedType);
      setCurrentTask(task);
    } catch (error) {
      console.error('Error loading task:', error);
      alert('Erro ao carregar exercício. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!response.trim()) {
      alert('Por favor, escreva sua resposta antes de enviar');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await practiceAPI.submitResponse({
        task_type: selectedType,
        task_prompt: currentTask.prompt,
        response_text: response,
      });

      setEvaluation(result);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erro ao avaliar resposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewTask = () => {
    loadTask();
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
    setCurrentTask(null);
    setResponse('');
    setEvaluation(null);
  };

  const getScoreColor = (score) => {
    if (score >= 130) return 'text-success-600 bg-success-50 border-success-200';
    if (score >= 100) return 'text-primary-600 bg-primary-50 border-primary-200';
    if (score >= 70) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Praticar</h1>
          <p className="text-gray-600">Escolha o tipo de exercício que deseja praticar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="card-hover text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const currentTypeInfo = taskTypes.find((t) => t.id === selectedType);
  const Icon = currentTypeInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${currentTypeInfo.color} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentTypeInfo.name}</h1>
            <p className="text-gray-600">{currentTypeInfo.description}</p>
          </div>
        </div>
        <button onClick={handleBackToSelection} className="btn-secondary">
          Trocar Exercício
        </button>
      </div>

      {/* Task Content */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando exercício...</p>
        </div>
      ) : currentTask ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Exercício</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {currentTask.prompt}
                </p>
              </div>
            </div>

            {/* Response Area */}
            {!evaluation ? (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Sua Resposta</h3>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Digite sua resposta em inglês..."
                  className="input-field min-h-[200px] resize-none"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    {response.split(/\s+/).filter(Boolean).length} palavras
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !response.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Avaliando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar Resposta
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Evaluation Results */
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Resultado da Avaliação</h3>
                  <button onClick={handleNewTask} className="btn-secondary flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Novo Exercício
                  </button>
                </div>

                {/* Overall Score */}
                <div className={`border rounded-lg p-6 mb-6 ${getScoreColor(evaluation.overall_score)}`}>
                  <p className="text-sm font-medium mb-2">Pontuação Geral</p>
                  <p className="text-5xl font-bold mb-1">{evaluation.overall_score}</p>
                  <p className="text-sm opacity-80">de 160</p>
                </div>

                {/* Detailed Feedback */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Feedback Detalhado</h4>

                  {evaluation.detailed_feedback && (
                    <div className="space-y-3">
                      {Object.entries(evaluation.detailed_feedback).map(([category, feedback]) => (
                        <div key={category} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 capitalize">
                              {category.replace('_', ' ')}
                            </p>
                            <span className="text-sm font-semibold text-primary-600">
                              {feedback.score}/40
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{feedback.feedback}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Strengths and Improvements */}
                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-success-900 mb-2">Pontos Fortes</p>
                          <ul className="text-sm text-success-800 space-y-1">
                            {evaluation.strengths.map((strength, index) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {evaluation.improvements && evaluation.improvements.length > 0 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-warning-900 mb-2">Pontos a Melhorar</p>
                          <ul className="text-sm text-warning-800 space-y-1">
                            {evaluation.improvements.map((improvement, index) => (
                              <li key={index}>• {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-4">
            <div className="card bg-primary-50 border-primary-200">
              <h4 className="font-semibold text-primary-900 mb-3">Dicas</h4>
              <ul className="text-sm text-primary-800 space-y-2">
                <li>• Leia cuidadosamente o enunciado</li>
                <li>• Organize suas ideias antes de escrever</li>
                <li>• Use vocabulário variado</li>
                <li>• Revise antes de enviar</li>
                <li>• Seja claro e objetivo</li>
              </ul>
            </div>

            {!evaluation && (
              <div className="card bg-warning-50 border-warning-200">
                <h4 className="font-semibold text-warning-900 mb-3">⏱️ Dica de Tempo</h4>
                <p className="text-sm text-warning-800">
                  No teste real, você terá tempo limitado. Pratique fazer os exercícios de forma
                  eficiente!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 text-danger-400 mx-auto mb-3" />
          <p className="text-gray-600">Erro ao carregar exercício</p>
          <button onClick={loadTask} className="btn-primary mt-4">
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
}
