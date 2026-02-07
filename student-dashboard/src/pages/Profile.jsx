import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { subscriptionAPI, paymentAPI, authAPI } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Profile() {
  const { user, updateUser, hasActiveSubscription, isTrialSubscription, getSubscriptionEndDate } =
    useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const subData = await subscriptionAPI.getCurrent();
      setSubscription(subData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Segurança', icon: Lock },
    { id: 'subscription', name: 'Assinatura', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie suas informações e assinatura</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
      {activeTab === 'security' && <SecurityTab />}
      {activeTab === 'subscription' && (
        <SubscriptionTab
          subscription={subscription}
          loading={loadingSubscription}
          hasActive={hasActiveSubscription()}
          isTrial={isTrialSubscription()}
          endDate={getSubscriptionEndDate()}
        />
      )}
    </div>
  );
}

function ProfileTab({ user, updateUser }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateUser(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Pessoais</h3>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-success-50 border border-success-200 text-success-800'
              : 'bg-danger-50 border border-danger-200 text-danger-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!isEditing}
            className="input-field disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className="input-field disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user?.name || '', email: user?.email || '' });
                  setMessage({ type: '', text: '' });
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)} className="btn-primary">
              Editar Perfil
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    setIsChanging(true);

    try {
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erro ao alterar senha',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="card max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Alterar Senha</h3>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-success-50 border border-success-200 text-success-800'
              : 'bg-danger-50 border border-danger-200 text-danger-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isChanging} className="btn-primary">
            {isChanging ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubscriptionTab({ subscription, loading, hasActive, isTrial, endDate }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    { id: 'weekly', name: 'Semanal', price: 29.9, period: '7 dias', duration_days: 7 },
    {
      id: 'monthly',
      name: 'Mensal',
      price: 99.9,
      period: '30 dias',
      duration_days: 30,
      popular: true,
    },
    {
      id: 'yearly',
      name: 'Anual',
      price: 997.0,
      period: '365 dias',
      duration_days: 365,
      savings: 'Economize R$ 200',
    },
  ];

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      const response = await paymentAPI.createPayment({
        plan: plan.id,
        payment_method: 'pix',
      });

      // Open PIX QR code in new window or display it
      if (response.pix_qr_code) {
        alert(`PIX QR Code gerado! Use o código: ${response.pix_copia_cola}`);
        // In a real app, you'd display the QR code image and copia-e-cola
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando informações da assinatura...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Assinatura</h3>

        {hasActive ? (
          <div
            className={`border rounded-lg p-6 ${
              isTrial
                ? 'bg-warning-50 border-warning-200'
                : 'bg-success-50 border-success-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle
                    className={`h-6 w-6 ${isTrial ? 'text-warning-600' : 'text-success-600'}`}
                  />
                  <h4 className={`text-xl font-bold ${isTrial ? 'text-warning-900' : 'text-success-900'}`}>
                    {isTrial ? 'Período de Teste' : 'Assinatura Ativa'}
                  </h4>
                </div>
                {endDate && (
                  <p className={`text-sm ${isTrial ? 'text-warning-700' : 'text-success-700'}`}>
                    {isTrial ? 'Teste expira' : 'Renova'} em{' '}
                    {format(new Date(endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-danger-600 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-bold text-danger-900 mb-2">Assinatura Expirada</h4>
                <p className="text-sm text-danger-700 mb-4">
                  Escolha um plano abaixo para continuar estudando
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Planos Disponíveis</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-xl p-6 ${
                plan.popular
                  ? 'border-primary-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-primary-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{plan.period}</p>
                {plan.savings && (
                  <p className="text-sm text-success-600 font-medium mt-2">{plan.savings}</p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {isProcessing && selectedPlan === plan.id ? 'Processando...' : 'Assinar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-3">💳 Formas de Pagamento</h4>
        <ul className="text-sm text-primary-800 space-y-2">
          <li>• PIX (aprovação instantânea)</li>
          <li>• Cartão de Crédito</li>
          <li>• Renovação automática (pode cancelar a qualquer momento)</li>
          <li>• Garantia de 7 dias (devolução do dinheiro)</li>
        </ul>
      </div>
    </div>
  );
}
