import { useState, useEffect } from 'react';
import { History as HistoryIcon, Award, Calendar, Filter, ChevronRight, X } from 'lucide-react';
import { submissionsAPI } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const taskTypeLabels = {
  read_complete: 'Read & Complete',
  read_select: 'Read & Select',
  listen_type: 'Listen & Type',
  speak_about: 'Speak About Photo',
  write_essay: 'Write About Topic',
  write_sample: 'Write Sample',
};

export default function History() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    task_type: '',
    min_score: '',
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsData, statsData] = await Promise.all([
        submissionsAPI.getAll(page, 10, filters),
        submissionsAPI.getStats(),
      ]);

      setSubmissions(submissionsData.submissions || []);
      setTotalPages(submissionsData.total_pages || 1);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ task_type: '', min_score: '' });
    setPage(1);
  };

  const getScoreColor = (score) => {
    if (score >= 130) return 'text-success-600 bg-success-50 border-success-200';
    if (score >= 100) return 'text-primary-600 bg-primary-50 border-primary-200';
    if (score >= 70) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 130) return 'badge-success';
    if (score >= 100) return 'badge-primary';
    if (score >= 70) return 'badge-warning';
    return 'badge-gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico</h1>
        <p className="text-gray-600">Acompanhe todas as suas submissões e avaliações</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700 mb-1">Média Geral</p>
                <p className="text-3xl font-bold text-primary-900">{stats.average_score || '--'}</p>
              </div>
              <Award className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <div className="card bg-success-50 border-success-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success-700 mb-1">Melhor Pontuação</p>
                <p className="text-3xl font-bold text-success-900">{stats.highest_score || '--'}</p>
              </div>
              <Award className="h-10 w-10 text-success-600" />
            </div>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-warning-700 mb-1">Total de Submissões</p>
                <p className="text-3xl font-bold text-warning-900">{stats.total_submissions || 0}</p>
              </div>
              <HistoryIcon className="h-10 w-10 text-warning-600" />
            </div>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Esta Semana</p>
                <p className="text-3xl font-bold text-purple-900">{stats.this_week || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Exercício</label>
            <select
              name="task_type"
              value={filters.task_type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">Todos</option>
              {Object.entries(taskTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pontuação Mínima</label>
            <input
              type="number"
              name="min_score"
              min="0"
              max="160"
              value={filters.min_score}
              onChange={handleFilterChange}
              placeholder="Ex: 100"
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-secondary w-full">
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissões</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        ) : submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-primary-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {taskTypeLabels[submission.task_type] || submission.task_type}
                      </h4>
                      <span className={`badge ${getScoreBadgeColor(submission.overall_score)}`}>
                        {submission.overall_score} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(submission.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma submissão encontrada</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}

function SubmissionDetailModal({ submission, onClose }) {
  const getScoreColor = (score) => {
    if (score >= 130) return 'text-success-600 bg-success-50 border-success-200';
    if (score >= 100) return 'text-primary-600 bg-primary-50 border-primary-200';
    if (score >= 70) return 'text-warning-600 bg-warning-50 border-warning-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {taskTypeLabels[submission.task_type] || submission.task_type}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Score */}
        <div className={`border rounded-lg p-6 mb-6 ${getScoreColor(submission.overall_score)}`}>
          <p className="text-sm font-medium mb-2">Pontuação Geral</p>
          <p className="text-5xl font-bold mb-1">{submission.overall_score}</p>
          <p className="text-sm opacity-80">de 160</p>
        </div>

        {/* Task Prompt */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Exercício</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{submission.task_prompt}</p>
          </div>
        </div>

        {/* Your Response */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Sua Resposta</h4>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800 whitespace-pre-wrap">{submission.response_text}</p>
          </div>
        </div>

        {/* Detailed Feedback */}
        {submission.detailed_feedback && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Avaliação Detalhada</h4>
            <div className="space-y-3">
              {Object.entries(submission.detailed_feedback).map(([category, feedback]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
          </div>
        )}

        {/* Metadata */}
        <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
          Submetido em{' '}
          {format(new Date(submission.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
            locale: ptBR,
          })}
        </div>
      </div>
    </div>
  );
}
