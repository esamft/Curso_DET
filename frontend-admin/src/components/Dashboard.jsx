import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, FileText, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import { getAdminStats } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    // Reload stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.users?.new_today || 0} hoje`,
    },
    {
      title: 'Assinantes Ativos',
      value: stats?.users?.active_subscribers || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      change: `${stats?.users?.expiring_soon || 0} expirando em breve`,
    },
    {
      title: 'MRR',
      value: `R$ ${(stats?.revenue?.mrr || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: 'Receita Mensal Recorrente',
    },
    {
      title: 'Submissões Hoje',
      value: stats?.submissions?.today || 0,
      icon: FileText,
      color: 'bg-purple-500',
      change: `${stats?.submissions?.total || 0} total`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status dos Usuários</h3>
          <div className="space-y-3">
            <StatusBar
              label="Ativos"
              value={stats?.users?.active_subscribers || 0}
              total={stats?.users?.total || 1}
              color="bg-green-500"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatusBar
              label="Trial"
              value={stats?.users?.trial_users || 0}
              total={stats?.users?.total || 1}
              color="bg-blue-500"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatusBar
              label="Expirados"
              value={stats?.users?.expired || 0}
              total={stats?.users?.total || 1}
              color="bg-gray-400"
              icon={<UserX className="h-4 w-4" />}
            />
            <StatusBar
              label="Expirando em breve"
              value={stats?.users?.expiring_soon || 0}
              total={stats?.users?.total || 1}
              color="bg-yellow-500"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Novos Usuários (Hoje)</p>
                <p className="text-xs text-gray-600">Cadastros nas últimas 24h</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {stats?.users?.new_today || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Novos Usuários (Semana)</p>
                <p className="text-xs text-gray-600">Últimos 7 dias</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {stats?.users?.new_this_week || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Score Médio</p>
                <p className="text-xs text-gray-600">Todas as submissões</p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {stats?.submissions?.average_score || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Dashboard em Tempo Real</p>
            <p className="text-sm text-blue-700 mt-1">
              As estatísticas são atualizadas automaticamente a cada 30 segundos.
              Para dados mais detalhados, acesse a seção de Usuários ou Relatórios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, value, total, color, icon }) {
  const percentage = Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`${color} text-white p-1 rounded`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
