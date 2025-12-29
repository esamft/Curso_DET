import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mic, BookOpen, PenTool, CheckSquare, BarChart3, Home } from 'lucide-react';

interface PracticeCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  duration: string;
}

export function Menu() {
  const navigate = useNavigate();

  const practices: PracticeCard[] = [
    {
      id: 'speaking',
      title: 'Interactive Speaking',
      description: 'Pratique suas habilidades de conversação com Bea, respondendo perguntas em inglês.',
      icon: <Mic className="w-8 h-8" />,
      color: 'from-purple to-purple-dark',
      path: '/practice/speaking',
      duration: '5 min',
    },
    {
      id: 'read-select',
      title: 'Read & Select',
      description: 'Identifique palavras reais em inglês entre palavras inventadas.',
      icon: <CheckSquare className="w-8 h-8" />,
      color: 'from-secondary to-secondary-dark',
      path: '/practice/read-select',
      duration: '2 min',
    },
    {
      id: 'writing',
      title: 'Interactive Writing',
      description: 'Escreva respostas estruturadas para perguntas dissertativas.',
      icon: <PenTool className="w-8 h-8" />,
      color: 'from-success to-success-dark',
      path: '/practice/writing',
      duration: '5 min',
    },
    {
      id: 'read-complete',
      title: 'Read & Complete',
      description: 'Complete textos com as palavras corretas faltantes.',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-primary to-primary-dark',
      path: '/practice/read-complete',
      duration: '3 min',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Simulador DET
              </h1>
              <p className="text-lg text-gray-600">
                Escolha uma prática para começar seu treinamento
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                icon={<Home className="w-5 h-5" />}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<BarChart3 className="w-5 h-5" />}
                onClick={() => navigate('/results?score=0')}
              >
                Ver Resultados
              </Button>
            </div>
          </div>
        </div>

        {/* Practice Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {practices.map((practice, index) => (
            <Card
              key={practice.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(practice.path)}
            >
              <div className="flex flex-col h-full">
                {/* Icon Header */}
                <div
                  className={`bg-gradient-to-br ${practice.color} text-white p-6 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  {practice.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {practice.title}
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {practice.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {practice.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-gray-800 group-hover:text-white group-hover:border-gray-800"
                  >
                    Começar Prática →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Full Test CTA */}
        <Card className="bg-gradient-to-r from-purple to-purple-dark text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                Simulado Completo
              </h2>
              <p className="text-lg opacity-90">
                Teste todas as suas habilidades em um simulado completo de 42 minutos,
                incluindo todas as seções do DET.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-purple-600 border-white hover:bg-gray-50"
              onClick={() => navigate('/practice/speaking')}
            >
              Iniciar Simulado Completo
            </Button>
          </div>
        </Card>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24</div>
              <div className="text-sm text-gray-600">Horas Praticadas</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">12</div>
              <div className="text-sm text-gray-600">Simulados Completos</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">125</div>
              <div className="text-sm text-gray-600">Pontuação Média</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
