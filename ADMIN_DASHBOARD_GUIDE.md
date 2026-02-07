# Dashboard Admin - Guia Rápido 🎨

Guia completo para usar o Dashboard Administrativo do DET Flow.

---

## 🚀 **SETUP INICIAL**

### 1. Instalar Dependências

```bash
cd frontend-admin
npm install
```

### 2. Configurar Variáveis

```bash
cp .env.example .env
```

O arquivo `.env` já vem configurado para `http://localhost:8000` (backend local).

### 3. Iniciar o Backend

Em outro terminal:

```bash
cd ..  # Voltar para raiz do projeto
python run.py
```

Ou:

```bash
uvicorn api.main:app --reload
```

### 4. Iniciar o Dashboard

```bash
cd frontend-admin
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔐 **COMO FAZER LOGIN**

1. Abra http://localhost:3000
2. Digite a chave de administrador
3. A chave está no arquivo `.env` do backend: `ADMIN_API_KEY`
4. Por padrão, é `admin_secret_key_change_me` (mude em produção!)

![Login](https://via.placeholder.com/800x400?text=Tela+de+Login)

---

## 📊 **DASHBOARD PRINCIPAL**

Após login, você verá:

### Cards de Estatísticas

| Card | Descrição |
|------|-----------|
| **Total de Usuários** | Quantidade total + novos hoje |
| **Assinantes Ativos** | Usuários com assinatura válida |
| **MRR** | Receita Mensal Recorrente |
| **Submissões Hoje** | Total de submissões nas últimas 24h |

### Gráficos

- **Status dos Usuários**: Barra de progresso visual
  - Verde: Ativos
  - Azul: Trial
  - Cinza: Expirados
  - Amarelo: Expirando em breve

- **Atividade Recente**:
  - Novos usuários (hoje e semana)
  - Score médio das submissões

**Atualização Automática:** O dashboard recarrega a cada 30 segundos.

---

## 👥 **GERENCIAR USUÁRIOS**

### Listar Usuários

Clique em **"Usuários"** no menu lateral.

Você verá uma tabela com:
- Nome e email
- Status da assinatura (badges coloridos)
- Plano atual
- Data de expiração
- Total de submissões

### Buscar Usuários

Use a barra de busca para encontrar por:
- Nome
- Email
- Telefone

### Filtrar por Status

Use o dropdown para filtrar:
- Todos
- Ativos
- Trial
- Expirados
- Cancelados

### Paginação

- Mostra 50 usuários por página
- Navegue com botões "Anterior" e "Próximo"

---

## 👤 **VER DETALHES DO USUÁRIO**

1. Clique em **"Ver"** ao lado do usuário
2. Abre modal com informações completas:

### Informações Pessoais
- Nome completo
- Email
- Telefone
- CPF

### Assinatura
- Status atual
- Plano contratado
- Data de início
- Data de término

### Progresso
- Nível atual (A1-C2)
- Meta de score
- Total de submissões

### Submissões Recentes
- 10 últimas submissões
- Score de cada uma
- Data e hora
- Status

### Ações
- **Desativar Usuário** - Bloqueia acesso
- **Ativar Usuário** - Reativa conta desativada

---

## 🎁 **CONCEDER ACESSO MANUAL**

Esta é a função mais importante! Use para:
- Dar acesso gratuito
- Resolver problemas de pagamento
- Oferecer cortesias
- Testar o sistema

### Como Conceder

1. Clique em **"Acesso"** ao lado do usuário
2. Selecione o plano:
   - **Semanal** - 7 dias (R$ 29,90)
   - **Mensal** - 30 dias (R$ 99,90)
   - **Anual** - 365 dias (R$ 997,00)

3. *(Opcional)* Digite duração personalizada:
   - Ex: `14` para 14 dias
   - Sobrescreve a duração do plano

4. Clique em **"Conceder Acesso"**

5. ✅ **Pronto!** Assinatura ativada instantaneamente

### Exemplo de Uso

**Cenário:** Cliente pagou via PIX mas webhook falhou.

1. Busque o usuário pelo email
2. Clique em "Acesso"
3. Selecione "Semanal"
4. Digite `7` (ou deixe em branco para usar padrão)
5. Conceda → Cliente tem acesso imediato!

---

## 🎯 **CASOS DE USO COMUNS**

### 1. Dar Trial Estendido

```
Usuário: João Silva
Ação: Conceder Acesso
Plano: Semanal
Dias: 14
Resultado: João ganha 14 dias grátis
```

### 2. Resolver Problema de Pagamento

```
Situação: PIX pago mas não processou
Buscar: email do cliente
Ver: status "expired" ou "pending"
Conceder: plano que ele pagou
Resultado: Acesso liberado manualmente
```

### 3. Oferecer Cortesia

```
Cliente VIP ou influencer
Conceder: Plano Anual
Dias: 365 (ou deixar padrão)
Resultado: Acesso completo por 1 ano
```

### 4. Desativar Conta Problemática

```
Ver Detalhes → Desativar Usuário
Motivo: Spam, abuso, etc.
Resultado: Conta bloqueada imediatamente
```

---

## 🎨 **INTERFACE**

### Badges de Status

| Badge | Cor | Significado |
|-------|-----|-------------|
| Ativo | 🟢 Verde | Assinatura válida |
| Trial | 🔵 Azul | Período de teste |
| Expirado | 🔴 Vermelho | Assinatura vencida |
| Cancelado | 🟡 Amarelo | Cancelado pelo usuário |

### Sidebar

- **Dashboard** - Estatísticas gerais
- **Usuários** - Gerenciar usuários
- **Sair** - Fazer logout

### Responsivo

- ✅ Desktop (melhor experiência)
- ✅ Tablet
- ✅ Mobile (sidebar colapsável)

---

## 🔧 **PROBLEMAS COMUNS**

### Dashboard não carrega estatísticas

**Causa:** Backend não está rodando ou chave inválida

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:8000/health

# Verificar chave admin no backend
echo $ADMIN_API_KEY  # ou ver no .env
```

### "Chave de administrador inválida"

**Causa:** Chave incorreta

**Solução:**
1. Vá no backend: `.env` → `ADMIN_API_KEY`
2. Copie a chave exata
3. Cole no login do dashboard

### Usuários não aparecem

**Causa:** Banco de dados vazio

**Solução:**
1. Registre um usuário teste:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@email.com",
       "password": "senha123456",
       "full_name": "Usuário Teste",
       "phone_number": "+5511999999999"
     }'
   ```

2. Recarregue o dashboard

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### Build

```bash
npm run build
```

Arquivos otimizados em `dist/`.

### Servir com Nginx

```nginx
server {
    listen 80;
    server_name admin.seudominio.com;

    root /caminho/para/frontend-admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

### Vercel / Netlify

1. Conecte o repositório
2. Configure build:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `frontend-admin`

3. Variáveis de ambiente:
   - `VITE_API_URL` = `https://api.seudominio.com`

4. Deploy automático

---

## 📱 **ATALHOS DE TECLADO**

| Atalho | Ação |
|--------|------|
| `/` | Focar na busca |
| `Esc` | Fechar modal |
| `Ctrl + R` | Recarregar dados |

---

## 🎓 **DICAS PRO**

### 1. Conceder Acesso em Massa

Se precisar dar acesso para vários usuários:

```bash
# Use o endpoint diretamente
for user_id in 1 2 3 4 5; do
  curl -X POST "http://localhost:8000/api/admin/users/$user_id/grant-access?admin_key=sua_chave" \
    -H "Content-Type: application/json" \
    -d '{"plan": "weekly", "duration_days": 7}'
done
```

### 2. Exportar Lista de Usuários

Use o navegador:
1. Abra DevTools (F12)
2. Console → Cole:
   ```javascript
   // Copiar tabela como CSV
   let table = document.querySelector('table');
   let csv = Array.from(table.querySelectorAll('tr'))
     .map(row => Array.from(row.cells).map(cell => cell.textContent))
     .join('\n');
   console.log(csv);
   ```

### 3. Monitorar em Tempo Real

Deixe o dashboard aberto em uma aba.

Ele atualiza automaticamente a cada 30s.

---

## 🆘 **SUPORTE**

Problemas com o dashboard?

1. Verifique console do navegador (F12)
2. Verifique logs do backend
3. Consulte `frontend-admin/README.md`
4. Veja issues no GitHub

---

## ✅ **CHECKLIST DE USO**

- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:3000
- [ ] Login feito com chave admin correta
- [ ] Dashboard carregando estatísticas
- [ ] Consegue ver lista de usuários
- [ ] Modal de detalhes funciona
- [ ] Consegue conceder acesso manual

---

**Dashboard Admin do DET Flow** - Gerencie tudo com facilidade! 🎨✨
