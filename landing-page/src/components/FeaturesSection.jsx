import {
  Bot,
  Target,
  BookOpen,
  FileText,
  TrendingUp,
  Zap,
  Brain,
  MessageSquare,
  Award,
  Clock
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: 'Assistente Pessoal de IA',
      description: 'Seu professor particular disponível 24/7 via WhatsApp. Tire dúvidas, peça explicações e receba orientações personalizadas a qualquer momento.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Target,
      title: 'Avaliação de Nível Automática',
      description: 'Descubra seu nível atual de inglês (A1-C2) instantaneamente e receba um diagnóstico preciso das suas fortalezas e pontos de melhoria.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Exercícios Direcionados',
      description: 'Pratique exatamente o que você precisa. Nossa IA identifica suas dificuldades e gera exercícios personalizados para você dominar o DET.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FileText,
      title: 'Templates de Respostas',
      description: 'Acesse centenas de templates prontos para todas as questões do DET. Aprenda estruturas que realmente funcionam e aumentam sua nota.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Acompanhamento de Evolução',
      description: 'Visualize seu progresso em tempo real com gráficos detalhados. Veja sua melhoria em cada subscore: Literacy, Comprehension, Conversation e Production.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Zap,
      title: 'Correção Instantânea',
      description: 'Receba feedback detalhado em segundos. Nossa IA avalia gramática, vocabulário, relevância e coerência como um examinador oficial do DET.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Brain,
      title: 'Planos de Estudo Personalizados',
      description: 'Cronograma semanal adaptado ao seu nível, meta de pontuação e tempo disponível. Estude de forma inteligente e eficiente.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: MessageSquare,
      title: 'Prática de Conversação',
      description: 'Pratique speaking e listening com feedback instantâneo. Melhore sua fluência e pronúncia com exercícios interativos.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: Award,
      title: 'Simulados Realistas',
      description: 'Faça simulados completos que replicam as condições reais do DET. Treine sob pressão e chegue preparado no dia da prova.',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Clock,
      title: 'Estude no Seu Ritmo',
      description: 'Acesso ilimitado 24/7. Estude quando e onde quiser, no seu próprio tempo. Concilie preparação com trabalho e estudos.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Tudo que Você Precisa para
            <span className="gradient-text"> Dominar o DET</span>
          </h2>
          <p className="section-subtitle">
            Plataforma completa com tecnologia de ponta para maximizar seus resultados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Extra Benefits */}
        <div className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">E Ainda Mais...</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">1000+</div>
              <p className="text-gray-700">Exercícios Disponíveis</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">100%</div>
              <p className="text-gray-700">Atualizado com DET</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">∞</div>
              <p className="text-gray-700">Submissões Ilimitadas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
