# BrainBloom Forge

## Visão Geral

BrainBloom Forge é uma plataforma de gerenciamento de estudos que integra técnicas comprovadas de aprendizagem com tecnologia moderna. O sistema oferece ferramentas para organização, revisão e consolidação de conhecimento através do Método Cornell, mapas mentais e flashcards inteligentes.

## Objetivo

Fornecer um ecossistema completo de estudos que permite aos usuários organizar anotações estruturadas, visualizar conceitos de forma hierárquica, revisar conteúdo através de repetição espaçada e acompanhar progresso acadêmico com sistema de prioridades e categorização por pastas e tags.

---

## Funcionalidades Atuais

**Autenticação e Segurança**  
Sistema completo de autenticação via Supabase com proteção de rotas, gerenciamento de sessão e Row Level Security (RLS) no banco de dados. Cada usuário possui isolamento completo de dados.

**Método Cornell**  
Implementação digital do método Cornell de anotações com três seções: palavras-chave (cue column), notas principais (notes column) e resumo (summary section). Suporta organização por matéria, número de aula, sistema de prioridades (baixa, média, alta, crítica), vinculação a pastas hierárquicas, salvamento automático com debounce de 2 segundos e deleção de cards.

**Mapas Mentais**  
Canvas interativo para criação de mapas mentais com nós conectados hierarquicamente. Permite personalização de conceito central, sistema de cores para organização visual, salvamento automático das posições dos nós e deleção de cards.

**Flashcards**  
Sistema completo de decks de flashcards com editor de cartões (frente/verso), importação via CSV, geração automática com IA (Google Gemini 3 Flash), visualizador com animação de flip, modo de estudo interativo e organização por decks. Suporta vinculação a pastas e tags com contador de cartões por deck. Permite salvar flashcards gerados por IA em novo deck ou deck existente.

**Calendário Acadêmico** ✅  
Sistema completo de calendário com gerenciamento de eventos (provas, trabalhos, eventos, importantes), legenda colorida por tipo de evento, tags dentro das datas com ícone e nome do evento, criação/edição/exclusão de eventos e suporte a eventos com data de início e fim.

**Hub de Conteúdo** ✅  
Funcionalidade para salvar artigos da web, vídeos e recursos externos com título, descrição, link, tipo de conteúdo, prioridade, vinculação a pastas e tags. Suporta deleção de cards e organização integrada ao sistema.

**Sistema de Organização**  
Estrutura de pastas hierárquicas para categorização de conteúdo com visualização dedicada mostrando subpastas e todo conteúdo relacionado (anotações Cornell, mapas mentais, flashcards, conteúdo do hub). Tags personalizadas com cores, sistema de prioridades e busca global com filtros por pasta e tipo de conteúdo.

**Timer Pomodoro** ✅  
Timer configurável com durações personalizáveis para trabalho, pausa curta e pausa longa. Registra sessões de estudo por matéria/pasta, salva automaticamente no banco de dados e integra com estatísticas de progresso.

**Dashboard de Estatísticas** ✅  
Painel completo com horas estudadas por semana/mês, tempo de estudo por matéria, streak de dias estudando consecutivos (atual e melhor), cards visuais com métricas e integração com timer Pomodoro.

**Modo de Revisão Rápida** ✅  
Quiz interativo baseado em anotações Cornell mostrando palavras-chave e resumos, navegação entre últimas 10 notas e modo de estudo com revelação de respostas.

**Progressive Web App** ✅  
Manifest configurado, service worker implementado para cache offline, suporte para instalação em dispositivos móveis e otimização para responsividade.

**Integração com IA** ✅  
Geração automática de flashcards usando Google Gemini 3 Flash Preview via Lovable AI Gateway. Suporta criação de novo deck ou adição a deck existente, seleção de cards gerados e customização da quantidade de flashcards.

**Interface**  
Design responsivo com tema claro/escuro, sidebar colapsável com navegação intuitiva, busca global com atalho de teclado (⌘K), dashboard com estatísticas de uso, feed de atividade recente e perfil de usuário personalizável com avatar e informações acadêmicas.

---

## Roadmap de Desenvolvimento

**Busca Global** ✅  
Sistema de busca global implementado com atalho de teclado (⌘K), filtragem por tipo de conteúdo e navegação rápida entre recursos.

**Auto-Save** ✅  
Sistema de salvamento automático implementado com debounce de 2 segundos, indicador visual de salvamento em progresso e geração automática de títulos para anotações não nomeadas.

**Perfil de Usuário** ✅  
Sistema de perfil implementado com nickname personalizável, avatar gerado via DiceBear API, informações de curso e profissão, e persistência local dos dados.

**Revisão Espaçada**  
Algoritmo de repetição espaçada para flashcards, sistema de anotações em cartões e estatísticas de acerto para otimizar retenção de conhecimento.

**Gamificação**  
Sistema de experiência (XP), conquistas desbloqueáveis e ranking de progresso para aumentar engajamento.

**Customização Avançada**  
Temas personalizados adicionais, cores customizáveis por usuário e ícones de matéria personalizados.

**Melhorias de UX**  
Canvas de mapa mental redimensionável com zoom, atualização em tempo real do feed de atividade e favicon dinâmico.

---

## Arquitetura Técnica

**Frontend Stack**  
React 18.3 com TypeScript para tipagem estática, Vite como build tool, React Router DOM para roteamento e TanStack Query para gerenciamento de estado servidor.

**UI Framework**  
Tailwind CSS como framework utility-first, shadcn/ui para componentes acessíveis, Radix UI para primitivos de interface, Lucide React para ícones, next-themes para gerenciamento de temas e Sonner para notificações toast.

**Backend e Database**  
Supabase como Backend as a Service fornecendo PostgreSQL database, autenticação JWT, Row Level Security (RLS), real-time subscriptions e Edge Functions para integração com IA.

**Inteligência Artificial**  
Google Gemini 3 Flash Preview acessado via Lovable AI Gateway para geração de flashcards, resumos e sugestões de palavras-chave.

**Formulários e Validação**  
React Hook Form para gerenciamento de formulários, Zod para validação de schemas TypeScript e @hookform/resolvers para integração.

**Utilitários**  
date-fns para manipulação de datas, clsx e tailwind-merge para merge de classes CSS, cmdk para command palette, DiceBear API para geração de avatares e custom hooks para auto-save.

**Testes**  
Vitest como framework de testes, Testing Library para testes de componentes React e jsdom para ambiente DOM simulado.

---

## Estrutura do Banco de Dados

**Tabela folders**  
Armazena estrutura hierárquica de pastas com suporte a subpastas ilimitadas, cores personalizadas e referência ao usuário proprietário.

**Tabela cornell_notes**  
Contém anotações do método Cornell com campos para título, matéria, data, número da aula, keywords (JSONB), notas principais, resumo, prioridade e referência à pasta.

**Tabela mind_maps**  
Armazena mapas mentais com título, conceito central, nodes (JSONB contendo posições x,y e hierarquia), prioridade e referência à pasta.

**Tabela flashcard_decks**  
Gerencia decks de flashcards com título, descrição, referência à pasta e suporte a tags através de tabela de junção.

**Tabela flashcard_deck_tags**  
Tabela de junção para relacionamento muitos-para-muitos entre decks e tags, permitindo categorização flexível.

**Tabela flashcards**  
Contém cartões individuais com frente, verso e referência ao deck.

**Tabela tags**  
Armazena tags reutilizáveis com nome, cor personalizada e referência ao usuário.

**Tabela calendar_events**  
Gerencia eventos do calendário acadêmico com título, tipo (prova, trabalho, evento, importante), matéria, data de início, data de fim opcional e referência ao usuário.

**Tabela content_hub**  
Armazena conteúdo externo salvo (artigos, vídeos, recursos) com título, descrição, link, tipo, prioridade, referência à pasta e suporte a tags.

**Tabela study_sessions**  
Registra sessões de estudo do timer Pomodoro com duração, matéria, referência à pasta, horário de início e fim.

**Tabela pomodoro_settings**  
Armazena configurações personalizadas do timer Pomodoro por usuário (duração de trabalho, pausas curtas, pausas longas).

**Tabela study_streaks**  
Gerencia streaks de estudo com contador atual, melhor sequência e última data de estudo.

**Segurança**  
Todas as tabelas possuem Row Level Security (RLS) habilitado com políticas baseadas em user_id, garantindo isolamento completo de dados entre usuários.

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── ai/               # Componentes de IA (geração de flashcards)
│   ├── calendar/         # Sistema de calendário acadêmico
│   ├── content-hub/      # Hub de conteúdo externo
│   ├── cornell/          # Componentes do Método Cornell
│   ├── flashcards/       # Sistema de flashcards
│   ├── mindmap/          # Canvas de mapas mentais
│   ├── pomodoro/         # Timer Pomodoro
│   ├── review/           # Modo de revisão rápida
│   ├── stats/            # Dashboard de estatísticas
│   ├── layout/           # Layout e navegação
│   ├── dialogs/          # Modais e diálogos
│   ├── search/           # Busca global
│   └── ui/               # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx   # Gerenciamento de autenticação
│   └── StudyContext.tsx  # Estado global de estudos
├── hooks/
│   ├── useAutoSave.ts    # Hook de salvamento automático
│   ├── useFlashcards.ts  # Gerenciamento de flashcards
│   ├── useStudyStreak.ts # Gerenciamento de streaks
│   ├── useAIStudyAssistant.ts # Integração com IA
│   └── use-mobile.tsx    # Detecção de dispositivos móveis
├── integrations/
│   └── supabase/         # Cliente e tipos Supabase
├── lib/                  # Funções utilitárias
├── pages/                # Páginas da aplicação
├── types/                # Definições TypeScript
└── test/                 # Configuração de testes
```

---

## Instalação e Execução

**Pré-requisitos**  
Node.js 18+ e npm instalados. Conta ativa no Supabase.

**Configuração**

```bash
# Clonar repositório
git clone <YOUR_GIT_URL>
cd brainbloom-forge

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Criar arquivo .env na raiz:
# VITE_SUPABASE_URL=sua_url_supabase
# VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

**Scripts Disponíveis**

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Análise de código
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
```

---

## Segurança e Boas Práticas

O projeto implementa autenticação JWT via Supabase, Row Level Security no banco de dados PostgreSQL, validação de dados no frontend com Zod e backend com políticas RLS, sanitização de inputs e HTTPS obrigatório em produção. Todos os componentes seguem padrões de acessibilidade WCAG com suporte completo a teclado e ARIA labels apropriados.

---

## Licença

Este projeto está sob a licença MIT.

---

**BrainBloom Forge** - Plataforma de gerenciamento de estudos para excelência acadêmica.
