import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Estudante de Intercâmbio',
      score: '145/160',
      improvement: '+35 pontos',
      image: '👩‍🎓',
      text: 'Incrível! Em apenas 3 semanas minha pontuação foi de 110 para 145. O assistente IA me ajudou a identificar exatamente onde eu estava errando. Consegui minha vaga no mestrado na Austrália!',
      rating: 5,
    },
    {
      name: 'João Pedro',
      role: 'Profissional de TI',
      score: '132/160',
      improvement: '+28 pontos',
      image: '👨‍💻',
      text: 'Estudei no meu ritmo, nos intervalos do trabalho. Os templates de resposta foram um divisor de águas. Consegui a pontuação que precisava para aplicar para empresas internacionais!',
      rating: 5,
    },
    {
      name: 'Ana Carolina',
      role: 'Graduanda',
      score: '138/160',
      improvement: '+32 pontos',
      image: '👩‍🎨',
      text: 'A correção instantânea me fez economizar tempo e dinheiro com professores particulares. O plano de estudos personalizado foi perfeito para conciliar com a faculdade. Super recomendo!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            O Que Nossos Alunos
            <span className="gradient-text"> Estão Dizendo</span>
          </h2>
          <p className="section-subtitle">
            Resultados reais de pessoas reais que alcançaram seus objetivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-100" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              {/* Score Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pontuação Final</p>
                  <p className="text-2xl font-bold text-primary-600">{testimonial.score}</p>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <p className="text-sm font-semibold text-green-700">{testimonial.improvement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">1.200+</div>
            <p className="text-gray-600">Alunos Aprovados</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">4.9/5</div>
            <p className="text-gray-600">Avaliação Média</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">+30pts</div>
            <p className="text-gray-600">Melhoria Média</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
            <p className="text-gray-600">Taxa de Sucesso</p>
          </div>
        </div>
      </div>
    </section>
  );
}
