import { FileText, Target, TrendingUp, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'Correção de respostas',
      description: 'Receba feedback automático para ajustar sua escrita e fala.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Target,
      title: 'Diagnóstico inicial',
      description: 'Entenda seus pontos fortes e o que precisa melhorar.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento simples',
      description: 'Veja sua evolução semana a semana de forma direta.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FileText,
      title: 'Plano semanal',
      description: 'Organize seus estudos com um plano claro e simples.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Essencial para estudar com
            <span className="gradient-text"> clareza</span>
          </h2>
          <p className="section-subtitle">
            Sem promessas exageradas. Foque no que realmente ajuda no dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
