import { Check, Zap } from 'lucide-react';

export default function PricingSection() {
  const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:5174/login';
  const plans = [
    {
      name: 'Plano Semanal',
      icon: Zap,
      price: '22,90',
      period: 'por semana',
      description: 'Acesso completo com foco no essencial',
      features: [
        'Correção de respostas',
        'Diagnóstico inicial',
        'Acompanhamento simples',
        'Plano semanal',
      ],
      popular: false,
      cta: 'Entrar',
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Plano único, simples e
            <span className="gradient-text"> direto</span>
          </h2>
          <p className="section-subtitle">
            24 horas de teste grátis. Sem cartão de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200"
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
              <div className="inline-flex p-3 rounded-xl mb-4 bg-gray-100">
                <plan.icon className="h-8 w-8 text-gray-600" />
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
                onClick={() => {
                  window.location.href = loginUrl;
                }}
                className="w-full py-4 rounded-xl font-semibold transition-all duration-300 bg-primary-600 text-white hover:bg-primary-700"
              >
                {plan.cta}
              </button>

              {/* Trial Note */}
              <p className="text-center text-sm text-gray-500 mt-4">
                Comece com 24 horas grátis
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
