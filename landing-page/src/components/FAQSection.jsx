import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Como funciona o teste grátis de 3 dias?',
      answer: 'Ao se cadastrar, você tem acesso completo à plataforma por 3 dias sem precisar informar cartão de crédito. Pode cancelar a qualquer momento antes do término do período de teste e não será cobrado nada.',
    },
    {
      question: 'A IA realmente corrige como um examinador oficial do DET?',
      answer: 'Sim! Nossa IA foi treinada com milhares de avaliações reais do DET e segue exatamente os mesmos critérios oficiais: gramática, vocabulário, relevância e coerência. Os subscores (Literacy, Comprehension, Conversation e Production) são calculados na escala oficial de 10-160.',
    },
    {
      question: 'Posso usar no WhatsApp?',
      answer: 'Sim! Após o cadastro, você recebe acesso ao nosso assistente via WhatsApp. Pode enviar suas respostas, tirar dúvidas e receber feedback instantâneo direto no app que você já usa todos os dias.',
    },
    {
      question: 'Quanto tempo leva para ver resultados?',
      answer: 'Nossos alunos costumam ver melhoria significativa em 2-3 semanas de prática consistente. A melhoria média é de +30 pontos na pontuação final. Com dedicação, você pode alcançar sua meta ainda mais rápido!',
    },
    {
      question: 'O que acontece se eu não passar no DET?',
      answer: 'Oferecemos garantia de satisfação! Se você não ficar satisfeito com a plataforma nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Além disso, nossos alunos têm 95% de taxa de aprovação.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, pode cancelar quando quiser sem burocracia. Não há fidelidade ou multa. Seu acesso permanece ativo até o final do período que você já pagou.',
    },
    {
      question: 'Quantos exercícios posso fazer por dia?',
      answer: 'Ilimitados! Você pode praticar quantas vezes quiser. Não há limite de submissões, correções ou acesso ao assistente IA. Estude no seu ritmo.',
    },
    {
      question: 'Preciso ter conhecimento técnico para usar?',
      answer: 'Não! A plataforma é super intuitiva e fácil de usar. Se você sabe usar WhatsApp e email, já sabe usar o DET Descomplicado. Além disso, temos suporte disponível para te ajudar.',
    },
    {
      question: 'Qual a diferença entre os planos?',
      answer: 'Todos os planos incluem acesso completo à plataforma. A diferença está na duração: Semanal (7 dias) é ideal para testes rápidos, Mensal (30 dias) é o mais popular para preparação completa, e Anual oferece o melhor custo-benefício com economia de 72%.',
    },
    {
      question: 'Tem material em português?',
      answer: 'Sim! Toda a interface, instruções e feedback estão em português brasileiro. Isso facilita muito o entendimento e acelera seu aprendizado.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">
            Perguntas
            <span className="gradient-text"> Frequentes</span>
          </h2>
          <p className="section-subtitle">
            Tire suas dúvidas sobre o DET Descomplicado
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-primary-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
          <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Fale com nosso suporte →
          </button>
        </div>
      </div>
    </section>
  );
}
