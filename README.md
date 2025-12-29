# Simulador DET - Interactive Speaking

Simulador de teste DET (Duolingo English Test) com interface interativa para prática de conversação em inglês.

## Funcionalidades

- ✅ Interface responsiva e moderna
- ✅ Timer com contagem regressiva de 35 segundos
- ✅ Botão de gravação com indicador visual
- ✅ Status de escuta em tempo real
- ✅ Animação de ondas sonoras
- ✅ Barra de progresso circular
- ✅ Avatar interativo

## Tecnologias

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript (Vanilla)

## Como usar

1. Abra o arquivo `index.html` no seu navegador
2. Permita o acesso ao microfone quando solicitado
3. Clique em "GRAVAR RESPOSTA" para iniciar a gravação
4. Fale por pelo menos 30 segundos sobre o tópico apresentado
5. Clique em "PARAR GRAVAÇÃO" quando terminar

## Estrutura do projeto

```
Curso_DET/
├── index.html      # Estrutura HTML
├── styles.css      # Estilos e animações
├── script.js       # Funcionalidades interativas
└── README.md       # Documentação
```

## Características do Design

### Cores

- **Verde primário**: `#58CC02` (logo)
- **Laranja**: `#FF9600` (botões e destaques)
- **Roxo**: `#8B5CF6` (ícones)
- **Cinza claro**: `#F5F5F5` (fundo)
- **Branco**: `#FFFFFF` (cards)

### Componentes

1. **Header**: Logo, título, progresso e timer
2. **Avatar Section**: Personagem 3D com status de escuta
3. **Task Section**: Pergunta e instruções para o usuário
4. **Botão de Gravação**: Controle interativo com feedback visual

## Responsividade

O layout se adapta para diferentes tamanhos de tela:

- **Desktop** (> 1024px): Layout de 2 colunas
- **Tablet** (768px - 1024px): Layout de 1 coluna
- **Mobile** (< 768px): Layout simplificado e otimizado

## Próximas melhorias

- [ ] Integração real com API de reconhecimento de voz
- [ ] Sistema de avaliação de respostas
- [ ] Múltiplas perguntas com navegação
- [ ] Armazenamento de respostas
- [ ] Feedback de pronúncia
