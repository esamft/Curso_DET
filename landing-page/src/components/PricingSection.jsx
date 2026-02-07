import { Check, Sparkles, Zap, Crown } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    {
      name: 'Semanal',
      icon: Zap,
      price: '29,90',
      period: '7 dias',
      description: 'Ideal para quem quer testar antes de comprometer',
      features: [
        'Acesso completo à plataforma',
        'Assistente IA 24/7',
        'Correção instantânea',
        'Exercícios ilimitados',
        'Templates de respostas',
        'Acompanhamento de progresso',
        'Suporte via WhatsApp',
      ],
      popular: false,
      cta: 'Começar Agora',
    },
    {
      name: 'Mensal',
      icon: Sparkles,
      price: '99,90',
      period: '30 dias',
      description: 'Melhor custo-benefício para aprovação garantida',
      features: [
        'Tudo do plano Semanal',
        'Plano de estudos personalizado',
        'Simulados completos',
        'Prioridade no suporte',
        'Material extra exclusivo',
        'Grupo VIP de estudos',
        'Análise detalhada de evolução',
        'Dicas e estratégias avançadas',
      ],
      popular: true,
      cta: 'Mais Popular',
      badge: 'Recomendado',
    },
    {
      name: 'Anual',
      icon: Crown,
      price: '997,00',
      period: '365 dias',
      description: 'Melhor preço - Economia de mais de 70%',
      features: [
        'Tudo do plano Mensal',
        'Desconto de 72%',
        'Acesso vitalício a atualizações',
        'Sessões de mentoria ao vivo',
        'Certificado de conclusão',
        'Acesso a novos recursos',
        'Suporte prioritário premium',
        'Garantia de aprovação',
      ],
      popular: false,
      cta: 'Melhor Valor',
      savings: 'Economize R$ 2.590,80',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Planos que Cabem no
            <span className="gradient-text"> Seu Bolso</span>
          </h2>
          <p className="section-subtitle">
            Escolha o plano ideal para você. Todos incluem 3 dias de teste grátis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular
                  ? 'border-4 border-primary-500 transform md:scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                plan.popular
                  ? 'bg-gradient-to-r from-primary-600 to-blue-600'
                  : 'bg-gray-100'
              }`}>
                <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-600 text-xl">R$</span>
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                </div>
                <p className="text-gray-600 mt-1">{plan.period}</p>
                {plan.savings && (
                  <p className="text-green-600 font-semibold text-sm mt-2">{plan.savings}</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </button>

              {/* Trial Note */}
              <p className="text-center text-sm text-gray-500 mt-4">
                Comece com 3 dias grátis
              </p>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">🎯 Garantia de Satisfação</h3>
          <p className="text-gray-700 text-lg">
            Não está satisfeito? Sem problemas! Oferecemos reembolso total em até 7 dias.
            Teste sem riscos e veja os resultados por você mesmo.
          </p>
        </div>
      </div>
    </section>
  );
}
