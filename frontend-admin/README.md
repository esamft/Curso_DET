# DET Flow - Dashboard Admin

Dashboard administrativo para gerenciar o DET Flow.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` se necessário (padrão: http://127.0.0.1:8000)

### 3. Iniciar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://127.0.0.1:3000

### 4. Login

Use a chave de administrador configurada no backend (variável `ADMIN_API_KEY`).

Por padrão, a chave é configurada no arquivo `.env` do backend.

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

## ⚙️ Tecnologias

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **Axios** - HTTP client
- **Zustand** - State management
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📊 Funcionalidades

### Dashboard
- Estatísticas em tempo real
- Total de usuários e assinantes ativos
- MRR (Monthly Recurring Revenue)
- Submissões do dia
- Gráficos de distribuição de usuários

### Gerenciamento de Usuários
- Listar todos os usuários com paginação
- Buscar por nome, email ou telefone
- Filtrar por status de assinatura
- Ver detalhes completos do usuário
- **Conceder acesso manual** (qualquer duração)
- Ativar/desativar contas
- Ver histórico de submissões

### Recursos
- Interface responsiva (mobile-friendly)
- Atualização automática de dados
- Modais para ações detalhadas
- Feedback visual com badges e cores
- Proteção de rotas com autenticação

## 🎨 Estrutura

```
frontend-admin/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.jsx    # Dashboard principal
│   │   ├── UserList.jsx     # Lista de usuários
│   │   ├── UserDetailsModal.jsx  # Detalhes do usuário
│   │   ├── GrantAccessModal.jsx  # Conceder acesso
│   │   ├── Login.jsx        # Tela de login
│   │   └── Layout.jsx       # Layout com sidebar
│   ├── services/
│   │   └── api.js           # Cliente API
│   ├── store/
│   │   └── authStore.js     # State management
│   ├── App.jsx              # App principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── index.html
├── package.json
└── vite.config.js
```

## 🔐 Autenticação

O dashboard usa a chave de API do administrador para autenticação.

A chave é armazenada em localStorage e incluída em todas as requisições para `/api/admin/*`.

## 🌐 Deploy

### Vercel / Netlify

1. Conecte o repositório
2. Configure a variável `VITE_API_URL` apontando para seu backend em produção
3. Deploy automático

### Servir Estático

```bash
npm run build
npm run preview
```

Ou use qualquer servidor estático (nginx, Apache, etc.) apontando para `dist/`.

## 📝 Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Lint do código

---

**Dashboard Admin do DET Flow** - Gerencie sua plataforma com facilidade! 🎯
