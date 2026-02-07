import { useEffect, useState } from 'react';
import { X, UserCheck, UserX, Loader } from 'lucide-react';
import { getUserDetails, deactivateUser, activateUser } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UserDetailsModal({ user, onClose, onUpdate }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [user.id]);

  const loadDetails = async () => {
    try {
      const data = await getUserDetails(user.id);
      setDetails(data);
    } catch (err) {
      console.error('Error loading user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;

    setActionLoading(true);
    try {
      await deactivateUser(user.id);
      alert('Usuário desativado com sucesso');
      onUpdate();
      onClose();
    } catch (err) {
      alert('Erro ao desativar usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await activateUser(user.id);
      alert('Usuário ativado com sucesso');
      onUpdate();
      onClose();
    } catch (err) {
      alert('Erro ao ativar usuário');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Detalhes do Usuário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome Completo</p>
                    <p className="font-medium">{details.user.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{details.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{details.user.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF</p>
                    <p className="font-medium">{details.user.cpf || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Assinatura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{details.user.subscription_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="font-medium capitalize">{details.user.subscription_plan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Início</p>
                    <p className="font-medium">
                      {details.user.subscription_start_date
                        ? format(new Date(details.user.subscription_start_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Término</p>
                    <p className="font-medium">
                      {details.user.subscription_end_date
                        ? format(new Date(details.user.subscription_end_date), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Study Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Progresso</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nível Atual</p>
                    <p className="font-medium">{details.user.current_level || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meta de Score</p>
                    <p className="font-medium">{details.user.target_score || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Submissões</p>
                    <p className="font-medium">{details.user.total_submissions}</p>
                  </div>
                </div>
              </div>

              {/* Recent Submissions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Submissões Recentes</h3>
                {details.recent_submissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma submissão ainda</p>
                ) : (
                  <div className="space-y-2">
                    {details.recent_submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{submission.task_type}</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(submission.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary-600">
                            {submission.overall_score || '-'}/160
                          </p>
                          <p className="text-xs text-gray-600">{submission.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conta</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(details.user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Atividade</p>
                    <p className="font-medium">
                      {details.user.last_active
                        ? format(new Date(details.user.last_active), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status da Conta</p>
                    <p className="font-medium">
                      {details.user.is_active ? (
                        <span className="text-green-600">Ativa</span>
                      ) : (
                        <span className="text-red-600">Desativada</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Fechar
          </button>
          {details?.user.is_active ? (
            <button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="btn-danger flex items-center gap-2 disabled:opacity-50"
            >
              <UserX className="h-4 w-4" />
              Desativar Usuário
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              Ativar Usuário
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
