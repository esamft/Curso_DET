import { ArrowRight, CheckCircle2, Sparkles, Trophy, Target } from 'lucide-react';

export default function HeroSection() {
  const handleCTA = () => {
    // Redirecionar para página de cadastro ou abrir modal
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
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
            Passe no <span className="gradient-text">DET</span> com
            <br />
            <span className="gradient-text">Assistência de IA</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 text-center mb-12 max-w-3xl mx-auto animate-slide-up">
            Seu assistente pessoal de estudos com correção instantânea,
            exercícios direcionados e templates de respostas.
            <span className="font-semibold text-primary-600"> Alcance sua meta em tempo recorde!</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
            <button onClick={handleCTA} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              Começar Teste Grátis
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
              <span className="text-gray-700 font-medium">3 dias grátis</span>
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <Trophy className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-gray-600">Taxa de Aprovação</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <Target className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">+25pts</div>
              <div className="text-gray-600">Melhoria Média</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-gray-600">Assistente IA</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
