# 🧠 BrainBloom Forge

## 📋 Sobre o Projeto

**BrainBloom Forge** é uma plataforma completa de gerenciamento de estudos que combina técnicas comprovadas de aprendizagem com tecnologia moderna. O objetivo é fornecer aos estudantes ferramentas eficazes para organizar, revisar e consolidar conhecimento de forma inteligente e visual.

### 🎯 Objetivo Principal

Criar um ecossistema integrado de estudos que permita aos usuários:
- Organizar anotações usando o Método Cornell
- Visualizar conceitos através de mapas mentais
- Revisar conteúdo com flashcards inteligentes
- Gerenciar materiais de estudo por pastas e tags
- Acompanhar progresso e prioridades de aprendizagem

---

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Cadastro e login de usuários
- Autenticação segura via Supabase
- Proteção de rotas privadas
- Gerenciamento de sessão

### ✅ Método Cornell
- Criação de anotações estruturadas com:
  - Palavras-chave (cue column)
  - Notas principais (notes column)
  - Resumo (summary section)
- Organização por matéria e número de aula
- Sistema de prioridades (baixa, média, alta, crítica)
- Vinculação a pastas

### ✅ Mapas Mentais
- Canvas interativo para criação de mapas mentais
- Nós conectados hierarquicamente
- Conceito central personalizável
- Sistema de cores para organização visual
- Salvamento automático

### ✅ Flashcards
- Criação de decks de flashcards
- Editor de cartões (frente/verso)
- Importação via CSV
- Visualizador com flip animation
- Organização por decks

### ✅ Sistema de Organização
- Pastas hierárquicas para categorização
- Tags personalizadas com cores
- Sistema de prioridades
- Busca global de conteúdo
- Filtros por pasta e tipo de conteúdo

### ✅ Interface do Usuário
- Design responsivo e moderno
- Tema claro/escuro
- Sidebar com navegação intuitiva
- Dashboard com estatísticas
- Atividade recente

---

## 🔮 Funcionalidades Planejadas

### 📅 Calendário Acadêmico
- Adicionar datas de aulas
- Marcar provas e avaliações
- Definir prazos de entrega de trabalhos
- Notificações de eventos próximos

### 💾 Auto-Save
- Salvamento automático de alterações
- Prevenção de perda de dados
- Sincronização em tempo real

### 🎨 Temas Personalizáveis
- Modo claro, escuro e foco
- Personalização de cores
- Ajuste de contraste

### 👤 Perfil de Usuário
- Exibir nome e avatar do usuário logado
- Configurações de conta
- Estatísticas de uso

### 🎮 Gamificação
- Sistema de XP (experiência)
- Streaks (sequências de dias estudando)
- Conquistas e badges
- Ranking de progresso

### 📝 Revisão de Flashcards
- Sistema de repetição espaçada
- Anotações em flashcards
- Estatísticas de acerto

### 🤖 Integração com IA
- Criar mapas mentais a partir de notas Cornell
- Sugestões de palavras-chave
- Geração automática de flashcards

### 📚 Hub de Conteúdo
- Salvar artigos da web
- Salvar vídeos para assistir depois
- Organizar recursos externos
- Marcação de "ler mais tarde"

### 🎨 Customização Avançada
- Temas personalizados (não paywall)
- Cores customizáveis
- Avatares personalizados
- Ícones de matéria

### 🔄 Atualização de Atividade Recente
- Feed em tempo real
- Histórico de modificações
- Últimas ações realizadas

### 📐 Mapa Mental Redimensionável
- Canvas com zoom
- Área de criação expansível
- Suporte para mapas grandes

### 🎯 Responsividade 
- PWA (Progressive Web App)

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18.3** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor

### UI/UX
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis
- **Radix UI** - Primitivos de UI
- **Lucide React** - Ícones
- **next-themes** - Gerenciamento de temas
- **Sonner** - Notificações toast

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions

### Formulários & Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **@hookform/resolvers** - Integração Zod + RHF

### Utilitários
- **date-fns** - Manipulação de datas
- **clsx** / **tailwind-merge** - Merge de classes CSS
- **cmdk** - Command palette

### Testes
- **Vitest** - Framework de testes
- **Testing Library** - Testes de componentes
- **jsdom** - Ambiente DOM para testes

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `folders`
- Organização hierárquica de conteúdo
- Suporte a subpastas
- Cores personalizadas

#### `cornell_notes`
- Anotações no método Cornell
- Keywords (JSONB)
- Prioridades
- Vinculação a pastas

#### `mind_maps`
- Mapas mentais
- Nodes (JSONB) com posições x,y
- Conceito central
- Estrutura hierárquica

#### `flashcard_decks`
- Decks de flashcards
- Descrição e título
- Vinculação a pastas

#### `flashcards`
- Cartões individuais
- Frente e verso
- Vinculação a decks

#### `tags`
- Tags personalizadas
- Cores customizáveis
- Reutilizáveis

### Segurança
- **Row Level Security (RLS)** habilitado em todas as tabelas
- Políticas de acesso baseadas em `user_id`
- Isolamento completo de dados entre usuários

---

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes React
│   ├── cornell/        # Componentes do Método Cornell
│   ├── flashcards/     # Componentes de Flashcards
│   ├── mindmap/        # Componentes de Mapas Mentais
│   ├── layout/         # Layout e Sidebar
│   ├── dialogs/        # Modais e diálogos
│   ├── search/         # Busca global
│   └── ui/             # Componentes shadcn/ui
├── contexts/           # Context API
│   ├── AuthContext     # Autenticação
│   └── StudyContext    # Estado de estudos
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas
│   └── supabase/       # Cliente Supabase
├── lib/                # Utilitários
├── pages/              # Páginas da aplicação
├── types/              # Definições TypeScript
└── test/               # Configuração de testes
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ e npm
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>

# Entre no diretório
cd brainbloom-forge

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
# VITE_SUPABASE_URL=sua_url
# VITE_SUPABASE_ANON_KEY=sua_chave

# Execute o projeto
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Executa linter
npm run test         # Executa testes
npm run test:watch   # Testes em modo watch
```

---

## 🎨 Design System

### Cores Principais
- **Primary**: Azul vibrante para ações principais
- **Secondary**: Tons complementares
- **Muted**: Backgrounds e elementos secundários
- **Accent**: Destaques e hover states

### Componentes
- Todos os componentes seguem padrões de acessibilidade WCAG
- Suporte completo a teclado
- ARIA labels apropriados
- Responsividade mobile-first

---

## 🔐 Segurança

- Autenticação JWT via Supabase
- Row Level Security no banco de dados
- Validação de dados no frontend e backend
- Sanitização de inputs
- HTTPS obrigatório em produção

---

## 📈 Roadmap

### Fase 1 - Fundação ✅
- [x] Sistema de autenticação
- [x] Método Cornell
- [x] Mapas Mentais
- [x] Flashcards básicos
- [x] Sistema de pastas

### Fase 2 - Melhorias UX 🚧
- [ ] Calendário acadêmico
- [ ] Auto-save
- [ ] Temas personalizáveis
- [ ] Perfil de usuário
- [ ] Responsividade completa

### Fase 3 - Gamificação 📋
- [ ] Sistema de XP
- [ ] Streaks
- [ ] Conquistas
- [ ] Revisão espaçada

### Fase 4 - IA & Automação 🔮
- [ ] Geração de mapas mentais via IA
- [ ] Sugestões inteligentes
- [ ] Análise de progresso
- [ ] Recomendações personalizadas

### Fase 5 - Hub de Conteúdo 📚
- [ ] Salvar artigos
- [ ] Salvar vídeos
- [ ] Organização de recursos
- [ ] Integração com plataformas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👥 Autores

Desenvolvido com ❤️ para estudantes que buscam excelência acadêmica.

---

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

---

**BrainBloom Forge** - Cultivando conhecimento, colhendo sucesso 🌱✨
