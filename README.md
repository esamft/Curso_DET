# Simulador DET - Duolingo English Test

Simulador completo do DET (Duolingo English Test) com múltiplas seções interativas para prática de inglês.

## Funcionalidades

### 🎯 7 Módulos Completos

1. **Dashboard** - Painel com estatísticas, gráficos e histórico
2. **Interactive Speaking** - Conversação com avatar AI
3. **Read and Complete** - Completar textos com letras faltantes
4. **Read and Select** - Identificar palavras reais vs. inventadas
5. **Interactive Writing** - Redação com timer e contador de palavras
6. **Resultados** - Tela de score com feedback detalhado
7. **Flashcard Deck** - Sistema de flashcards para vocabulário

### ✨ Recursos

- ✅ Interface responsiva e moderna
- ✅ Timers dinâmicos para cada seção
- ✅ Sistema de gravação de voz (Interactive Speaking)
- ✅ Validação automática de respostas
- ✅ Barra de progresso visual
- ✅ Animações e feedback interativo
- ✅ Auto-save de rascunhos
- ✅ Contador de palavras em tempo real
- ✅ Sistema de flashcards personalizados

## Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript (Vanilla)

## Como usar

### Início Rápido

1. Abra o arquivo `menu.html` no seu navegador para acessar o menu principal
2. Ou acesse diretamente qualquer módulo específico:
   - `index.html` - Interactive Speaking
   - `read-and-complete.html` - Read and Complete
   - `read-and-select.html` - Read and Select
   - `interactive-writing.html` - Interactive Writing
   - `flashcard-modal.html` - Flashcard Deck

### Navegação entre módulos

Cada módulo possui navegação para o próximo, permitindo uma experiência de teste contínua.

## Estrutura do projeto

```
Curso_DET/
├── menu.html                    # Menu principal com todos os módulos
├── index.html                   # Interactive Speaking
├── styles.css
├── script.js
├── read-and-complete.html       # Completar textos
├── read-and-complete.css
├── read-and-complete.js
├── read-and-select.html         # Validar palavras
├── read-and-select.css
├── read-and-select.js
├── interactive-writing.html     # Redação livre
├── interactive-writing.css
├── interactive-writing.js
├── flashcard-modal.html         # Sistema de flashcards
├── flashcard-modal.css
├── flashcard-modal.js
└── README.md                    # Documentação
```

## Detalhes dos Módulos

### 1. Interactive Speaking (`index.html`)
- Avatar interativo com status de escuta
- Gravação de áudio com visualização de ondas sonoras
- Timer circular de 35 segundos
- Barra de progresso de questões
- Feedback visual em tempo real

### 2. Read and Complete (`read-and-complete.html`)
- Textos com lacunas para preencher
- Validação automática de respostas
- Sistema de dicas (hints)
- Indicador de progresso dinâmico
- Feedback imediato (correto/incorreto)

### 3. Read and Select (`read-and-select.html`)
- 18 palavras para validar
- Timer urgente (4 segundos por palavra)
- Palavras reais vs. inventadas
- Sistema de pontuação
- Animações de feedback

### 4. Interactive Writing (`interactive-writing.html`)
- Área de texto expansível
- Timer de 5 minutos
- Contador de palavras em tempo real
- Auto-save a cada 10 segundos
- Verificação ortográfica integrada
- Previne perda de dados

### 5. Flashcard Deck (`flashcard-modal.html`)
- Criação de flashcards personalizados
- Campos: Palavra, Significado, Exemplo
- Marcação de vocabulário acadêmico
- Interface modal elegante
- Sistema de salvamento

## Características do Design

### Paleta de Cores

- **Verde**: `#58CC02` - Flashcards, sucesso
- **Azul**: `#2196F3` - Read and Complete
- **Laranja**: `#FF9600` - Interactive Speaking/Writing
- **Vermelho**: `#F44336` - Read and Select, alertas
- **Roxo**: `#667eea` - Branding principal
- **Cinza claro**: `#F5F5F5` - Fundos
- **Branco**: `#FFFFFF` - Cards e elementos

## Responsividade

Todos os módulos são totalmente responsivos:

- **Desktop** (> 1024px): Layout otimizado com 2 colunas
- **Tablet** (768px - 1024px): Layout de 1 coluna adaptado
- **Mobile** (< 768px): Interface simplificada e touch-friendly

## Funcionalidades Técnicas

### Auto-save e Persistência
- LocalStorage para salvar rascunhos (Interactive Writing)
- Proteção contra perda de dados ao fechar a página
- Recuperação automática de sessões

### Validação Inteligente
- Verificação em tempo real de respostas
- Feedback visual imediato (cores, animações)
- Sistema de pontuação e estatísticas

### Acessibilidade
- Suporte a teclado (atalhos)
- Navegação com Tab
- Feedback sonoro e visual
- Contraste adequado de cores

## Atalhos de Teclado

### Interactive Writing
- `Ctrl/Cmd + Enter` - Submeter resposta
- `Ctrl/Cmd + S` - Salvar rascunho

### Read and Select
- `1` ou `N` - Selecionar "NÃO"
- `2` ou `Y` - Selecionar "SIM"

## Melhorias Futuras

- [ ] Integração com Web Speech API (reconhecimento de voz real)
- [ ] Backend com Node.js para salvar resultados
- [ ] Sistema de autenticação de usuários
- [ ] Dashboard de progresso e estatísticas
- [ ] Modo offline (PWA)
- [ ] Exportar resultados em PDF
- [ ] Quiz generator automático
- [ ] Múltiplos idiomas de interface
- [ ] Sistema de rankings
- [ ] Integração com IA para feedback personalizado

## Baseado no Design

Este projeto foi desenvolvido com base nos designs do **Google Stitch** e nas especificações oficiais do **Duolingo English Test**.

## Licença

Este é um projeto educacional desenvolvido para fins de estudo e prática.

## Contribuições

Pull requests são bem-vindos! Para mudanças significativas, por favor abra uma issue primeiro para discutir o que você gostaria de mudar.
