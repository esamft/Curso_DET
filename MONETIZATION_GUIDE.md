# DET Flow - Guia de Monetização 💰

Sistema completo de autenticação, assinaturas semanais e pagamentos via PIX/Cartão.

---

## 🎯 Visão Geral

O DET Flow agora possui um sistema completo de monetização que permite:

✅ **Registro e Login** com JWT
✅ **Assinaturas Semanais, Mensais e Anuais**
✅ **Pagamento via PIX e Cartão** (Mercado Pago)
✅ **3 Dias de Teste Grátis** para novos usuários
✅ **Dashboard Administrativo** para gerir usuários
✅ **Webhooks Automáticos** para processar pagamentos
✅ **Verificação de Acesso** em tempo real

---

## 📦 Planos Disponíveis

| Plano    | Duração | Preço    | R$/dia |
|----------|---------|----------|--------|
| Semanal  | 7 dias  | R$ 29,90 | R$ 4,27|
| Mensal   | 30 dias | R$ 99,90 | R$ 3,33|
| Anual    | 365 dias| R$ 997,00| R$ 2,73|

---

## 🚀 Configuração Inicial

### 1. Configurar Mercado Pago

#### Criar Conta no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Copie suas credenciais:
   - **Access Token** (para backend)
   - **Public Key** (para frontend, se necessário)

#### Adicionar ao .env

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890-abcdef-xyz123
MERCADO_PAGO_PUBLIC_KEY=APP_USR-pub-1234567890
WEBHOOK_BASE_URL=https://seudominio.com
```

### 2. Executar Migrations

```bash
# Execute a migration de auth e pagamentos
psql $DATABASE_URL -f migrations/002_add_auth_and_payments.sql
```

### 3. Configurar Webhooks no Mercado Pago

1. Vá para seu Dashboard do Mercado Pago
2. Configurações → Webhooks
3. Adicione a URL: `https://seudominio.com/api/payments/webhook`
4. Selecione eventos: `payment`, `subscription`

---

## 📱 Fluxo do Usuário

### 1. Registro

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senhaSegura123",
    "full_name": "João Silva",
    "phone_number": "+5511999999999",
    "cpf": "12345678900"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "full_name": "João Silva",
    "subscription_status": "trial",
    "trial_ends": "2025-02-10T12:00:00"
  }
}
```

✅ **Usuário ganha 3 dias grátis automaticamente!**

### 2. Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senhaSegura123"
  }'
```

### 3. Ver Informações da Conta

**Endpoint:** `GET /api/auth/me`

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

**Resposta:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "full_name": "João Silva",
  "subscription": {
    "status": "trial",
    "plan": null,
    "end_date": "2025-02-10T12:00:00",
    "days_remaining": 2,
    "message": "🎁 Período de Teste - 2 dias restantes"
  },
  "stats": {
    "total_submissions": 5,
    "current_level": "B1",
    "target_score": 120
  }
}
```

### 4. Ver Planos Disponíveis

**Endpoint:** `GET /api/payments/plans`

```bash
curl -X GET http://localhost:8000/api/payments/plans
```

**Resposta:**
```json
{
  "plans": [
    {
      "id": "weekly",
      "name": "Plano Semanal",
      "description": "Acesso por 7 dias ao DET Flow",
      "price": 29.90,
      "duration_days": 7,
      "price_per_day": 4.27
    },
    ...
  ]
}
```

### 5. Criar Pagamento PIX

**Endpoint:** `POST /api/payments/create`

```bash
curl -X POST http://localhost:8000/api/payments/create \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "weekly",
    "payment_method": "pix"
  }'
```

**Resposta:**
```json
{
  "payment_id": "123456789",
  "status": "pending",
  "plan": "weekly",
  "amount": 29.90,
  "payment_data": {
    "qr_code": "00020126580014br.gov.bcb.pix...",
    "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "expiration_date": "2025-02-07T13:30:00"
  },
  "message": "💰 **Pagamento PIX Gerado**\n\n..."
}
```

O usuário pode:
- Escanear o QR Code
- Copiar o código PIX (Copia e Cola)
- Pagamento expira em 30 minutos

### 6. Pagamento Aprovado Automaticamente

Quando o PIX é pago:
1. Mercado Pago envia webhook para `/api/payments/webhook`
2. Sistema verifica o pagamento
3. **Assinatura é ativada automaticamente**
4. Usuário recebe acesso imediato

### 7. Verificar Status do Pagamento

**Endpoint:** `GET /api/payments/status/{payment_id}`

```bash
curl -X GET http://localhost:8000/api/payments/status/123456789 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## 🔐 Proteção de Endpoints

### Endpoints Públicos (sem autenticação)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/payments/plans`
- `POST /api/payments/webhook` (apenas Mercado Pago)

### Endpoints Autenticados (requer JWT)
- `GET /api/auth/me`
- `POST /api/payments/create`
- `GET /api/payments/status/{payment_id}`
- `GET /api/payments/history`
- `POST /api/submissions` (criar submissão)

### Endpoints com Verificação de Assinatura Ativa
- `POST /api/submissions` - requer assinatura ativa
- Qualquer endpoint que use `get_current_active_user`

### Exemplo de Uso nos Endpoints

```python
from api.auth import get_current_user, get_current_active_user

# Apenas autenticado (pode estar com assinatura expirada)
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"user": current_user}

# Autenticado E com assinatura ativa
@router.post("/submit")
async def submit_answer(current_user: User = Depends(get_current_active_user)):
    # Só executa se assinatura estiver ativa
    return {"message": "Resposta enviada"}
```

---

## 🛠️ Dashboard Administrativo

### Autenticação Admin

Adicione ao `.env`:
```env
ADMIN_API_KEY=seu_admin_key_super_secreto_123
```

**Todos os endpoints admin requerem `?admin_key=seu_admin_key`**

### Estatísticas do Dashboard

**Endpoint:** `GET /api/admin/stats?admin_key=...`

```bash
curl -X GET "http://localhost:8000/api/admin/stats?admin_key=seu_admin_key"
```

**Resposta:**
```json
{
  "users": {
    "total": 150,
    "active_subscribers": 45,
    "trial_users": 12,
    "expired": 93,
    "new_today": 5,
    "new_this_week": 28,
    "expiring_soon": 8
  },
  "submissions": {
    "total": 1250,
    "today": 35,
    "average_score": 95.5
  },
  "revenue": {
    "mrr": 1345.50
  }
}
```

### Listar Usuários

**Endpoint:** `GET /api/admin/users`

```bash
curl -X GET "http://localhost:8000/api/admin/users?admin_key=...&skip=0&limit=50"
```

**Filtros disponíveis:**
- `subscription_status` - filtrar por status (active, trial, expired)
- `search` - buscar por nome, email ou telefone
- `skip` e `limit` - paginação

### Ver Detalhes de um Usuário

**Endpoint:** `GET /api/admin/users/{user_id}`

```bash
curl -X GET "http://localhost:8000/api/admin/users/1?admin_key=..."
```

### Conceder Acesso Manual

**Endpoint:** `POST /api/admin/users/{user_id}/grant-access`

```bash
curl -X POST "http://localhost:8000/api/admin/users/1/grant-access?admin_key=..." \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "weekly",
    "duration_days": 14
  }'
```

Isso concede 14 dias de acesso (ou a duração do plano escolhido).

### Desativar/Ativar Usuário

```bash
# Desativar
curl -X POST "http://localhost:8000/api/admin/users/1/deactivate?admin_key=..."

# Ativar
curl -X POST "http://localhost:8000/api/admin/users/1/activate?admin_key=..."
```

### Expirar Assinaturas Antigas (Cron Job)

**Endpoint:** `POST /api/admin/system/expire-subscriptions`

```bash
curl -X POST "http://localhost:8000/api/admin/system/expire-subscriptions?admin_key=..."
```

⚠️ **Recomendação:** Configure um cron job para executar isso diariamente:

```bash
# Crontab
0 1 * * * curl -X POST "https://seudominio.com/api/admin/system/expire-subscriptions?admin_key=..."
```

---

## 💳 Tipos de Pagamento

### PIX (Recomendado)

✅ **Aprovação instantânea**
✅ **Sem taxas de intermediação para o usuário**
✅ **QR Code + Copia e Cola**
✅ **Expira em 30 minutos**

### Cartão de Crédito

✅ **Aprovação em segundos**
✅ **Parcelamento opcional** (configure no Mercado Pago)
✅ **Checkout hospedado** (mais seguro)

```bash
curl -X POST http://localhost:8000/api/payments/create \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "weekly",
    "payment_method": "credit_card"
  }'
```

Retorna um `init_point` (link) onde o usuário completa o pagamento.

---

## 🔄 Webhooks do Mercado Pago

O sistema processa automaticamente os seguintes eventos:

| Evento | Ação |
|--------|------|
| `payment.created` | Registra pagamento pendente |
| `payment.approved` | **Ativa assinatura automaticamente** |
| `payment.rejected` | Marca pagamento como rejeitado |
| `payment.refunded` | Desativa assinatura |

### Teste de Webhook Local

Use ngrok para testar webhooks localmente:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta local
ngrok http 8000

# Use a URL gerada como WEBHOOK_BASE_URL
```

---

## 📊 Banco de Dados

### Tabelas Principais

#### users (atualizada)
```sql
- email, password_hash
- subscription_status, subscription_plan
- subscription_start_date, subscription_end_date
- is_email_verified, cpf, full_name
```

#### payments (nova)
```sql
- payment_id, provider, amount, status
- payment_method, pix_qr_code
- subscription_plan
```

#### subscription_history (nova)
```sql
- Rastreia todas as mudanças de assinatura
- action: created, renewed, cancelled, expired
```

### Queries Úteis

```sql
-- Usuários com assinatura ativa
SELECT * FROM active_subscribers;

-- Revenue por dia
SELECT * FROM revenue_summary;

-- Lifetime value dos usuários
SELECT * FROM user_lifetime_value;

-- Verificar se usuário tem acesso
SELECT user_has_access(123);  -- user_id = 123
```

---

## 🔒 Segurança

### Senhas
- Hash com bcrypt (12 rounds)
- Validação: mínimo 8 caracteres

### JWT
- Algoritmo HS256
- Expiração: 7 dias
- Secret key configurável

### Webhooks
- Valide IPs do Mercado Pago em produção
- Log todos os eventos

### Admin
- Use chave API forte e única
- Rotate periodicamente
- Considere implementar autenticação 2FA

---

## 🧪 Testes

### Teste de Registro e Login

```python
import requests

BASE_URL = "http://localhost:8000"

# Registrar
response = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": "teste@exemplo.com",
    "password": "senha123456",
    "full_name": "Teste User",
    "phone_number": "+5511999999999"
})
token = response.json()["access_token"]

# Verificar informações
response = requests.get(
    f"{BASE_URL}/api/auth/me",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())
```

### Teste de Pagamento PIX

```python
# Criar pagamento PIX
response = requests.post(
    f"{BASE_URL}/api/payments/create",
    headers={"Authorization": f"Bearer {token}"},
    json={"plan": "weekly", "payment_method": "pix"}
)

payment_data = response.json()
print(f"QR Code: {payment_data['payment_data']['qr_code']}")
print(f"Payment ID: {payment_data['payment_id']}")
```

---

## 📈 Métricas Importantes

### KPIs para Acompanhar

1. **Taxa de Conversão Trial → Pago**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE action = 'trial_converted') * 100.0 /
     COUNT(*) FILTER (WHERE action = 'trial_started') AS conversion_rate
   FROM subscription_history;
   ```

2. **MRR (Monthly Recurring Revenue)**
   ```sql
   SELECT SUM(
     CASE subscription_plan
       WHEN 'weekly' THEN 29.90 * 4.33
       WHEN 'monthly' THEN 99.90
       WHEN 'yearly' THEN 997.00 / 12
     END
   ) AS mrr
   FROM users
   WHERE subscription_status = 'active';
   ```

3. **Churn Rate**
   ```sql
   SELECT * FROM subscription_churn;
   ```

4. **LTV (Lifetime Value)**
   ```sql
   SELECT AVG(lifetime_value) FROM user_lifetime_value;
   ```

---

## 🎯 Próximos Passos

### Melhorias Sugeridas

1. **Email Marketing**
   - Enviar emails de boas-vindas
   - Lembrete 1 dia antes da expiração
   - Email de recuperação de carrinho

2. **Cupons de Desconto**
   - Sistema de cupons promocionais
   - Descontos para referência

3. **Programa de Afiliados**
   - Código de referência já implementado
   - Adicionar comissões

4. **Analytics Avançado**
   - Google Analytics
   - Hotjar para comportamento

5. **Múltiplos Gateways**
   - Adicionar Stripe como alternativa
   - Pagamento via boleto

---

## 🆘 Troubleshooting

### Webhook não está funcionando

1. Verifique se a URL está acessível publicamente
2. Teste com: `curl https://seudominio.com/api/payments/webhook`
3. Verifique logs: `tail -f logs/det_flow.log`

### Pagamento aprovado mas assinatura não ativou

1. Verifique o external_reference do pagamento
2. Rode manualmente: `POST /api/admin/users/{user_id}/grant-access`

### JWT inválido

1. Verifique se SECRET_KEY é a mesma em todos os servidores
2. Token pode ter expirado (7 dias)
3. Faça login novamente

---

## 📞 Suporte

Para dúvidas sobre o sistema de monetização:
- 📧 Email: suporte@detflow.com
- 📖 Docs: Ver README.md
- 🐛 Issues: GitHub

---

**DET Flow Monetização** - Sistema completo de assinaturas e pagamentos! 🚀💰
