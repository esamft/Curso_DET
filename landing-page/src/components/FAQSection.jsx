import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Como funciona o teste grátis de 24 horas?',
      answer: 'Ao se cadastrar, você tem acesso completo à plataforma por 24 horas sem precisar informar cartão de crédito. Pode cancelar a qualquer momento antes do término do período de teste e não será cobrado nada.',
    },
    {
      question: 'Preciso de cartão de crédito?',
      answer: 'Não. O teste grátis é liberado sem cartão de crédito.',
    },
    {
      question: 'O que inclui o plano semanal?',
      answer: 'Correção de respostas, diagnóstico inicial, acompanhamento simples e um plano semanal para organizar seus estudos.',
    },
    {
      question: 'Como o feedback é gerado?',
      answer: 'O feedback é automático e segue critérios objetivos para ajudar você a ajustar suas respostas.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, pode cancelar quando quiser. Seu acesso permanece ativo até o final do período que você já pagou.',
    },
    {
      question: 'Tem material em português?',
      answer: 'Sim. A interface e as instruções estão em português brasileiro.',
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
