# DET Descomplicado - Plataforma de Estudos

Plataforma completa para alunos praticarem e se prepararem para o Duolingo English Test (DET) com inteligência artificial.

## 🎯 Funcionalidades

### Autenticação
- ✅ Registro de novos alunos
- ✅ Login com email e senha
- ✅ 3 dias de teste grátis para novos usuários
- ✅ JWT authentication
- ✅ Alteração de senha
- ✅ Gerenciamento de perfil

### Dashboard Principal
- 📊 Estatísticas de progresso (pontuação atual, exercícios completados, sequência de dias)
- 📈 Gráfico de evolução (últimos 30 dias)
- 📉 Gráfico de desempenho por habilidade (subscores)
- 📝 Submissões recentes
- 🎯 Indicadores visuais de progresso

### Área de Prática
- 📚 6 tipos de exercícios DET:
  - **Read & Complete** - Complete as lacunas
  - **Read & Select** - Selecione palavras reais
  - **Listen & Type** - Ouça e escreva
  - **Speak About Photo** - Descreva fotos
  - **Write About Topic** - Escreva sobre tópicos
  - **Write Sample** - Escreva respostas
- 🤖 Avaliação instantânea por IA
- 📊 Feedback detalhado com subscores
- 💡 Pontos fortes e áreas de melhoria
- 🔄 Geração ilimitada de novos exercícios

### Plano de Estudos
- 📅 Cronograma semanal personalizado
- 🎯 Baseado em nível atual, meta de pontuação e disponibilidade
- ✅ Acompanhamento de progresso diário
- 📊 Indicador de conclusão semanal
- 🔄 Geração de novos planos quando necessário

### Histórico de Submissões
- 📝 Lista completa de todas as submissões
- 🔍 Filtros por tipo de exercício e pontuação
- 📊 Estatísticas gerais (média, melhor pontuação, total)
- 🔎 Visualização detalhada de cada avaliação
- 📈 Feedback completo preservado

### Perfil e Configurações
- 👤 Gerenciamento de informações pessoais
- 🔒 Alteração de senha
- 💳 Gerenciamento de assinatura
- 📅 Visualização de status (ativo, trial, expirado)
- 💰 Escolha de planos (Semanal, Mensal, Anual)
- 🔄 Renovação e cancelamento

## 🚀 Tecnologias

- **React 18** - Biblioteca UI com hooks
- **Vite** - Build tool moderno e rápido
- **React Router v6** - Navegação SPA
- **Tailwind CSS** - Framework CSS utility-first
- **Zustand** - Gerenciamento de estado leve
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **date-fns** - Formatação de datas

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Backend DET Descomplicado rodando (porta 8000)

## 🔧 Instalação

```bash
# Clone o repositório (se ainda não tiver)
git clone <repo-url>
cd Curso_DET/student-dashboard

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com a URL do backend se necessário
```

## 🏃 Executar Localmente

```bash
# Modo desenvolvimento (porta 5174)
npm run dev
```

Acesse: `http://localhost:5174`

**Importante**: Certifique-se de que o backend está rodando em `http://localhost:8000`

## 🏗️ Build para Produção

```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

Os arquivos otimizados serão gerados em `dist/`

## 📁 Estrutura do Projeto

```
student-dashboard/
├── public/                    # Arquivos públicos estáticos
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── Layout.jsx        # Layout principal com sidebar
│   │   └── ProtectedRoute.jsx # Proteção de rotas autenticadas
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.jsx        # Login de usuário
│   │   ├── Register.jsx     # Registro de novo usuário
│   │   ├── Dashboard.jsx    # Dashboard principal
│   │   ├── Practice.jsx     # Área de prática
│   │   ├── StudyPlan.jsx    # Plano de estudos
│   │   ├── History.jsx      # Histórico de submissões
│   │   └── Profile.jsx      # Perfil e configurações
│   ├── services/
│   │   └── api.js           # Cliente API com axios
│   ├── store/
│   │   └── authStore.js     # Store de autenticação (Zustand)
│   ├── App.jsx              # Componente raiz com rotas
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais e Tailwind
├── index.html               # HTML base
├── vite.config.js           # Configuração Vite
├── tailwind.config.js       # Configuração Tailwind
└── package.json             # Dependências
```

## 🔗 Rotas da Aplicação

### Públicas
- `/login` - Login de usuário
- `/register` - Registro de novo usuário

### Protegidas (requer autenticação)
- `/dashboard` - Dashboard principal
- `/practice` - Área de prática com exercícios
- `/study-plan` - Plano de estudos personalizado
- `/history` - Histórico de submissões
- `/profile` - Perfil e configurações

## 🎨 Componentes Principais

### Layout
Componente wrapper que fornece:
- Sidebar com navegação
- Header com notificações e CTA
- Informações do usuário
- Status da assinatura
- Menu mobile responsivo

### ProtectedRoute
HOC que protege rotas autenticadas:
- Verifica se usuário está logado
- Redireciona para `/login` se não autenticado
- Exibe loading durante verificação

### Pages
Cada página é autocontida com:
- Estado local quando necessário
- Chamadas à API via services
- UI otimizada para a função específica
- Responsividade mobile-first

## 🔐 Autenticação

A autenticação usa:
- JWT tokens armazenados em `localStorage`
- Interceptors do Axios para adicionar token automaticamente
- Refresh automático do token quando expira
- Logout automático em caso de 401

### Fluxo de Autenticação

1. Usuário faz login/registro
2. Backend retorna JWT + dados do usuário
3. Token e usuário salvos em `localStorage`
4. Zustand store atualizado
5. Todas as requisições incluem `Authorization: Bearer <token>`
6. Em caso de 401, usuário é deslogado automaticamente

## 📊 Integração com Backend

A aplicação consome as seguintes APIs:

### Auth API (`/api/auth`)
- `POST /register` - Registro de usuário
- `POST /login` - Login
- `GET /me` - Dados do usuário atual
- `PUT /profile` - Atualizar perfil
- `POST /change-password` - Alterar senha

### Dashboard API (`/api/dashboard`)
- `GET /stats` - Estatísticas gerais
- `GET /recent-submissions` - Submissões recentes
- `GET /progress` - Dados de progresso

### Practice API (`/api/practice`)
- `GET /task-types` - Tipos de exercícios disponíveis
- `GET /task` - Obter novo exercício
- `POST /submit` - Submeter resposta para avaliação

### Study Plan API (`/api/study-plans`)
- `GET /current` - Plano atual
- `POST /generate` - Gerar novo plano
- `PATCH /{id}/progress` - Atualizar progresso

### Submissions API (`/api/submissions`)
- `GET /` - Lista paginada de submissões
- `GET /{id}` - Detalhes de submissão
- `GET /stats` - Estatísticas de submissões

### Subscription API (`/api/subscription`)
- `GET /current` - Assinatura atual
- `GET /history` - Histórico de assinaturas
- `POST /cancel` - Cancelar assinatura

### Payment API (`/api/payments`)
- `POST /create` - Criar novo pagamento
- `GET /{id}/status` - Status do pagamento

## 🎨 Customização

### Cores
Edite `tailwind.config.js` para alterar a paleta de cores:

```javascript
colors: {
  primary: { /* azul */ },
  success: { /* verde */ },
  warning: { /* amarelo */ },
  danger: { /* vermelho */ },
}
```

### Componentes
Classes CSS reutilizáveis em `src/index.css`:
- `.btn-primary` - Botão primário
- `.btn-secondary` - Botão secundário
- `.card` - Card padrão
- `.input-field` - Campo de input
- `.badge-*` - Badges coloridos

## 🔒 Segurança

- Senhas nunca armazenadas (apenas tokens)
- HTTPS obrigatório em produção
- Tokens expiram após 7 dias
- Validação de input no frontend e backend
- CORS configurado corretamente
- SQL injection prevenido (prepared statements)
- XSS prevenido (React escapa automaticamente)

## 🚀 Deploy

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

# Deploy: arraste dist/ para netlify.com/drop
```

### Outras Plataformas
- AWS S3 + CloudFront
- Firebase Hosting
- Railway
- Render
- GitHub Pages (requer configuração adicional)

### Variáveis de Ambiente em Produção

Configure `VITE_API_URL` para apontar para seu backend em produção:

```
VITE_API_URL=https://api.detdescomplicado.com.br
```

## 📱 Responsividade

A aplicação é totalmente responsiva:
- **Mobile First** - Design otimizado para mobile
- **Breakpoints Tailwind**:
  - `sm:` 640px+
  - `md:` 768px+
  - `lg:` 1024px+
  - `xl:` 1280px+

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o backend permite origem do frontend
- Configure `CORS_ORIGINS` no backend

### Token expirado
- Tokens expiram após 7 dias
- Faça login novamente
- Implemente refresh token se necessário

### API não responde
- Verifique se backend está rodando
- Confirme URL correta em `.env`
- Verifique logs do backend

### Build falha
- Limpe cache: `rm -rf node_modules dist`
- Reinstale: `npm install`
- Tente novamente: `npm run build`

## 📄 Licença

Propriedade de DET Descomplicado. Todos os direitos reservados.

## 👥 Suporte

Para dúvidas ou suporte:
- Email: contato@detdescomplicado.com.br
- WhatsApp: +55 11 99999-9999

---

Desenvolvido com ❤️ para ajudar alunos a conquistarem seus sonhos no DET
