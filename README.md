# DET Flow 🎓

> Plataforma de Preparação para o Duolingo English Test (DET) com Agentes Autônomos de IA

![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)
![Agno](https://img.shields.io/badge/Agno-AI%20Agents-purple.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento](#desenvolvimento)
- [Deployment](#deployment)
- [Contribuindo](#contribuindo)

## 🎯 Visão Geral

**DET Flow** é uma plataforma inovadora de preparação para o Duolingo English Test que utiliza agentes de IA especializados para fornecer avaliações detalhadas, planos de estudo personalizados e acompanhamento de progresso em tempo real via WhatsApp.

### Principais Diferenciais

- ✅ **Avaliação Automática com IA**: Correção instantânea usando GPT-4 com critérios oficiais do DET
- 📊 **Subscores Reais**: Literacy, Comprehension, Conversation e Production (escala 10-160)
- 📚 **Planos de Estudo Personalizados**: Cronogramas adaptados ao seu nível e meta
- 💬 **Integração WhatsApp**: Pratique e receba feedback direto no WhatsApp
- 🎯 **Acompanhamento de Progresso**: Dashboards e estatísticas detalhadas
- 🧠 **Chain-of-Thought**: Avaliações explicadas passo a passo

## 🏗️ Arquitetura

O sistema é baseado no **framework Agno** (anteriormente Phidata) e segue o padrão Domain-Driven Design (DDD):

```
┌─────────────────┐
│   WhatsApp      │
│  (Evolution API)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       FastAPI + Webhook             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      MAESTRO (Orquestrador)         │
│  - Gerencia fluxo de conversação    │
│  - Delega para agentes especializados│
└────────┬────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌────────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Interface│ │Eval-│ │Peda-│ │Other│
│ Agent  │ │uator│ │gogue│ │Agents│
│        │ │Agent│ │Agent│ │     │
└────────┘ └─────┘ └─────┘ └─────┘
                │
                ▼
        ┌───────────────┐
        │   Supabase    │
        │  (PostgreSQL) │
        └───────────────┘
```

### Agentes Especializados

1. **Interface Agent**: Gerencia conversações no WhatsApp
2. **Evaluator Agent**: Avalia respostas seguindo critérios oficiais do DET
3. **Pedagogue Agent**: Cria planos de estudo personalizados
4. **Maestro**: Orquestra todos os agentes e gerencia o fluxo

## ✨ Funcionalidades

### Para Estudantes

- 📝 Submissão de respostas via WhatsApp ou API
- 🎯 Avaliação instantânea com feedback detalhado
- 📊 Visualização de progresso e estatísticas
- 📚 Planos de estudo semanais personalizados
- 💡 Dicas e sugestões de melhoria
- 🏆 Acompanhamento de metas

### Para Administradores

- 📈 Dashboard de analytics
- 👥 Gerenciamento de usuários
- 📋 Histórico completo de submissões
- ⚙️ Configuração de tarefas e prompts
- 🔧 Monitoramento de sistema

## 🚀 Instalação

### Pré-requisitos

- Python 3.11+
- PostgreSQL (ou conta Supabase)
- Conta OpenAI (API key)
- Instância Evolution API (para WhatsApp)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/det-flow.git
cd det-flow
```

### 2. Crie e Ative o Ambiente Virtual

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Instale as Dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o Banco de Dados

#### Opção A: Supabase (Recomendado)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a connection string
3. Execute o script de migração:

```bash
# Conecte-se ao seu projeto Supabase e execute:
psql -h db.xxxxxx.supabase.co -U postgres -d postgres -f migrations/001_initial_schema.sql
```

#### Opção B: PostgreSQL Local

```bash
# Crie o banco de dados
createdb det_flow

# Execute as migrations
psql det_flow < migrations/001_initial_schema.sql
```

### 5. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas credenciais:

```env
OPENAI_API_KEY=sk-your-openai-key-here
DATABASE_URL=postgresql://user:pass@host:5432/det_flow
EVOLUTION_API_KEY=your-evolution-key
EVOLUTION_API_URL=https://your-instance.com
```

## ⚙️ Configuração

### Configuração Mínima

```env
# Obrigatório
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
EVOLUTION_API_KEY=...
EVOLUTION_API_URL=...
SECRET_KEY=your-secret-key-here
```

### Configuração Completa

Veja `.env.example` para todas as opções disponíveis.

## 💻 Uso

### Iniciar o Servidor

```bash
# Desenvolvimento
python -m uvicorn api.main:app --reload

# Produção
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

Ou usando o script direto:

```bash
python api/main.py
```

### Testando os Agentes

#### Teste do Evaluator Agent

```python
from agents.evaluator import EvaluatorAgent

evaluator = EvaluatorAgent()

result = evaluator.evaluate_submission(
    task_type="write_about_photo",
    task_prompt="Describe what you see in this photo.",
    response_text="In this photo, I can see a beautiful sunset over the ocean. The sky has many colors like orange, pink, and purple. There are some clouds and the water is very calm.",
    user_level="B1"
)

print(result)
```

#### Teste do Pedagogue Agent

```python
from agents.pedagogue import PedagogueAgent

pedagogue = PedagogueAgent()

plan = pedagogue.create_study_plan(
    current_level="B1",
    target_score=120,
    available_hours_per_week=10,
    weaknesses=["Grammar", "Vocabulary"]
)

print(plan)
```

#### Teste do Maestro

```python
from maestro import maestro

response = maestro.process_user_message(
    phone_number="+5511999999999",
    message="Quero praticar writing!"
)

print(response)
```

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

### WhatsApp Webhook

```http
POST /webhook/whatsapp
Content-Type: application/json
X-API-Key: your-evolution-api-key

{
  "phone": "+5511999999999",
  "message": "Olá, quero praticar!",
  "instance": "det_flow_instance"
}
```

### Criar Submissão (API Direta)

```http
POST /api/submissions
Content-Type: application/json

{
  "user_id": 1,
  "task_type": "write_about_photo",
  "task_prompt": "Describe the photo",
  "response_text": "In this photo..."
}
```

### Buscar Usuário

```http
GET /api/users/{phone_number}
```

### Histórico de Submissões

```http
GET /api/users/{user_id}/submissions?limit=10
```

### Detalhes de Submissão

```http
GET /api/submissions/{submission_id}
```

## 📁 Estrutura do Projeto

```
det-flow/
├── agents/                 # Agentes especializados
│   ├── __init__.py
│   ├── evaluator.py       # Agente avaliador DET
│   ├── pedagogue.py       # Agente criador de planos
│   └── interface.py       # Agente de interface WhatsApp
├── api/                   # API FastAPI
│   ├── __init__.py
│   └── main.py           # Endpoints e webhooks
├── core/                  # Núcleo da aplicação
│   ├── __init__.py
│   ├── config.py         # Configurações globais
│   ├── database.py       # Gerenciamento de DB
│   └── models.py         # Modelos SQLAlchemy
├── knowledge_base/        # Base de conhecimento RAG
│   └── __init__.py
├── mcp_tools/            # Ferramentas MCP customizadas
│   └── __init__.py
├── migrations/           # Migrations SQL
│   └── 001_initial_schema.sql
├── tests/                # Testes unitários
│   └── __init__.py
├── maestro.py           # Orquestrador central
├── requirements.txt     # Dependências Python
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo git
└── README.md           # Este arquivo
```

## 🛠️ Desenvolvimento

### Executar Testes

```bash
pytest tests/
```

### Formatação de Código

```bash
# Formatar com Black
black .

# Lint com Ruff
ruff check .
```

### Criar Nova Migration

```bash
# Crie um novo arquivo SQL em migrations/
migrations/002_add_feature_x.sql
```

## 🚢 Deployment

### Docker (Recomendado)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build e run
docker build -t det-flow .
docker run -p 8000:8000 --env-file .env det-flow
```

### Railway/Render/Fly.io

1. Configure as variáveis de ambiente no dashboard
2. Conecte o repositório GitHub
3. Deploy automático em cada push

### Variáveis de Ambiente para Produção

```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=WARNING
SECRET_KEY=<generate-strong-key>
```

## 📊 Métricas DET

### Escala de Pontuação

- **10-55**: A1-A2 (Beginner)
- **60-85**: B1 (Intermediate)
- **90-115**: B2 (Upper Intermediate)
- **120-140**: C1 (Advanced)
- **145-160**: C2 (Proficient)

### Subscores

1. **Literacy**: Habilidades de leitura e escrita
2. **Comprehension**: Compreensão de prompts e contextos
3. **Conversation**: Fluência e naturalidade
4. **Production**: Capacidade de gerar respostas complexas

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento Inicial* - [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Agno Framework](https://github.com/agno-agi/agno) - Framework de agentes de IA
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web moderno
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - Modelos de linguagem

## 📞 Suporte

Para dúvidas e suporte:

- 📧 Email: suporte@detflow.com
- 💬 Discord: [DET Flow Community](https://discord.gg/detflow)
- 📖 Docs: [docs.detflow.com](https://docs.detflow.com)

---

**DET Flow** - Preparação inteligente para o Duolingo English Test 🎓✨
