import { useEffect, useState } from 'react';
import { Search, Eye, UserPlus, RefreshCw, Filter } from 'lucide-react';
import { getUsers } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import UserDetailsModal from './UserDetailsModal';
import GrantAccessModal from './GrantAccessModal';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [grantAccessUser, setGrantAccessUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [pagination.skip, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        skip: pagination.skip,
        limit: pagination.limit,
      };

      if (statusFilter) {
        params.subscription_status = statusFilter;
      }

      if (search) {
        params.search = search;
      }

      const data = await getUsers(params);
      setUsers(data.users);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, skip: 0 }));
    loadUsers();
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      trial: 'badge-info',
      expired: 'badge-danger',
      cancelled: 'badge-warning',
      pending: 'badge-warning',
    };
    return badges[status] || 'badge';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Ativo',
      trial: 'Trial',
      expired: 'Expirado',
      cancelled: 'Cancelado',
      pending: 'Pendente',
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-gray-600 mt-1">
            Total: {pagination.total} usuários
          </p>
        </div>
        <button onClick={loadUsers} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por nome, email ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              className="input w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="trial">Trial</option>
              <option value="expired">Expirados</option>
              <option value="cancelled">Cancelados</option>
            </select>

            <button type="submit" className="btn-primary">
              Buscar
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissões
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">{user.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(user.subscription_status)}`}>
                        {getStatusText(user.subscription_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.subscription_plan ? (
                        <span className="capitalize">{user.subscription_plan}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.subscription_end_date ? (
                        <div>
                          <p>{format(new Date(user.subscription_end_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          <p className="text-xs text-gray-500">
                            {user.days_remaining} dias restantes
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.total_submissions}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => setGrantAccessUser(user)}
                        className="text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        Acesso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {pagination.skip + 1} a {Math.min(pagination.skip + pagination.limit, pagination.total)} de {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, skip: Math.max(0, prev.skip - prev.limit) }))}
              disabled={pagination.skip === 0}
              className="btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, skip: prev.skip + prev.limit }))}
              disabled={pagination.skip + pagination.limit >= pagination.total}
              className="btn-secondary disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadUsers}
        />
      )}

      {grantAccessUser && (
        <GrantAccessModal
          user={grantAccessUser}
          onClose={() => setGrantAccessUser(null)}
          onSuccess={loadUsers}
        />
      )}
    </div>
  );
}
