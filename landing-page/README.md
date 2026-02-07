# DET Descomplicado - Landing Page

Landing page de vendas para a plataforma DET Descomplicado - preparação para o Duolingo English Test com inteligência artificial.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI moderna
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Ícones modernos
- **React Intersection Observer** - Animações on scroll

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# ou
yarn install
```

## 🏃 Executar Localmente

```bash
# Modo desenvolvimento
npm run dev

# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Build para Produção

```bash
# Gerar build otimizado
npm run build

# ou
yarn build
```

Os arquivos otimizados serão gerados na pasta `dist/`

## 👀 Preview do Build

```bash
# Visualizar build de produção localmente
npm run preview

# ou
yarn preview
```

## 📁 Estrutura do Projeto

```
landing-page/
├── public/
│   └── favicon.svg          # Favicon da aplicação
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Navegação principal
│   │   ├── HeroSection.jsx  # Seção hero com CTA
│   │   ├── FeaturesSection.jsx  # Funcionalidades
│   │   ├── HowItWorksSection.jsx  # Como funciona
│   │   ├── PricingSection.jsx     # Planos e preços
│   │   ├── TestimonialsSection.jsx  # Depoimentos
│   │   ├── FAQSection.jsx   # Perguntas frequentes
│   │   ├── CTASection.jsx   # Call-to-action final
│   │   └── Footer.jsx       # Rodapé
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais e Tailwind
├── index.html               # HTML base
├── package.json             # Dependências
├── vite.config.js           # Configuração Vite
├── tailwind.config.js       # Configuração Tailwind
└── postcss.config.js        # Configuração PostCSS
```

## 🎨 Componentes

### Header
- Navegação fixa com scroll suave
- Menu mobile responsivo
- Logo e CTA button

### HeroSection
- Headline principal com proposta de valor
- CTA primário "Começar Teste Grátis"
- Social proof (estatísticas)

### FeaturesSection
- Grid de 10 funcionalidades principais
- Ícones ilustrativos
- Descrições concisas

### HowItWorksSection
- Processo em 4 passos
- Visual step-by-step
- Fácil compreensão

### PricingSection
- 3 planos (Semanal, Mensal, Anual)
- Destaque para plano mais popular
- Features por plano
- CTAs de conversão

### TestimonialsSection
- 3 depoimentos de alunos reais
- Pontuações antes/depois
- Ratings com estrelas
- Estatísticas de sucesso

### FAQSection
- Accordion com 10 perguntas frequentes
- Responde principais objeções
- CTA para suporte

### CTASection
- Última chamada para conversão
- Benefícios principais
- Trust signals
- CTA duplo (forte + alternativo)

### Footer
- Links de navegação
- Informações de contato
- Redes sociais
- Links legais

## 🎯 Conversão

A landing page foi otimizada para conversão com:
- Múltiplos CTAs ao longo da página
- Social proof e estatísticas reais
- Depoimentos com resultados concretos
- FAQ para eliminar objeções
- Design moderno e profissional
- Mobile-first e totalmente responsivo

## 🌐 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Arraste a pasta dist/ para netlify.com/drop
```

### Outras Plataformas

O build gera arquivos estáticos na pasta `dist/` que podem ser hospedados em qualquer servidor web:
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Railway
- Render

## 🔗 Integrações Futuras

Para conectar a landing page com o backend:

1. **Formulário de Cadastro**: Adicionar formulário que chama `/api/auth/register`
2. **Checkout**: Integrar botões de CTA com `/api/payments/create`
3. **WhatsApp**: Link direto para número de atendimento
4. **Dashboard**: Redirecionar após cadastro para painel do aluno

## 📝 Customização

### Cores
Edite `tailwind.config.js` para customizar a paleta:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    // ...
    600: '#2563eb',
  }
}
```

### Textos
Todos os textos estão nos próprios componentes e podem ser facilmente editados.

### Imagens
Substitua os emojis por imagens reais nos depoimentos e adicione screenshots da plataforma.

## 📧 Contato

Para dúvidas ou sugestões sobre a landing page, entre em contato através dos canais oficiais do DET Descomplicado.

---

Desenvolvido com ❤️ para ajudar alunos a conquistarem seus sonhos no DET
