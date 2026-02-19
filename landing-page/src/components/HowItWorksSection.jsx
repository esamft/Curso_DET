import { UserPlus, Target, BookOpen, TrendingUp } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Cadastre-se Grátis',
      description: 'Crie sua conta em menos de 1 minuto. Sem cartão de crédito, sem compromisso. Comece seu teste grátis de 24 horas agora mesmo.',
    },
    {
      number: '02',
      icon: Target,
      title: 'Faça Sua Avaliação',
      description: 'Responda algumas questões iniciais para descobrir seu nível atual. Nossa IA analisa suas respostas e cria um perfil personalizado.',
    },
    {
      number: '03',
      icon: BookOpen,
      title: 'Siga Seu Plano',
      description: 'Receba um cronograma de estudos adaptado aos seus objetivos e tempo disponível. Pratique com exercícios e receba correção instantânea.',
    },
    {
      number: '04',
      icon: TrendingUp,
      title: 'Alcance Sua Meta',
      description: 'Acompanhe sua evolução com dashboards detalhados. Veja sua pontuação subir e conquiste a nota que você precisa no DET!',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Como Funciona o
            <span className="gradient-text"> DET Descomplicado</span>
          </h2>
          <p className="section-subtitle">
            4 passos simples para transformar sua preparação e alcançar seus objetivos
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-6 md:gap-8 mb-12 last:mb-0 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Number + Icon */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="text-8xl md:text-9xl font-bold text-primary-100 absolute -top-4 -left-2 md:-left-4 z-0">
                    {step.number}
                  </div>
                  <div className="relative z-10 bg-gradient-to-r from-primary-600 to-blue-600 p-6 rounded-2xl shadow-lg inline-flex">
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
              </div>

              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-16 w-1 bg-primary-200 -mb-16"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
          >
            Começar Minha Jornada Agora
          </button>
        </div>
      </div>
    </section>
  );
}
