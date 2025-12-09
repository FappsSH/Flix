# Flix Platform - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
6. [Execução do Projeto](#execução-do-projeto)
7. [Arquitetura](#arquitetura)
8. [Guia de Componentes](#guia-de-componentes)
9. [Banco de Dados e Migrações](#banco-de-dados-e-migrações)
10. [Autenticação e Autorização](#autenticação-e-autorização)
11. [Multi-tenancy](#multi-tenancy)
12. [Sistema de Temas](#sistema-de-temas)
13. [Integrações Externas](#integrações-externas)
14. [Deployment](#deployment)

---

## 🎯 Visão Geral

**Flix Platform** é uma plataforma multi-tenant de cursos online estilo Netflix, construída com as mais modernas tecnologias web. A plataforma permite que múltiplos clientes (tenants) tenham suas próprias instâncias personalizadas, com temas customizados, domínios próprios e gestão completa de cursos e alunos.

### Tecnologias Principais

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js** (Autenticação)
- **Stripe** (Pagamentos)
- **Vimeo** (Player de vídeos)

### Características Principais

- ✅ Multi-tenancy com isolamento de dados
- ✅ 3 níveis de usuários (Super Admin, Tenant Admin, Student)
- ✅ Temas whitelabel customizáveis por tenant
- ✅ Domínios/subdomínios personalizados
- ✅ Interface Netflix-style com Framer Motion
- ✅ Sistema de gamificação (XP, níveis, certificados)
- ✅ Player de vídeo customizado (Vimeo)
- ✅ Sistema de comentários e interação

---

## 💻 Requisitos do Sistema

### Software Necessário

- **Node.js** 18.17 ou superior
- **npm** ou **yarn** ou **pnpm**
- **PostgreSQL** 14 ou superior
- **Git**

### Contas de Serviços Externos (Opcional para desenvolvimento)

- Stripe Account (para pagamentos)
- Vimeo Account (para vídeos)
- AWS S3 Account (para uploads)
- Resend Account (para emails)

---

## 🚀 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd Flix
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (veja [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)).

### 4. Configure o Banco de Dados

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate dev

# (Opcional) Popule o banco com dados de exemplo
npx prisma db seed
```

### 5. Execute o Projeto

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`.

---

## 📁 Estrutura de Pastas

```
Flix/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Script de seed (dados iniciais)
│
├── public/                    # Arquivos públicos estáticos
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── actions/               # Server Actions (Next.js 14)
│   │   ├── super-admin/       # Actions do Super Admin
│   │   │   ├── dashboard.ts   # Métricas e dashboard
│   │   │   ├── tenants.ts     # CRUD de tenants
│   │   │   └── plans.ts       # CRUD de planos
│   │   │
│   │   └── student/           # Actions dos alunos
│   │       ├── courses.ts     # Listagem de cursos
│   │       ├── progress.ts    # Progresso e XP
│   │       └── comments.ts    # Comentários
│   │
│   ├── app/                   # Next.js App Router
│   │   ├── (super-admin)/     # Grupo de rotas Super Admin
│   │   │   ├── layout.tsx     # Layout com autenticação
│   │   │   └── super-admin/
│   │   │       ├── dashboard/
│   │   │       ├── tenants/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   └── [id]/  # Detalhes do tenant
│   │   │       └── plans/
│   │   │
│   │   ├── (student)/         # Grupo de rotas Student
│   │   │   ├── layout.tsx     # Layout com tema dinâmico
│   │   │   ├── browse/        # Página principal
│   │   │   └── watch/
│   │   │       └── [lessonId]/
│   │   │
│   │   ├── api/               # API Routes
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │
│   │   ├── globals.css        # Estilos globais + CSS variables
│   │   └── layout.tsx         # Layout raiz
│   │
│   ├── components/            # Componentes React
│   │   ├── layout/            # Componentes de layout
│   │   │   └── super-admin/
│   │   │       ├── sidebar.tsx
│   │   │       └── header.tsx
│   │   │
│   │   ├── super-admin/       # Componentes do Super Admin
│   │   │   ├── stats-card.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── tenants-list.tsx
│   │   │   ├── tenant-form.tsx
│   │   │   ├── tenant-details-client.tsx
│   │   │   ├── tenant-edit-modal.tsx
│   │   │   ├── plans-client.tsx
│   │   │   └── plan-form-modal.tsx
│   │   │
│   │   ├── student/           # Componentes do aluno
│   │   │   ├── navbar.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── course-card.tsx
│   │   │   ├── course-row.tsx
│   │   │   └── vimeo-player.tsx
│   │   │
│   │   └── ui/                # Componentes UI base
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── tabs.tsx
│   │
│   ├── constants/             # Constantes da aplicação
│   │   └── index.ts
│   │
│   ├── lib/                   # Bibliotecas e utilitários
│   │   ├── auth.ts            # Configuração NextAuth
│   │   ├── prisma.ts          # Cliente Prisma singleton
│   │   ├── tenant.ts          # Detecção de tenant
│   │   ├── theme.ts           # Geração de temas
│   │   └── utils.ts           # Funções utilitárias
│   │
│   └── types/                 # Definições de tipos TypeScript
│       ├── tenant.ts
│       └── next-auth.d.ts
│
├── docs/                      # Documentação adicional
│   └── TECHNICAL-REQUIREMENTS.md
│
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
├── next.config.js             # Configuração do Next.js
├── tailwind.config.ts         # Configuração do Tailwind
├── tsconfig.json              # Configuração do TypeScript
├── package.json
├── ARCHITECTURE.md            # Arquitetura do projeto
├── DOCUMENTATION.md           # Este arquivo
└── README.md                  # Introdução do projeto
```

### Convenções de Organização

#### `/actions` - Server Actions

- **Por domínio**: Organize por contexto (super-admin, student, tenant-admin)
- **Nomenclatura**: Use verbos descritivos (getTenants, createCourse, updateProgress)
- **Validação**: Use Zod schemas para validar inputs
- **Retorno**: Sempre retorne `{ success: boolean, data?: T, error?: string }`

#### `/components` - Componentes React

- **Por contexto**: Organize por onde são usados (super-admin, student, ui)
- **Nomenclatura**: PascalCase para componentes
- **Client/Server**: Marque componentes client com `'use client'` apenas quando necessário
- **Exportação**: Use named exports para componentes

#### `/lib` - Bibliotecas e Utilitários

- Funções reutilizáveis
- Configurações de bibliotecas externas
- Helpers e utilities

---

## ⚙️ Configuração de Variáveis de Ambiente

### Variáveis Essenciais (Obrigatórias)

#### Database

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flix_platform?schema=public"
```

**Como obter:**
1. Instale PostgreSQL localmente ou use um serviço cloud (Neon, Supabase, Railway)
2. Crie um database chamado `flix_platform`
3. Substitua `user`, `password`, `localhost`, `5432` com suas credenciais

#### NextAuth

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

**Como obter:**
- `NEXTAUTH_URL`: URL base da sua aplicação
- `NEXTAUTH_SECRET`: Gere com: `openssl rand -base64 32`

#### Super Admin Inicial

```env
SUPER_ADMIN_EMAIL="admin@yourplatform.com"
SUPER_ADMIN_PASSWORD="change-me-in-production"
SUPER_ADMIN_NAME="Super Admin"
```

Estas credenciais serão usadas para criar o primeiro usuário Super Admin ao executar o seed.

### Variáveis do Stripe (Pagamentos)

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Como obter:**
1. Crie uma conta em [stripe.com](https://stripe.com)
2. Acesse **Developers → API Keys**
3. Copie a **Secret key** (sk_test_...) e **Publishable key** (pk_test_...)
4. Para webhook secret:
   - Acesse **Developers → Webhooks**
   - Clique em **Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Eventos: Selecione `customer.subscription.*`
   - Copie o **Signing secret**

### Variáveis do Vimeo (Vídeos)

```env
VIMEO_ACCESS_TOKEN="your-vimeo-access-token"
VIMEO_CLIENT_ID="your-vimeo-client-id"
VIMEO_CLIENT_SECRET="your-vimeo-client-secret"
```

**Como obter:**
1. Crie uma conta em [vimeo.com](https://vimeo.com)
2. Acesse **Settings → Apps → New App**
3. Preencha os dados do app
4. Em **Authentication**, gere um **Access Token**
5. Marque os scopes necessários: `public`, `private`, `video_files`
6. Copie: **Client ID**, **Client Secret**, e **Access Token**

**Importante:** Para usar vídeos no player customizado:
- Os vídeos devem estar no modo "Unlisted" ou "Public"
- Habilite "Embed" nas configurações de privacidade do vídeo
- Copie o **Video ID** do Vimeo (exemplo: `123456789`)

### Variáveis da AWS S3 (Upload de Arquivos - Opcional)

```env
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="flix-platform-uploads"
```

**Como obter:**
1. Crie uma conta [AWS](https://aws.amazon.com)
2. Acesse **IAM → Users → Create User**
3. Adicione permissões: `AmazonS3FullAccess`
4. Crie **Access Keys** e copie
5. Acesse **S3**, crie um bucket com o nome desejado
6. Configure CORS no bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Variáveis de Email (Opcional)

#### Opção 1: Resend (Recomendado)

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourplatform.com"
```

**Como obter:**
1. Crie uma conta em [resend.com](https://resend.com)
2. Acesse **API Keys → Create API Key**
3. Configure seu domínio em **Domains**

#### Opção 2: SendGrid

```env
SENDGRID_API_KEY="SG..."
EMAIL_FROM="noreply@yourplatform.com"
```

### Variáveis Opcionais

#### Redis (Cache)

```env
REDIS_URL="redis://localhost:6379"
# Ou Upstash Redis (recomendado para Vercel)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

#### Analytics

```env
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
FACEBOOK_PIXEL_ID="your-pixel-id"
```

---

## 🏃‍♂️ Execução do Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

Abre em: `http://localhost:3000`

### Build de Produção

```bash
npm run build
npm start
```

### Linting e Formatação

```bash
# Verificar erros de lint
npm run lint

# Verificar tipos TypeScript
npm run type-check

# Formatar código (se configurado)
npm run format
```

### Comandos do Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migração
npx prisma migrate dev --name nome-da-migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Resetar banco (CUIDADO: apaga tudo)
npx prisma migrate reset

# Seed (popular com dados iniciais)
npx prisma db seed
```

---

## 🏗️ Arquitetura

### Visão Geral

A plataforma segue uma arquitetura **multi-tenant com Row-Level Security (RLS)**, onde cada registro no banco de dados pertence a um tenant específico, identificado pelo campo `tenantId`.

### Níveis de Usuários

1. **Super Admin**
   - Gerencia todos os tenants
   - Cria e edita planos de assinatura
   - Acessa métricas globais (MRR, ARR, usuários)
   - Rotas: `/super-admin/*`

2. **Tenant Admin**
   - Gerencia seu próprio tenant
   - Cria cursos, módulos, aulas
   - Gerencia alunos e matrículas
   - Rotas: `/admin/*`

3. **Student**
   - Assiste aulas
   - Comenta e interage
   - Ganha XP e certificados
   - Rotas: `/browse`, `/watch/*`

### Fluxo de Autenticação

```
1. Usuário faz login → NextAuth valida credenciais
2. NextAuth gera JWT com: userId, role, tenantId
3. Middleware detecta tenant (subdomain/domain)
4. Sessão + Tenant Context → Acesso à aplicação
```

### Isolamento de Dados (Multi-tenancy)

Todas as queries incluem filtro por `tenantId`:

```typescript
// Exemplo em actions
const courses = await prisma.course.findMany({
  where: {
    tenantId: session.user.tenantId, // Sempre filtrar
    deletedAt: null,
  },
})
```

---

## 🎨 Guia de Componentes

### Como Adicionar um Novo Componente

#### 1. Componente UI Base (Reutilizável)

Localização: `src/components/ui/`

Exemplo: Criar um componente `tooltip.tsx`

```typescript
// src/components/ui/tooltip.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
            side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
            side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
            side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2'
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
```

**Uso:**

```typescript
import { Tooltip } from '@/components/ui/tooltip'

<Tooltip content="Clique para editar" side="top">
  <Button>Editar</Button>
</Tooltip>
```

#### 2. Componente de Domínio (Específico)

Localização: `src/components/[contexto]/`

Exemplo: Criar card de estatísticas do tenant

```typescript
// src/components/super-admin/tenant-stats-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface TenantStatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function TenantStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: TenantStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}% desde o último mês
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

**Uso:**

```typescript
import { TenantStatsCard } from '@/components/super-admin/tenant-stats-card'
import { Users } from 'lucide-react'

<TenantStatsCard
  title="Total de Alunos"
  value={1234}
  icon={Users}
  description="Ativos nos últimos 30 dias"
  trend={{ value: 12.5, isPositive: true }}
/>
```

### Padrões de Design a Seguir

#### 1. Cores e Temas

Use as CSS variables definidas em `globals.css`:

```css
/* Cores principais */
bg-primary              /* Cor primária do tenant */
text-primary            /* Texto na cor primária */
border-primary          /* Borda na cor primária */

/* Cores neutras */
bg-background           /* Fundo principal (#0A0A0A) */
bg-background-card      /* Fundo de cards (#141414) */
text-text               /* Texto principal (branco) */
text-text-secondary     /* Texto secundário (cinza) */
text-text-muted         /* Texto esmaecido */
bg-secondary            /* Fundo secundário */
```

#### 2. Espaçamento

Use a escala do Tailwind:

```tsx
// Espaçamento interno (padding)
p-4    // 1rem (16px)
p-6    // 1.5rem (24px)
px-4   // horizontal
py-2   // vertical

// Espaçamento externo (margin)
m-4    // 1rem (16px)
mb-6   // margin-bottom: 1.5rem
gap-4  // gap em flex/grid
```

#### 3. Tipografia

```tsx
// Títulos
text-3xl font-bold      // H1
text-2xl font-bold      // H2
text-xl font-semibold   // H3
text-lg font-medium     // H4

// Corpo
text-base               // Normal (16px)
text-sm                 // Pequeno (14px)
text-xs                 // Extra pequeno (12px)
```

#### 4. Animações com Framer Motion

**Hover Scale (Netflix-style):**

```tsx
import { motion } from 'framer-motion'

<motion.div
  whileHover={{
    scale: 1.05,
    zIndex: 50,
    transition: { duration: 0.3 }
  }}
>
  {/* Conteúdo */}
</motion.div>
```

**Fade In:**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Conteúdo */}
</motion.div>
```

**Stagger Children:**

```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### 5. Responsividade

Use breakpoints do Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 coluna mobile, 2 tablet, 3 desktop */}
</div>

<div className="hidden md:block">
  {/* Oculto no mobile, visível no tablet+ */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Tipografia responsiva */}
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🗄️ Banco de Dados e Migrações

### Schema Principal

O schema completo está em `prisma/schema.prisma`. Principais modelos:

- **Tenant**: Representa cada cliente da plataforma
- **Plan**: Planos de assinatura
- **Subscription**: Assinaturas ativas/trial
- **User**: Usuários (Super Admin, Tenant Admin, Student)
- **Course**: Cursos
- **Module**: Módulos dentro de cursos
- **Lesson**: Aulas dentro de módulos
- **Enrollment**: Matrícula de aluno em curso
- **Progress**: Progresso do aluno em cada aula
- **Certificate**: Certificados emitidos
- **Comment**: Comentários em aulas

### Executar Migrações

```bash
# Desenvolvimento (cria migração e aplica)
npx prisma migrate dev --name nome_da_migracao

# Produção (apenas aplica migrações pendentes)
npx prisma migrate deploy
```

### Seed (Popular Dados Iniciais)

O arquivo `prisma/seed.ts` cria:
- Super Admin inicial
- 3 Planos (Básico, Profissional, Enterprise)
- Tenant de exemplo
- Cursos e aulas de demonstração

Execute:

```bash
npx prisma db seed
```

### Prisma Studio (GUI)

Para visualizar e editar dados:

```bash
npx prisma studio
```

Abre em: `http://localhost:5555`

---

## 🔐 Autenticação e Autorização

### NextAuth.js

Configuração em: `src/lib/auth.ts`

#### Providers

- **Credentials**: Email + Password (bcrypt)
- **Google** (opcional, pode adicionar)
- **GitHub** (opcional, pode adicionar)

#### Callbacks

**JWT Callback:**
Adiciona `role` e `tenantId` ao token JWT.

**Session Callback:**
Expõe `role` e `tenantId` na sessão do cliente.

### Proteger Rotas

#### Em Layouts (Server Component)

```typescript
// src/app/(student)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/unauthorized')
  }

  return <>{children}</>
}
```

#### Em Server Actions

```typescript
// src/actions/student/courses.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCourses() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STUDENT') {
    throw new Error('Não autorizado')
  }

  // ... lógica
}
```

#### Em Componentes Client

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export function ProtectedComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return <div>Conteúdo protegido</div>
}
```

---

## 🏢 Multi-tenancy

### Estratégias de Detecção

O sistema suporta 3 estratégias (configurável em `src/lib/tenant.ts`):

#### 1. Subdomain (Padrão)

```
empresa1.seudominio.com → Tenant: empresa1
empresa2.seudominio.com → Tenant: empresa2
```

#### 2. Path

```
seudominio.com/empresa1 → Tenant: empresa1
seudominio.com/empresa2 → Tenant: empresa2
```

#### 3. Custom Domain

```
cursos.empresa1.com → Tenant: empresa1 (domínio customizado)
cursos.empresa2.com → Tenant: empresa2 (domínio customizado)
```

### Implementação

**Detecção no Middleware:**

```typescript
// middleware.ts (se implementado)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Extrair subdomain
  const subdomain = hostname.split('.')[0]

  // Adicionar ao header para uso posterior
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-subdomain', subdomain)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
```

**Uso em Layouts/Pages:**

```typescript
// src/app/(student)/layout.tsx
import { headers } from 'next/headers'
import { getTenantBySubdomain } from '@/lib/tenant'

export default async function Layout({ children }) {
  const headersList = headers()
  const subdomain = headersList.get('x-tenant-subdomain')

  const tenant = await getTenantBySubdomain(subdomain)

  if (!tenant) {
    return <div>Tenant não encontrado</div>
  }

  return (
    <div data-tenant={tenant.slug}>
      {/* Injetar tema do tenant */}
      {children}
    </div>
  )
}
```

### Isolamento de Dados

**SEMPRE filtrar por tenantId:**

```typescript
// ❌ ERRADO (vaza dados entre tenants)
const courses = await prisma.course.findMany()

// ✅ CORRETO
const courses = await prisma.course.findMany({
  where: {
    tenantId: session.user.tenantId,
    deletedAt: null,
  },
})
```

---

## 🎨 Sistema de Temas

### Como Funciona

Cada tenant tem cores customizadas (`primaryColor`, `secondaryColor`, `fontFamily`) que são injetadas como CSS variables.

### Geração de Tema

Arquivo: `src/lib/theme.ts`

```typescript
const theme = generateTenantTheme(tenant)
// Retorna:
// {
//   primary: { default: '229 9 20', hover: '194 7 16', ... },
//   secondary: { default: '178 7 16', ... },
//   fontFamily: 'Inter'
// }

const css = generateThemeCSS(theme)
// Gera string CSS com variáveis
```

### Injeção no Layout

```typescript
// src/app/(student)/layout.tsx
import { generateTenantTheme, generateThemeCSS } from '@/lib/theme'

export default async function Layout({ children }) {
  const tenant = await getTenant()
  const theme = generateTenantTheme(tenant)
  const themeCSS = generateThemeCSS(theme)

  return (
    <div data-tenant={tenant.slug}>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      {children}
    </div>
  )
}
```

### Usar Cores no Tailwind

```tsx
<div className="bg-primary text-white">
  <button className="bg-primary-hover">Hover me</button>
</div>
```

### Adicionar Novas Cores

1. Adicione campo no model `Tenant`:

```prisma
model Tenant {
  // ...
  accentColor String @default("#FF5733")
}
```

2. Atualize `generateTenantTheme()`:

```typescript
export function generateTenantTheme(tenant: Tenant) {
  return {
    primary: generateColorVariations(tenant.primaryColor),
    secondary: generateColorVariations(tenant.secondaryColor),
    accent: generateColorVariations(tenant.accentColor), // Novo
    fontFamily: tenant.fontFamily,
  }
}
```

3. Atualize `tailwind.config.ts`:

```typescript
colors: {
  accent: {
    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
    hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
  }
}
```

---

## 🔌 Integrações Externas

### Stripe (Pagamentos)

#### Criar Checkout Session

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price: 'price_xxxxxxxxxxxxx', // Price ID do plano
      quantity: 1,
    },
  ],
  mode: 'subscription',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
  customer_email: user.email,
  metadata: {
    tenantId: tenant.id,
    userId: user.id,
  },
})

// Redirecionar para session.url
```

#### Webhook (Receber Eventos)

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Webhook signature verification failed', {
      status: 400,
    })
  }

  // Processar eventos
  switch (event.type) {
    case 'customer.subscription.created':
      // Ativar assinatura
      break
    case 'customer.subscription.updated':
      // Atualizar status
      break
    case 'customer.subscription.deleted':
      // Cancelar assinatura
      break
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
```

### Vimeo (Vídeos)

#### Buscar Informações do Vídeo

```typescript
const response = await fetch(
  `https://api.vimeo.com/videos/${videoId}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
    },
  }
)

const data = await response.json()
// data.duration, data.name, data.pictures, etc.
```

#### Embed Player

```tsx
<iframe
  src={`https://player.vimeo.com/video/${videoId}?h=${hash}`}
  width="100%"
  height="100%"
  frameBorder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
></iframe>
```

---

## 🚀 Deployment

### Vercel (Recomendado)

1. **Push para GitHub/GitLab/Bitbucket**

2. **Conectar no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório
   - Configure as variáveis de ambiente

3. **Environment Variables no Vercel:**
   - Copie todas as variáveis do `.env`
   - Cole em **Settings → Environment Variables**
   - Marque para todos os ambientes (Production, Preview, Development)

4. **Deploy:**
   - Vercel detecta Next.js automaticamente
   - Build command: `npm run build`
   - Output directory: `.next`

5. **Domain Configuration:**
   - **Subdomínios Wildcard**: Configure `*.yourdomain.com` apontando para Vercel
   - **Custom Domains**: Adicione cada domínio manualmente no Vercel

### Railway / Render

Similar ao Vercel:
1. Conecte repositório
2. Configure environment variables
3. Deploy

### Docker (Self-hosted)

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build e run:

```bash
docker build -t flix-platform .
docker run -p 3000:3000 --env-file .env flix-platform
```

---

## 📚 Recursos Adicionais

### Documentação das Tecnologias

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe API](https://stripe.com/docs/api)
- [Vimeo API](https://developer.vimeo.com/)

### Arquivos de Referência

- `ARCHITECTURE.md` - Arquitetura detalhada do sistema
- `docs/TECHNICAL-REQUIREMENTS.md` - Requisitos técnicos
- `README.md` - Introdução e quick start

---

## 🐛 Troubleshooting

### Erro: "Prisma Client não foi gerado"

```bash
npx prisma generate
```

### Erro: "Database connection failed"

Verifique:
- PostgreSQL está rodando?
- `DATABASE_URL` está correto?
- Firewall bloqueando conexão?

### Erro: "NextAuth session undefined"

Verifique:
- `NEXTAUTH_SECRET` está configurado?
- `NEXTAUTH_URL` está correto?
- Cookie bloqueado? (limpe cookies do navegador)

### Erro: "Module not found"

```bash
# Limpe cache e reinstale
rm -rf node_modules .next
npm install
```

### Vídeos do Vimeo não carregam

Verifique:
- `VIMEO_ACCESS_TOKEN` está correto?
- Vídeo está "Unlisted" ou "Public"?
- Embed está habilitado nas configurações de privacidade?

---

## 🤝 Contribuindo

Ao adicionar novas funcionalidades:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Siga os padrões de código estabelecidos
3. Adicione testes se aplicável
4. Atualize a documentação
5. Faça commit: `git commit -m "feat: adiciona nova funcionalidade"`
6. Push: `git push origin feature/nova-funcionalidade`
7. Abra um Pull Request

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

**Última atualização:** 2025-12-09

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.
