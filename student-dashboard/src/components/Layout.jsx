import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  History,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  CreditCard,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasActiveSubscription, isTrialSubscription, getSubscriptionEndDate } =
    useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Praticar', icon: BookOpen, path: '/practice' },
    { name: 'Plano de Estudos', icon: Calendar, path: '/study-plan' },
    { name: 'Histórico', icon: History, path: '/history' },
    { name: 'Perfil', icon: User, path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const subscriptionEndDate = getSubscriptionEndDate();
  const isTrial = isTrialSubscription();
  const hasActive = hasActiveSubscription();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DET</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Subscription Badge */}
            {hasActive && (
              <div className="mt-3">
                {isTrial ? (
                  <div className="bg-warning-50 border border-warning-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-warning-800">Teste Grátis</p>
                    {subscriptionEndDate && (
                      <p className="text-xs text-warning-600 mt-1">
                        Até {format(new Date(subscriptionEndDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-success-50 border border-success-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-success-800">Assinatura Ativa</p>
                    {subscriptionEndDate && (
                      <p className="text-xs text-success-600 mt-1">
                        Renova em {format(new Date(subscriptionEndDate), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!hasActive && (
              <div className="mt-3">
                <div className="bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-danger-800">Assinatura Expirada</p>
                  <Link to="/profile" className="text-xs text-danger-600 hover:text-danger-700 underline mt-1 block">
                    Renovar agora
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none"></div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-400 ring-2 ring-white"></span>
              </button>

              {/* Subscription CTA */}
              {!hasActive && (
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Assinar
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
