# 📐 ARQUITETURA - PLATAFORMA DE CURSOS WHITELABEL MULTI-TENANT

## 🎯 VISÃO GERAL
Plataforma estilo Netflix para cursos online com arquitetura multi-tenant.
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js Server Actions + API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Multi-tenancy**: Row-Level Security (RLS) com tenant isolation

---

## 📁 ESTRUTURA DE DIRETÓRIOS COMPLETA

```
flix-platform/
├── .env.local                          # Variáveis de ambiente
├── .env.example                        # Template de variáveis
├── .eslintrc.json                      # ESLint config
├── .prettierrc                         # Prettier config
├── next.config.js                      # Next.js config
├── tailwind.config.ts                  # Tailwind + CSS Variables dinâmicas
├── tsconfig.json                       # TypeScript config
├── package.json
├── middleware.ts                       # Tenant detection (subdomain/path)
│
├── prisma/
│   ├── schema.prisma                   # Schema completo (ver seção dedicada)
│   ├── migrations/                     # Migrações automáticas
│   └── seed.ts                         # Seed data (Super Admin, Planos)
│
├── public/
│   ├── assets/
│   │   ├── logos/                      # Logos dos tenants (fallback)
│   │   ├── certificates/               # Templates de certificados
│   │   └── icons/                      # Ícones da plataforma
│   └── videos/
│       └── placeholders/               # Thumbnails e placeholders
│
├── src/
│   ├── app/                            # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root layout (providers, fonts)
│   │   ├── page.tsx                    # Landing page pública (marketing)
│   │   ├── globals.css                 # Tailwind imports + CSS Variables
│   │   ├── not-found.tsx               # 404 global
│   │   ├── error.tsx                   # Error boundary global
│   │   │
│   │   ├── (auth)/                     # Grupo de rotas de autenticação
│   │   │   ├── layout.tsx              # Layout minimalista
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login (detecta tenant)
│   │   │   ├── register/
│   │   │   │   └── page.tsx            # Registro de aluno
│   │   │   └── forgot-password/
│   │   │       └── page.tsx            # Recuperação de senha
│   │   │
│   │   ├── (super-admin)/              # Super Admin (você)
│   │   │   ├── layout.tsx              # Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            # Overview de tenants
│   │   │   ├── tenants/
│   │   │   │   ├── page.tsx            # Lista de tenants
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Criar tenant
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Editar tenant
│   │   │   │       ├── billing/
│   │   │   │       │   └── page.tsx    # Faturamento do tenant
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx    # Configurações do tenant
│   │   │   ├── plans/
│   │   │   │   ├── page.tsx            # Gerenciar planos de licença
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Editar plano
│   │   │   ├── billing/
│   │   │   │   └── page.tsx            # Faturamento total consolidado
│   │   │   └── settings/
│   │   │       └── page.tsx            # Configurações globais
│   │   │
│   │   ├── (tenant-admin)/             # Admin do Cliente (Tenant)
│   │   │   ├── layout.tsx              # Layout com tema dinâmico
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx        # Analytics (churn, vendas)
│   │   │   │   ├── courses/
│   │   │   │   │   ├── page.tsx        # Lista de cursos
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx    # Criar curso
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx    # Editar curso
│   │   │   │   │       ├── modules/
│   │   │   │   │       │   ├── page.tsx            # Gerenciar módulos
│   │   │   │   │       │   └── [moduleId]/
│   │   │   │   │       │       ├── page.tsx        # Editar módulo
│   │   │   │   │       │       └── lessons/
│   │   │   │   │       │           ├── page.tsx    # Gerenciar aulas
│   │   │   │   │       │           └── [lessonId]/
│   │   │   │   │       │               └── page.tsx # Editar aula
│   │   │   │   │       └── settings/
│   │   │   │   │           └── page.tsx            # Config do curso
│   │   │   │   ├── students/
│   │   │   │   │   ├── page.tsx        # Lista de alunos
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx    # Perfil do aluno
│   │   │   │   │       └── progress/
│   │   │   │   │           └── page.tsx # Progresso detalhado
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx        # Dashboard de analytics
│   │   │   │   │   ├── churn/
│   │   │   │   │   │   └── page.tsx    # Análise de churn
│   │   │   │   │   ├── revenue/
│   │   │   │   │   │   └── page.tsx    # Receita e conversão
│   │   │   │   │   └── engagement/
│   │   │   │   │       └── page.tsx    # Engajamento dos alunos
│   │   │   │   ├── customization/
│   │   │   │   │   └── page.tsx        # Logo, cores, domínio
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx        # Preços para alunos finais
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx        # Configurações gerais
│   │   │
│   │   ├── (student)/                  # Aluno (End User) - Estilo Netflix
│   │   │   ├── layout.tsx              # Layout imersivo + tema dinâmico
│   │   │   ├── browse/
│   │   │   │   └── page.tsx            # Home Netflix (categorias + carrosséis)
│   │   │   ├── my-list/
│   │   │   │   └── page.tsx            # Minha Lista (favoritos)
│   │   │   ├── course/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Detalhes do curso (hero + módulos)
│   │   │   │       └── watch/
│   │   │   │           └── [lessonId]/
│   │   │   │               └── page.tsx # Player de vídeo imersivo
│   │   │   ├── certificates/
│   │   │   │   ├── page.tsx            # Lista de certificados
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Visualizar certificado
│   │   │   ├── profile/
│   │   │   │   └── page.tsx            # Perfil + XP + Conquistas
│   │   │   └── search/
│   │   │       └── page.tsx            # Busca de cursos
│   │   │
│   │   ├── api/                        # API Routes (quando necessário)
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts        # NextAuth config
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   │   └── route.ts        # Stripe webhooks
│   │   │   │   ├── vimeo/
│   │   │   │   │   └── route.ts        # Vimeo webhooks
│   │   │   │   └── n8n/
│   │   │   │       └── route.ts        # Enviar dados para N8N
│   │   │   ├── upload/
│   │   │   │   └── route.ts            # Upload de arquivos (S3/Cloudinary)
│   │   │   └── analytics/
│   │   │       └── route.ts            # Analytics em tempo real
│   │   │
│   │   └── sitemap.ts                  # Sitemap dinâmico por tenant
│   │
│   ├── actions/                        # Server Actions (Next.js 14)
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── logout.ts
│   │   ├── super-admin/
│   │   │   ├── tenants.ts              # CRUD de tenants
│   │   │   ├── plans.ts                # CRUD de planos
│   │   │   └── billing.ts              # Faturamento consolidado
│   │   ├── tenant-admin/
│   │   │   ├── courses.ts              # CRUD de cursos
│   │   │   ├── modules.ts              # CRUD de módulos
│   │   │   ├── lessons.ts              # CRUD de aulas
│   │   │   ├── students.ts             # Gerenciar alunos
│   │   │   ├── customization.ts        # Salvar tema/logo
│   │   │   └── analytics.ts            # Calcular métricas
│   │   └── student/
│   │       ├── progress.ts             # Marcar progresso
│   │       ├── favorites.ts            # Adicionar a "Minha Lista"
│   │       ├── certificates.ts         # Gerar certificado
│   │       └── comments.ts             # Comentários em aulas
│   │
│   ├── components/                     # Componentes React
│   │   ├── ui/                         # Componentes base (shadcn/ui style)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                     # Layouts reutilizáveis
│   │   │   ├── super-admin/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── header.tsx
│   │   │   ├── tenant-admin/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── header.tsx
│   │   │   └── student/
│   │   │       ├── navbar.tsx          # Navbar estilo Netflix
│   │   │       └── footer.tsx
│   │   │
│   │   ├── courses/                    # Componentes de cursos
│   │   │   ├── course-card.tsx         # Card com hover expandido
│   │   │   ├── course-carousel.tsx     # Carrossel horizontal
│   │   │   ├── course-hero.tsx         # Banner hero (detalhes)
│   │   │   ├── course-grid.tsx         # Grid de cursos
│   │   │   └── course-list.tsx         # Lista de cursos (admin)
│   │   │
│   │   ├── player/                     # Player de vídeo
│   │   │   ├── video-player.tsx        # Player Vimeo integrado
│   │   │   ├── video-controls.tsx      # Controles customizados
│   │   │   ├── video-progress.tsx      # Barra de progresso
│   │   │   └── next-lesson.tsx         # Autoplay próxima aula
│   │   │
│   │   ├── gamification/               # Elementos de gamificação
│   │   │   ├── xp-bar.tsx              # Barra de XP
│   │   │   ├── badge.tsx               # Conquistas
│   │   │   ├── certificate.tsx         # Certificado
│   │   │   └── leaderboard.tsx         # Ranking (opcional)
│   │   │
│   │   ├── analytics/                  # Dashboards e gráficos
│   │   │   ├── churn-chart.tsx         # Gráfico de churn
│   │   │   ├── revenue-chart.tsx       # Gráfico de receita
│   │   │   ├── engagement-chart.tsx    # Gráfico de engajamento
│   │   │   └── stats-card.tsx          # Cards de estatísticas
│   │   │
│   │   ├── forms/                      # Formulários reutilizáveis
│   │   │   ├── course-form.tsx
│   │   │   ├── module-form.tsx
│   │   │   ├── lesson-form.tsx
│   │   │   ├── tenant-form.tsx
│   │   │   ├── customization-form.tsx  # Form de personalização
│   │   │   └── pricing-form.tsx
│   │   │
│   │   └── providers/                  # Context Providers
│   │       ├── theme-provider.tsx      # Tema dinâmico por tenant
│   │       ├── tenant-provider.tsx     # Contexto do tenant atual
│   │       ├── auth-provider.tsx       # Autenticação
│   │       └── toast-provider.tsx      # Notificações
│   │
│   ├── lib/                            # Utilitários e configurações
│   │   ├── prisma.ts                   # Prisma Client singleton
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── stripe.ts                   # Stripe SDK
│   │   ├── vimeo.ts                    # Vimeo SDK
│   │   ├── email.ts                    # Envio de emails (Resend/SendGrid)
│   │   ├── s3.ts                       # Upload de arquivos
│   │   ├── analytics.ts                # Funções de analytics
│   │   ├── certificates.ts             # Geração de certificados (PDF)
│   │   ├── webhooks.ts                 # Helpers de webhooks
│   │   └── utils.ts                    # Funções utilitárias
│   │
│   ├── hooks/                          # Custom React Hooks
│   │   ├── use-tenant.ts               # Hook para pegar tenant atual
│   │   ├── use-theme.ts                # Hook para tema dinâmico
│   │   ├── use-progress.ts             # Hook para progresso do aluno
│   │   ├── use-debounce.ts             # Debounce (busca)
│   │   └── use-media-query.ts          # Responsividade
│   │
│   ├── types/                          # TypeScript Types
│   │   ├── index.ts                    # Exports centralizados
│   │   ├── tenant.ts                   # Types de Tenant
│   │   ├── course.ts                   # Types de Curso/Módulo/Aula
│   │   ├── user.ts                     # Types de User
│   │   ├── subscription.ts             # Types de Assinatura
│   │   └── analytics.ts                # Types de Analytics
│   │
│   ├── constants/                      # Constantes da aplicação
│   │   ├── roles.ts                    # SUPER_ADMIN, TENANT_ADMIN, STUDENT
│   │   ├── plans.ts                    # Planos de licença
│   │   ├── routes.ts                   # Rotas da aplicação
│   │   └── config.ts                   # Configs gerais
│   │
│   └── middleware/                     # Middlewares customizados
│       ├── tenant-detection.ts         # Detectar tenant (subdomain/path)
│       ├── auth-guard.ts               # Proteção de rotas
│       └── rate-limit.ts               # Rate limiting
│
└── docs/                               # Documentação do projeto
    ├── PRD.md                          # Product Requirements Document
    ├── TECHNICAL-SPEC.md               # Especificações técnicas
    ├── API.md                          # Documentação de API
    └── DEPLOYMENT.md                   # Guia de deploy
```

---

## 🔑 DECISÕES ARQUITETURAIS

### 1. Multi-tenancy Strategy
**Escolha**: Row-Level Security (RLS) com coluna `tenantId`
- Todos os registros possuem `tenantId` (FK para Tenant)
- Middleware detecta tenant via subdomain (`cliente.plataforma.com`) ou path (`plataforma.com/cliente`)
- Queries sempre filtram por `tenantId` automaticamente

**Alternativas consideradas**:
- Database per tenant (descartado: complexidade operacional)
- Schema per tenant (descartado: limites de PostgreSQL)

### 2. Autenticação Multi-nível
**Escolha**: NextAuth.js com adapter Prisma
- Suporta múltiplos roles (SUPER_ADMIN, TENANT_ADMIN, STUDENT)
- JWT com `tenantId` e `role` no token
- Sessões isoladas por tenant

**Alternativa**: Clerk (mais caro para multi-tenant, porém melhor UX)

### 3. Personalização de Tema
**Escolha**: CSS Variables + Tailwind Config dinâmico
- Tenant salva `primaryColor` e `logo` no DB
- Middleware injeta `<style>` com CSS variables no `<head>`
- Componentes usam classes Tailwind que referenciam variáveis

**Implementação**:
```css
/* globals.css */
:root {
  --color-primary: 239 68 68; /* red-500 padrão */
  --color-primary-hover: 220 38 38; /* red-600 padrão */
}

[data-tenant="cliente1"] {
  --color-primary: 59 130 246; /* blue-500 */
  --color-primary-hover: 37 99 235; /* blue-600 */
}
```

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: 'rgb(var(--color-primary) / <alpha-value>)',
      'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
    }
  }
}
```

### 4. Vídeo Hosting
**Escolha**: Vimeo Pro/Business
- DRM para proteção de conteúdo
- Player embed customizável
- Webhooks para status de upload/processamento
- Analytics de visualização

**Alternativa**: Cloudflare Stream (mais barato, mas menos features)

### 5. Analytics de Churn
**Lógica**:
- Aluno sem login há 7+ dias = "Em risco"
- Aluno sem login há 14+ dias = "Churn potencial"
- Aluno sem conclusões há 30+ dias = "Desengajado"
- Query diária rodando via Cron Job (Vercel Cron)

---

## 🎨 DESIGN SYSTEM (Estilo Netflix)

### Paleta de Cores Base
```
Background: #141414 (quase preto)
Card: #2F2F2F (cinza escuro)
Primary: Dinâmico por tenant (padrão: #E50914 - vermelho Netflix)
Text: #FFFFFF (branco)
Text Secondary: #B3B3B3 (cinza claro)
```

### Animações (Framer Motion)
- Hover em cards: Scale 1.05 + Shadow + Expand com detalhes
- Transição de página: Fade in/out
- Carrossel: Smooth scroll horizontal
- Player: Fade in controls on hover

### Tipografia
```
Fonte: Inter (fallback para system-ui)
Hero Title: 4rem (font-bold)
Card Title: 1.125rem (font-semibold)
Body: 0.875rem (font-normal)
```

---

## 🔐 SEGURANÇA

1. **Row-Level Security**: Todas as queries filtram por `tenantId`
2. **RBAC**: Middleware valida role antes de renderizar rota
3. **API Protection**: Server Actions validam tenant + role
4. **Stripe Webhook Verification**: Validação de assinatura
5. **Rate Limiting**: 100 req/min por IP (Upstash Redis)
6. **XSS Prevention**: Sanitização de inputs (Zod)
7. **CSRF**: NextAuth CSRF tokens automáticos

---

## 📊 ANALYTICS & TRACKING

### Métricas do Tenant Admin
- Total de alunos ativos
- Taxa de conclusão de cursos
- Receita mensal/anual (MRR/ARR)
- Churn rate
- Aulas mais assistidas
- Horários de pico de acesso

### Métricas do Super Admin
- Total de tenants ativos
- MRR consolidado
- Churn de tenants
- Custo de aquisição por tenant (CAC)

**Implementação**: PostgreSQL queries otimizadas + Cache Redis (opcional)

---

## 🚀 PERFORMANCE

1. **ISR (Incremental Static Regeneration)**:
   - Landing pages revalidadas a cada 1 hora
   - Páginas de curso revalidadas a cada 5 minutos

2. **Image Optimization**:
   - Next.js Image component
   - Thumbnails em WebP
   - Lazy loading

3. **Code Splitting**:
   - Rotas separadas por grupo (admin, student)
   - Dynamic imports para player de vídeo

4. **Database Indexing**:
   - Index em `tenantId` (todas as tabelas)
   - Index composto em `userId + tenantId`
   - Index em `courseId + progress` (analytics)

---

## 📦 INTEGRAÇÕES

### Stripe
- Webhooks: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- Produtos: Planos de licença (Super Admin) + Planos para alunos (Tenant Admin)

### Vimeo
- Upload via Vimeo API (tus protocol)
- Webhooks: `video.upload.complete`, `video.transcode.complete`
- Player: Vimeo Player SDK com custom controls

### N8N
- Webhook disparado em eventos:
  - Novo aluno registrado
  - Curso concluído
  - Certificado gerado
  - Churn detectado

---

Essa arquitetura suporta escalabilidade horizontal e está pronta para receber o schema Prisma completo na próxima entrega! 🚀
