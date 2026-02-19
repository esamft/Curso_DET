# DET Flow - Guia Rápido de Início 🚀

## ✅ O que foi criado

O projeto **DET Flow** foi completamente implementado com a seguinte estrutura:

```
det-flow/
├── agents/                    # 🤖 Agentes de IA especializados
│   ├── evaluator.py          # Avaliador DET (10-160 scale)
│   ├── pedagogue.py          # Criador de planos de estudo
│   └── interface.py          # Interface WhatsApp
│
├── api/                       # 🌐 API FastAPI
│   └── main.py               # Endpoints e webhooks
│
├── core/                      # ⚙️ Núcleo do sistema
│   ├── config.py             # Configurações globais
│   ├── database.py           # Gerenciamento de DB
│   └── models.py             # Modelos SQLAlchemy
│
├── knowledge_base/            # 📚 Base de conhecimento
│   └── det_task_types.py     # Tipos de tarefas DET
│
├── migrations/                # 🗄️ Database migrations
│   └── 001_initial_schema.sql
│
├── tests/                     # 🧪 Testes
│   └── test_agents.py
│
├── maestro.py                 # 🎭 Orquestrador central
├── run.py                     # 🏃 Script de inicialização
├── setup.sh                   # 📦 Script de instalação
├── requirements.txt           # 📋 Dependências
├── .env.example              # 🔐 Template de variáveis
└── README.md                  # 📖 Documentação completa
```

## 🎯 Primeiros Passos

### 1. Instalar Dependências

```bash
# Opção A: Automático
chmod +x setup.sh
./setup.sh

# Opção B: Manual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

**Edite o arquivo `.env` e preencha:**

```env
# Obrigatório
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://user:pass@host:5432/det_flow
EVOLUTION_API_KEY=your-evolution-key
EVOLUTION_API_URL=https://your-instance.com
SECRET_KEY=generate-a-strong-key
```

### 3. Configurar o Banco de Dados

#### Opção A: Supabase (Recomendado)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá para SQL Editor
3. Cole e execute: `migrations/001_initial_schema.sql`
4. Copie a connection string para `.env`

#### Opção B: PostgreSQL Local

```bash
createdb det_flow
psql det_flow < migrations/001_initial_schema.sql
```

### 4. Iniciar o Servidor

```bash
# Método 1: Script dedicado
python run.py

# Método 2: Uvicorn direto
uvicorn api.main:app --reload

# Método 3: Python module
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### 5. Testar a API

```bash
# Health check
curl http://127.0.0.1:8000/health

# Ou abra no navegador
http://127.0.0.1:8000
```

## 🧪 Testando os Agentes

### Teste Rápido do Evaluator

```python
from agents.evaluator import EvaluatorAgent

evaluator = EvaluatorAgent()

resultado = evaluator.evaluate_submission(
    task_type="write_about_photo",
    task_prompt="Describe what you see in this photo.",
    response_text="In this photo, I can see a beautiful sunset over the ocean.",
    user_level="B1"
)

print(f"Score: {resultado['overall_score']}/160")
print(f"Feedback: {resultado['feedback']}")
```

### Teste Rápido do Pedagogue

```python
from agents.pedagogue import PedagogueAgent

pedagogue = PedagogueAgent()

plano = pedagogue.create_study_plan(
    current_level="B1",
    target_score=120,
    available_hours_per_week=10
)

print(f"Plano: {plano['plan_title']}")
print(f"Duração: {plano['duration_weeks']} semanas")
```

### Teste Completo via Maestro

```python
from maestro import maestro

resposta = maestro.process_user_message(
    phone_number="+5511999999999",
    message="Olá! Quero praticar para o DET!"
)

print(resposta['response'])
```

## 📡 Configurar WhatsApp (Evolution API)

### 1. Obter Evolution API

- Opção 1: Usar serviço hospedado
- Opção 2: Self-hosted com Docker

```bash
docker run -d \
  -p 8080:8080 \
  --name evolution-api \
  atendai/evolution-api
```

### 2. Configurar Webhook

No painel da Evolution API:

```
Webhook URL: https://seu-dominio.com/webhook/whatsapp
```

### 3. Testar Integração

Envie uma mensagem de teste via WhatsApp ou API:

```bash
curl -X POST http://127.0.0.1:8000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-evolution-key" \
  -d '{
    "phone": "+5511999999999",
    "message": "Olá!"
  }'
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

1. **users** - Informações dos estudantes
2. **submissions** - Respostas e avaliações
3. **user_sessions** - Sessões de conversação
4. **study_plans** - Planos de estudo personalizados

### Consultas Úteis

```sql
-- Ver todos os usuários
SELECT * FROM users;

-- Ver submissões recentes
SELECT * FROM submissions ORDER BY created_at DESC LIMIT 10;

-- Ver progresso de um usuário
SELECT * FROM user_progress_summary WHERE user_id = 1;

-- Estatísticas de um usuário
SELECT * FROM get_user_stats(1);
```

## 🎨 Arquitetura dos Agentes

### Fluxo de Processamento

```
WhatsApp Message → Interface Agent → Maestro
                                       ↓
                          ┌────────────┴────────────┐
                          ↓                         ↓
                    Evaluator Agent         Pedagogue Agent
                          ↓                         ↓
                    Avalia resposta          Cria plano
                          ↓                         ↓
                    Salva no DB              Salva no DB
                          ↓                         ↓
                    ←─────┴─────────────────────────┘
                          ↓
                   Interface Agent (formata)
                          ↓
                   Responde no WhatsApp
```

## 📊 Sistema de Pontuação DET

### Escala: 10-160 pontos

- **10-55**: A1-A2 (Beginner)
- **60-85**: B1 (Intermediate)
- **90-115**: B2 (Upper Intermediate)
- **120-140**: C1 (Advanced)
- **145-160**: C2 (Proficient)

### Subscores (cada 10-160)

1. **Literacy** - Leitura e escrita
2. **Comprehension** - Compreensão
3. **Conversation** - Conversação natural
4. **Production** - Produção de conteúdo

## 🐛 Troubleshooting

### Erro: "No module named 'agno'"

```bash
pip install agno
# ou
pip install phidata  # Fallback
```

### Erro: Database connection failed

```bash
# Verifique sua DATABASE_URL
echo $DATABASE_URL

# Teste conexão
psql $DATABASE_URL -c "SELECT 1;"
```

### Erro: OpenAI API key invalid

```bash
# Verifique sua chave
echo $OPENAI_API_KEY

# Teste com curl
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📚 Próximos Passos

1. ✅ Implementar mais tipos de tarefas DET
2. ✅ Adicionar processamento de áudio
3. ✅ Criar dashboard web
4. ✅ Implementar sistema de notificações
5. ✅ Adicionar analytics avançados
6. ✅ Deploy em produção

## 🆘 Suporte

- 📖 **Documentação completa**: Ver `README.md`
- 🐛 **Reportar bugs**: GitHub Issues
- 💬 **Dúvidas**: Discord/Email

---

**Pronto para começar!** 🚀

Execute `python run.py` e comece a testar o DET Flow!
