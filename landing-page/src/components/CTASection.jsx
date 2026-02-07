import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-semibold">Teste Grátis por 3 Dias - Sem Cartão de Crédito</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Comece Sua Jornada Rumo à Aprovação no DET Hoje Mesmo
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl mb-8 text-primary-100 leading-relaxed">
            Junte-se a mais de 1.200 alunos que já conquistaram suas metas no Duolingo English Test com nossa plataforma
          </p>

          {/* Benefits list */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 text-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>3 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Cancele quando quiser</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#pricing"
              className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Começar Teste Grátis Agora
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="text-white border-2 border-white/50 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Ver Planos e Preços
            </button>
          </div>

          {/* Trust signals */}
          <p className="mt-8 text-primary-100 text-sm">
            🔒 Seus dados estão seguros | ⚡ Acesso imediato | 💯 Garantia de satisfação
          </p>
        </div>
      </div>
    </section>
  );
}
