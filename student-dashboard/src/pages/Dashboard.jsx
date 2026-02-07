import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, submissionsData, progressData] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentSubmissions(5),
        dashboardAPI.getProgressData('30d'),
      ]);

      setStats(statsData);
      setRecentSubmissions(submissionsData);
      setProgressData(progressData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Pontuação Atual',
      value: stats?.current_score || '--',
      icon: Target,
      color: 'bg-primary-500',
      trend: stats?.score_trend || 0,
    },
    {
      name: 'Exercícios Completados',
      value: stats?.total_submissions || 0,
      icon: CheckCircle,
      color: 'bg-success-500',
    },
    {
      name: 'Sequência de Dias',
      value: stats?.streak_days || 0,
      icon: Calendar,
      color: 'bg-warning-500',
      suffix: stats?.streak_days === 1 ? 'dia' : 'dias',
    },
    {
      name: 'Tempo de Estudo',
      value: stats?.study_hours || 0,
      icon: Clock,
      color: 'bg-purple-500',
      suffix: 'horas',
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 130) return 'text-success-600';
    if (score >= 100) return 'text-primary-600';
    if (score >= 70) return 'text-warning-600';
    return 'text-gray-600';
  };

  const getTaskTypeLabel = (taskType) => {
    const labels = {
      read_complete: 'Read & Complete',
      read_select: 'Read & Select',
      listen_type: 'Listen & Type',
      speak_about: 'Speak About',
      write_essay: 'Write Essay',
      write_sample: 'Write Sample',
    };
    return labels[taskType] || taskType;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-primary-100 mb-6">
          Continue praticando para alcançar sua meta no DET
        </p>
        <Link
          to="/practice"
          className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
        >
          <BookOpen className="h-5 w-5" />
          Começar a Praticar
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                    {stat.suffix && <span className="text-sm text-gray-500 ml-1">{stat.suffix}</span>}
                  </p>
                  {stat.trend !== undefined && stat.trend !== 0 && (
                    <p
                      className={`text-sm mt-1 flex items-center gap-1 ${
                        stat.trend > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      {stat.trend > 0 ? '+' : ''}
                      {stat.trend} pts
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso nos Últimos 30 Dias</h3>
          {progressData && progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 160]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p>Ainda não há dados de progresso</p>
            </div>
          )}
        </div>

        {/* Subscores Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho por Habilidade</h3>
          {stats?.subscores ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.subscores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 160]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p>Faça exercícios para ver seu desempenho</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Exercícios Recentes</h3>
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver todos
          </Link>
        </div>

        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {getTaskTypeLabel(submission.task_type)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(submission.created_at), "dd 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(submission.overall_score)}`}>
                      {submission.overall_score}
                    </p>
                    <p className="text-xs text-gray-500">/ 160</p>
                  </div>
                  <Award className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Você ainda não fez nenhum exercício</p>
            <Link to="/practice" className="btn-primary inline-flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Começar Agora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
