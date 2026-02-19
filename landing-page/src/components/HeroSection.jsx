import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5174/login';

  const handleCTA = () => {
    window.location.href = loginUrl;
  };

  return (
    <section id="hero" className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-primary-50 via-blue-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-primary-100">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold text-gray-700">
                Prepare-se com Inteligência Artificial
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight animate-slide-up">
            Prepare-se para o <span className="gradient-text">DET</span> com
            <br />
            <span className="gradient-text">apoio inteligente</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 text-center mb-12 max-w-3xl mx-auto animate-slide-up">
            Pratique com correção automática, organize sua rotina e acompanhe sua evolução
            sem promessas exageradas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
            <button onClick={handleCTA} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              Entrar
              <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary w-full sm:w-auto">
              Ver Como Funciona
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-16 animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-medium">24 horas grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-medium">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-gray-700 font-medium">Cancele quando quiser</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
