import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { verifyAdminKey } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthAdminKey = useAuthStore((state) => state.setAdminKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyAdminKey(adminKey);

      if (result.valid) {
        setAuthAdminKey(adminKey);
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">DET Flow Admin</h2>
          <p className="mt-2 text-primary-100">Dashboard Administrativo</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admin-key" className="block text-sm font-medium text-gray-700 mb-2">
                Chave de Administrador
              </label>
              <input
                id="admin-key"
                name="admin-key"
                type="password"
                required
                className="input"
                placeholder="Digite sua chave de administrador"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Acessar Dashboard'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Nota:</strong> A chave de administrador está configurada na variável de ambiente <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">ADMIN_API_KEY</code> do backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
