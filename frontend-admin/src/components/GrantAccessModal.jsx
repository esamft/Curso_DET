import { useState } from 'react';
import { X, Gift } from 'lucide-react';
import { grantUserAccess } from '../services/api';

export default function GrantAccessModal({ user, onClose, onSuccess }) {
  const [plan, setPlan] = useState('weekly');
  const [customDays, setCustomDays] = useState('');
  const [loading, setLoading] = useState(false);

  const plans = {
    weekly: { name: 'Semanal', days: 7, price: 29.90 },
    monthly: { name: 'Mensal', days: 30, price: 99.90 },
    yearly: { name: 'Anual', days: 365, price: 997.00 },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        plan,
      };

      if (customDays) {
        data.duration_days = parseInt(customDays);
      }

      await grantUserAccess(user.id, data);
      alert('Acesso concedido com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao conceder acesso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Conceder Acesso</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Conceder acesso para:</p>
            <p className="font-bold text-lg">{user.full_name || user.email}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Plano
            </label>
            <div className="space-y-2">
              {Object.entries(plans).map(([key, planData]) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    plan === key
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value={key}
                      checked={plan === key}
                      onChange={(e) => setPlan(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium">{planData.name}</p>
                      <p className="text-sm text-gray-600">{planData.days} dias</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary-600">
                    R$ {planData.price.toFixed(2)}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração Personalizada (opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                className="input"
                placeholder="Ex: 14"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
              />
              <span className="text-sm text-gray-600">dias</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se especificado, sobrescreve a duração padrão do plano
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Atenção:</strong> Ao conceder acesso, a assinatura do usuário será
              ativada imediatamente e ele terá acesso completo à plataforma.
            </p>
            {customDays && (
              <p className="text-sm text-blue-900 mt-2">
                Este usuário receberá <strong>{customDays} dias</strong> de acesso.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Concedendo...' : 'Conceder Acesso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
