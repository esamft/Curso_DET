import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, Target, Clock, TrendingUp, Plus } from 'lucide-react';
import { studyPlanAPI } from '../services/api';

export default function StudyPlan() {
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    setLoading(true);
    try {
      const plan = await studyPlanAPI.getCurrent();
      setStudyPlan(plan);
    } catch (error) {
      console.error('Error loading study plan:', error);
      if (error.response?.status === 404) {
        // No study plan found
        setStudyPlan(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async (dayIndex) => {
    if (!studyPlan) return;

    const day = studyPlan.weekly_schedule[dayIndex];
    const newCompleted = !day.completed;

    try {
      await studyPlanAPI.updateProgress(studyPlan.id, dayIndex, newCompleted);

      // Update local state
      setStudyPlan((prev) => ({
        ...prev,
        weekly_schedule: prev.weekly_schedule.map((d, i) =>
          i === dayIndex ? { ...d, completed: newCompleted } : d
        ),
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Erro ao atualizar progresso');
    }
  };

  const calculateProgress = () => {
    if (!studyPlan?.weekly_schedule) return 0;
    const completed = studyPlan.weekly_schedule.filter((day) => day.completed).length;
    return Math.round((completed / studyPlan.weekly_schedule.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando plano de estudos...</p>
        </div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plano de Estudos</h1>
          <p className="text-gray-600">Crie seu plano personalizado de estudos</p>
        </div>

        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Você ainda não tem um plano de estudos
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Gere um plano personalizado com base no seu nível atual, meta de pontuação e
            disponibilidade de tempo
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Gerar Plano de Estudos
          </button>
        </div>

        {showGenerateModal && <GeneratePlanModal onClose={() => setShowGenerateModal(false)} onGenerated={loadStudyPlan} />}
      </div>
    );
  }

  const progress = calculateProgress();
  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plano de Estudos</h1>
          <p className="text-gray-600">Siga seu cronograma semanal personalizado</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Gerar Novo Plano
        </button>
      </div>

      {/* Progress Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-primary-700 mb-1">Progresso Semanal</p>
            <p className="text-3xl font-bold text-primary-900">{progress}%</p>
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <TrendingUp className="h-10 w-10 text-primary-600" />
          </div>
        </div>
        <div className="bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Study Plan Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gray-50">
          <div className="flex items-center gap-3">
            <Target className="h-10 w-10 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Meta de Pontuação</p>
              <p className="text-xl font-bold text-gray-900">{studyPlan.target_score}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50">
          <div className="flex items-center gap-3">
            <Clock className="h-10 w-10 text-success-600" />
            <div>
              <p className="text-sm text-gray-600">Horas/Semana</p>
              <p className="text-xl font-bold text-gray-900">{studyPlan.hours_per_week}h</p>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50">
          <div className="flex items-center gap-3">
            <Calendar className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Nível Atual</p>
              <p className="text-xl font-bold text-gray-900 uppercase">{studyPlan.current_level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma Semanal</h3>
        <div className="space-y-3">
          {studyPlan.weekly_schedule?.map((day, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${
                day.completed
                  ? 'bg-success-50 border-success-200'
                  : 'bg-white border-gray-200 hover:border-primary-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleDay(index)}
                  className="flex-shrink-0 mt-1 focus:outline-none"
                >
                  {day.completed ? (
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300 hover:text-primary-600 transition-colors" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{daysOfWeek[index]}</h4>
                    <span className="badge-gray">{day.duration} min</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{day.description}</p>
                  {day.activities && day.activities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {day.activities.map((activity, actIndex) => (
                        <span key={actIndex} className="badge-primary">
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-3">💡 Dicas para Melhores Resultados</h4>
        <ul className="text-sm text-primary-800 space-y-2">
          <li>• Mantenha consistência: estude um pouco todos os dias</li>
          <li>• Revise periodicamente o material estudado</li>
          <li>• Pratique todos os tipos de questões do DET</li>
          <li>• Identifique suas fraquezas e dedique mais tempo a elas</li>
          <li>• Faça simulados completos regularmente</li>
        </ul>
      </div>

      {showGenerateModal && <GeneratePlanModal onClose={() => setShowGenerateModal(false)} onGenerated={loadStudyPlan} />}
    </div>
  );
}

function GeneratePlanModal({ onClose, onGenerated }) {
  const [formData, setFormData] = useState({
    current_level: 'intermediate',
    target_score: 120,
    hours_per_week: 10,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      await studyPlanAPI.generate({
        current_level: formData.current_level,
        target_score: parseInt(formData.target_score),
        available_hours_per_week: parseInt(formData.hours_per_week),
      });

      onGenerated();
      onClose();
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Erro ao gerar plano de estudos');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Gerar Plano de Estudos</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nível Atual</label>
            <select
              name="current_level"
              value={formData.current_level}
              onChange={handleChange}
              className="input-field"
            >
              <option value="beginner">Iniciante (A1-A2)</option>
              <option value="intermediate">Intermediário (B1-B2)</option>
              <option value="advanced">Avançado (C1-C2)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta de Pontuação (10-160)
            </label>
            <input
              type="number"
              name="target_score"
              min="10"
              max="160"
              value={formData.target_score}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horas Disponíveis por Semana
            </label>
            <input
              type="number"
              name="hours_per_week"
              min="1"
              max="40"
              value={formData.hours_per_week}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={isGenerating} className="btn-primary flex-1">
              {isGenerating ? 'Gerando...' : 'Gerar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
