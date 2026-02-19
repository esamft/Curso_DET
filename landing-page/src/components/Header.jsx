import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5174/login';

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold gradient-text">
              DET Descomplicado
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Preço
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              FAQ
            </button>
            <button
              onClick={() => {
                window.location.href = loginUrl;
              }}
              className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-colors font-semibold"
            >
              Entrar
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Preço
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              FAQ
            </button>
            <button
              onClick={() => {
                window.location.href = loginUrl;
              }}
              className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Entrar
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
