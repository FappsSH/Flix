# 📋 TECHNICAL REQUIREMENTS DOCUMENT (TRD)
## Plataforma de Cursos Whitelabel Multi-Tenant - Netflix Style

---

## 🎨 1. PERSONALIZAÇÃO DINÂMICA DE CORES (WHITELABEL)

### 1.1 Requisito de Negócio
Cada Tenant (cliente whitelabel) pode personalizar:
- **Cor Primária**: Botões, links, highlights, progress bars
- **Cor Secundária**: Backgrounds, cards, hovers
- **Logo**: Navbar e favicon
- **Fonte**: Tipografia customizada

**Objetivo**: Cada aluno deve ver a plataforma com a identidade visual do seu tenant, sem necessidade de rebuild.

---

### 1.2 Solução Técnica: CSS Variables + Tailwind Config

#### **Arquitetura**
```
1. Tenant salva cores no DB (Prisma)
   ↓
2. Middleware detecta tenant (subdomain/path)
   ↓
3. Middleware injeta CSS variables no <head>
   ↓
4. Componentes usam classes Tailwind que referenciam CSS vars
   ↓
5. Tema dinâmico aplicado sem rebuild
```

---

### 1.3 Implementação Detalhada

#### **PASSO 1: Schema Prisma (Já definido)**
```prisma
model Tenant {
  // ...
  primaryColor   String @default("#E50914") // Hex
  secondaryColor String @default("#141414")
  logo           String?
  favicon        String?
  fontFamily     String @default("Inter")
  // ...
}
```

---

#### **PASSO 2: Tailwind Config (tailwind.config.ts)**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores dinâmicas por tenant (usando CSS variables)
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          hover: 'rgb(var(--color-secondary-hover) / <alpha-value>)',
        },
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          card: 'rgb(var(--color-background-card) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-family)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

---

#### **PASSO 3: Globals CSS (src/app/globals.css)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================
   CSS VARIABLES - TEMA PADRÃO (NETFLIX STYLE)
   ============================================ */
:root {
  /* Primary Color (Vermelho Netflix por padrão) */
  --color-primary: 229 9 20; /* #E50914 */
  --color-primary-hover: 197 8 17; /* Mais escuro */
  --color-primary-light: 255 51 66; /* Mais claro */
  --color-primary-dark: 153 6 12; /* Mais escuro */

  /* Secondary Color (Cinza escuro) */
  --color-secondary: 47 47 47; /* #2F2F2F */
  --color-secondary-hover: 64 64 64; /* Mais claro */

  /* Background */
  --color-background: 20 20 20; /* #141414 (quase preto) */
  --color-background-card: 47 47 47; /* #2F2F2F */

  /* Text */
  --color-text: 255 255 255; /* #FFFFFF */
  --color-text-secondary: 179 179 179; /* #B3B3B3 */

  /* Font Family */
  --font-family: 'Inter', sans-serif;
}

/* ============================================
   TEMA POR TENANT (Injetado dinamicamente)
   ============================================ */
/* Exemplo de tema injetado no <head> pelo middleware:

[data-tenant="academia-xyz"] {
  --color-primary: 59 130 246; /* #3B82F6 (azul) */
  --color-primary-hover: 37 99 235;
  --color-primary-light: 96 165 250;
  --color-primary-dark: 29 78 216;

  --color-secondary: 30 58 138;
  --color-secondary-hover: 30 64 175;

  --font-family: 'Roboto', sans-serif;
}
*/

/* ============================================
   UTILITÁRIOS GLOBAIS
   ============================================ */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-text font-sans antialiased;
  }
}

@layer utilities {
  /* Hover com escala (estilo Netflix) */
  .hover-scale {
    @apply transition-transform duration-300 ease-out hover:scale-105;
  }

  /* Card com hover expandido */
  .netflix-card-hover {
    @apply transition-all duration-300 ease-out hover:scale-110 hover:z-10 hover:shadow-2xl;
  }

  /* Scroll horizontal suave (carrossel) */
  .scroll-smooth-horizontal {
    @apply overflow-x-auto overflow-y-hidden scroll-smooth;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  .scroll-smooth-horizontal::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
}
```

---

#### **PASSO 4: Middleware (middleware.ts)**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Função para detectar tenant
async function detectTenant(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // ESTRATÉGIA 1: Subdomínio (ex: academia-xyz.plataforma.com)
  const subdomain = hostname.split('.')[0]

  // ESTRATÉGIA 2: Path (ex: plataforma.com/academia-xyz)
  const pathSegments = request.nextUrl.pathname.split('/')
  const pathTenant = pathSegments[1] // Primeiro segmento do path

  // ESTRATÉGIA 3: Domínio customizado (ex: cursos.academiaxyz.com)
  let tenant = null

  // Tenta por domínio customizado primeiro
  tenant = await prisma.tenant.findUnique({
    where: { domain: hostname },
    select: {
      id: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true,
      logo: true,
      fontFamily: true,
      isActive: true,
    },
  })

  // Se não encontrou, tenta por subdomínio
  if (!tenant && subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    tenant = await prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        slug: true,
        primaryColor: true,
        secondaryColor: true,
        logo: true,
        fontFamily: true,
        isActive: true,
      },
    })
  }

  // Se não encontrou, tenta por path (fallback)
  if (!tenant && pathTenant) {
    tenant = await prisma.tenant.findUnique({
      where: { slug: pathTenant },
      select: {
        id: true,
        slug: true,
        primaryColor: true,
        secondaryColor: true,
        logo: true,
        fontFamily: true,
        isActive: true,
      },
    })
  }

  return tenant
}

// Função para converter HEX para RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0 0'

  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)

  return `${r} ${g} ${b}`
}

// Função para gerar variações de cor
function generateColorVariations(hex: string) {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.split(' ').map(Number)

  // Hover (mais escuro - reduz 15%)
  const hoverR = Math.max(0, Math.floor(r * 0.85))
  const hoverG = Math.max(0, Math.floor(g * 0.85))
  const hoverB = Math.max(0, Math.floor(b * 0.85))

  // Light (mais claro - aumenta 20%)
  const lightR = Math.min(255, Math.floor(r * 1.2))
  const lightG = Math.min(255, Math.floor(g * 1.2))
  const lightB = Math.min(255, Math.floor(b * 1.2))

  // Dark (mais escuro - reduz 30%)
  const darkR = Math.max(0, Math.floor(r * 0.7))
  const darkG = Math.max(0, Math.floor(g * 0.7))
  const darkB = Math.max(0, Math.floor(b * 0.7))

  return {
    default: rgb,
    hover: `${hoverR} ${hoverG} ${hoverB}`,
    light: `${lightR} ${lightG} ${lightB}`,
    dark: `${darkR} ${darkG} ${darkB}`,
  }
}

export async function middleware(request: NextRequest) {
  const tenant = await detectTenant(request)

  // Se não encontrou tenant e está tentando acessar área de aluno/admin, redireciona
  if (!tenant && !request.nextUrl.pathname.startsWith('/super-admin')) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  // Se tenant está inativo, redireciona
  if (tenant && !tenant.isActive) {
    return NextResponse.redirect(new URL('/tenant-suspended', request.url))
  }

  const response = NextResponse.next()

  // Injeta CSS variables no header (via cookie para o root layout ler)
  if (tenant) {
    const primaryColors = generateColorVariations(tenant.primaryColor)
    const secondaryColors = generateColorVariations(tenant.secondaryColor)

    const themeData = {
      tenantId: tenant.id,
      slug: tenant.slug,
      colors: {
        primary: primaryColors.default,
        primaryHover: primaryColors.hover,
        primaryLight: primaryColors.light,
        primaryDark: primaryColors.dark,
        secondary: secondaryColors.default,
        secondaryHover: secondaryColors.hover,
      },
      logo: tenant.logo,
      fontFamily: tenant.fontFamily,
    }

    // Salva no cookie (para o layout raiz ler)
    response.cookies.set('tenant-theme', JSON.stringify(themeData), {
      httpOnly: false, // Precisa ser acessível no client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
    })
  }

  return response
}

// Configuração do matcher (rotas que passam pelo middleware)
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

#### **PASSO 5: Root Layout (src/app/layout.tsx)**
```typescript
import { cookies } from 'next/headers'
import { Inter, Roboto } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Lê o cookie do tenant
  const cookieStore = cookies()
  const tenantThemeCookie = cookieStore.get('tenant-theme')

  let tenantTheme = null
  if (tenantThemeCookie) {
    try {
      tenantTheme = JSON.parse(tenantThemeCookie.value)
    } catch (error) {
      console.error('Error parsing tenant theme:', error)
    }
  }

  // Monta o atributo data-tenant (para scoped CSS)
  const tenantSlug = tenantTheme?.slug || 'default'

  // CSS inline para injetar as variáveis
  const themeStyles = tenantTheme ? `
    [data-tenant="${tenantSlug}"] {
      --color-primary: ${tenantTheme.colors.primary};
      --color-primary-hover: ${tenantTheme.colors.primaryHover};
      --color-primary-light: ${tenantTheme.colors.primaryLight};
      --color-primary-dark: ${tenantTheme.colors.primaryDark};
      --color-secondary: ${tenantTheme.colors.secondary};
      --color-secondary-hover: ${tenantTheme.colors.secondaryHover};
      --font-family: ${tenantTheme.fontFamily}, sans-serif;
    }
  ` : ''

  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        {tenantTheme && (
          <>
            <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
            <link rel="icon" href={tenantTheme.logo || '/favicon.ico'} />
          </>
        )}
      </head>
      <body
        className={`${inter.variable} ${roboto.variable}`}
        data-tenant={tenantSlug}
      >
        {children}
      </body>
    </html>
  )
}
```

---

#### **PASSO 6: Exemplo de Uso nos Componentes**
```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils'

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // Usa as classes Tailwind que referenciam CSS variables
        'bg-primary hover:bg-primary-hover text-white',
        'px-6 py-3 rounded-md font-semibold',
        'transition-all duration-200 ease-out',
        'hover:scale-105 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

```typescript
// src/components/courses/course-card.tsx
export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="netflix-card-hover rounded-lg overflow-hidden bg-background-card">
      <img src={course.thumbnail} alt={course.title} />
      <div className="p-4">
        <h3 className="text-text font-semibold">{course.title}</h3>
        <p className="text-text-secondary text-sm">{course.description}</p>

        {/* Progress bar com cor primária */}
        <div className="mt-2 bg-secondary rounded-full h-1">
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

---

### 1.4 Vantagens da Solução
✅ **Sem rebuild**: Cores atualizadas em tempo real
✅ **Performance**: CSS variables são nativas do browser
✅ **Escalável**: Suporta milhares de tenants sem overhead
✅ **Type-safe**: Tailwind autocomplete funciona normalmente
✅ **SEO-friendly**: Renderizado no servidor (SSR)

---

### 1.5 Configuração Avançada: Fontes Dinâmicas
Para fontes customizadas (ex: Upload de fonte pelo tenant):

```typescript
// src/app/layout.tsx
{tenantTheme?.customFont && (
  <style dangerouslySetInnerHTML={{ __html: `
    @font-face {
      font-family: '${tenantTheme.fontFamily}';
      src: url('${tenantTheme.customFont}') format('woff2');
      font-display: swap;
    }
  ` }} />
)}
```

---

---

## 🔒 2. PROTEÇÃO DE ROTAS E MULTI-TENANCY

### 2.1 Requisito de Negócio
Cada nível de usuário tem acesso restrito:
- **Super Admin**: Acessa apenas `/super-admin/*`
- **Tenant Admin**: Acessa apenas `/admin/*` do seu tenant
- **Student**: Acessa apenas `/browse`, `/course/*`, etc. do seu tenant

**Restrições**:
- Aluno do Tenant A **NÃO** pode acessar cursos do Tenant B
- Admin do Tenant A **NÃO** pode gerenciar cursos do Tenant B
- Super Admin **NÃO** tem acesso direto aos cursos (apenas gerencia tenants)

---

### 2.2 Estratégia de Multi-tenancy

#### **Opção 1: Subdomínio (RECOMENDADO)**
```
academia-xyz.plataforma.com  → Tenant "academia-xyz"
escola-abc.plataforma.com    → Tenant "escola-abc"
super.plataforma.com         → Super Admin
```

**Vantagens**:
- ✅ Isolamento natural por DNS
- ✅ Melhor SEO (cada tenant é um "site" diferente)
- ✅ Mais fácil implementar rate limiting por tenant
- ✅ Possibilidade de domínio customizado (CNAME)

**Desvantagens**:
- ❌ Requer configuração de wildcard DNS
- ❌ Cookies não compartilhados entre subdomínios

---

#### **Opção 2: Path-based**
```
plataforma.com/academia-xyz  → Tenant "academia-xyz"
plataforma.com/escola-abc    → Tenant "escola-abc"
plataforma.com/super-admin   → Super Admin
```

**Vantagens**:
- ✅ Simples de configurar (sem DNS)
- ✅ Cookies compartilhados

**Desvantagens**:
- ❌ SEO menos eficiente
- ❌ URLs mais longas
- ❌ Dificulta domínio customizado

---

### 2.3 Implementação de Auth Guard (Middleware)

#### **middleware.ts (completo com auth)**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// Rotas públicas (sem auth)
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

// Rotas por role
const ROLE_ROUTES = {
  SUPER_ADMIN: ['/super-admin'],
  TENANT_ADMIN: ['/admin'],
  STUDENT: ['/browse', '/course', '/my-list', '/profile', '/certificates'],
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. DETECTAR TENANT (ver código anterior)
  const tenant = await detectTenant(request)

  // 2. VERIFICAR AUTENTICAÇÃO
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Se não está autenticado e não é rota pública, redireciona para login
  if (!token && !PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. VALIDAR ROLE + TENANT
  if (token) {
    const userRole = token.role as string
    const userTenantId = token.tenantId as string | null

    // Super Admin: só acessa /super-admin
    if (userRole === 'SUPER_ADMIN') {
      if (!pathname.startsWith('/super-admin')) {
        return NextResponse.redirect(new URL('/super-admin/dashboard', request.url))
      }
    }

    // Tenant Admin: só acessa /admin do seu tenant
    if (userRole === 'TENANT_ADMIN') {
      if (!pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }

      // Verifica se o tenant do token bate com o tenant da URL
      if (tenant && tenant.id !== userTenantId) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Student: só acessa rotas de aluno do seu tenant
    if (userRole === 'STUDENT') {
      const isStudentRoute = ROLE_ROUTES.STUDENT.some(route =>
        pathname.startsWith(route)
      )

      if (!isStudentRoute && !PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL('/browse', request.url))
      }

      // Verifica se o tenant do token bate com o tenant da URL
      if (tenant && tenant.id !== userTenantId) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // 4. INJETAR TEMA (ver código anterior)
  const response = NextResponse.next()

  if (tenant) {
    // ... (código de injeção de tema)
  }

  return response
}
```

---

### 2.4 Server Actions com Tenant Validation

Todas as Server Actions devem validar o `tenantId` do usuário:

```typescript
// src/actions/tenant-admin/courses.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCourse(data: CreateCourseInput) {
  // 1. Autenticar
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }

  // 2. Validar role
  if (session.user.role !== 'TENANT_ADMIN') {
    throw new Error('Forbidden: Only tenant admins can create courses')
  }

  // 3. Validar tenantId
  const tenantId = session.user.tenantId
  if (!tenantId) {
    throw new Error('Forbidden: User has no tenant')
  }

  // 4. Criar curso (SEMPRE com tenantId)
  const course = await prisma.course.create({
    data: {
      ...data,
      tenantId, // <-- CRÍTICO: sempre filtrar por tenant
    },
  })

  // 5. Revalidar cache
  revalidatePath('/admin/courses')

  return course
}

export async function updateCourse(courseId: string, data: UpdateCourseInput) {
  const session = await auth()
  if (!session?.user.tenantId) {
    throw new Error('Unauthorized')
  }

  // IMPORTANTE: Verificar se o curso pertence ao tenant do usuário
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      tenantId: session.user.tenantId, // <-- Proteção contra acesso cruzado
    },
  })

  if (!course) {
    throw new Error('Course not found or access denied')
  }

  // Atualizar
  const updated = await prisma.course.update({
    where: { id: courseId },
    data,
  })

  revalidatePath('/admin/courses')
  return updated
}
```

---

### 2.5 Queries com Tenant Isolation

**❌ ERRADO** (permite acesso cruzado):
```typescript
const courses = await prisma.course.findMany()
```

**✅ CORRETO** (filtra por tenant):
```typescript
const courses = await prisma.course.findMany({
  where: {
    tenantId: session.user.tenantId,
  },
})
```

---

### 2.6 Helper para Tenant-aware Queries

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

// Helper: Prisma client com auto-inject de tenantId
export async function getTenantPrisma() {
  const session = await auth()

  if (!session?.user.tenantId) {
    throw new Error('No tenant context')
  }

  return prisma.$extends({
    query: {
      // Intercepta todas as queries e injeta tenantId automaticamente
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId: session.user.tenantId }
          return query(args)
        },
        async createMany({ args, query }) {
          args.data = args.data.map((item: any) => ({
            ...item,
            tenantId: session.user.tenantId,
          }))
          return query(args)
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId: session.user.tenantId }
          return query(args)
        },
      },
    },
  })
}

// Uso:
// const db = await getTenantPrisma()
// const courses = await db.course.findMany() // <-- tenantId injetado automaticamente
```

---

### 2.7 NextAuth Config com Multi-tenancy

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Verificar se o tenant está ativo
        if (user.tenant && !user.tenant.isActive) {
          throw new Error('Tenant suspended')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Primeira vez (login)
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
      }

      // Update de sessão (ex: atualizar foto)
      if (trigger === 'update' && session) {
        token.name = session.user.name
        token.image = session.user.image
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string | null
      }

      return session
    },
  },
}

// Helper para server components
export async function auth() {
  return await getServerSession(authOptions)
}
```

---

### 2.8 Proteção no Client Side (Hooks)

```typescript
// src/hooks/use-auth.ts
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth(requiredRole?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/unauthorized')
    }
  }, [session, status, router, requiredRole])

  return { session, status }
}

// Uso em componentes:
// const { session } = useRequireAuth('TENANT_ADMIN')
```

---

### 2.9 Testes de Segurança (Checklist)

- [ ] Aluno do Tenant A **não consegue** acessar `/course/{id}` do Tenant B
- [ ] Admin do Tenant A **não consegue** editar curso do Tenant B via API
- [ ] Student **não consegue** acessar `/admin`
- [ ] Tenant Admin **não consegue** acessar `/super-admin`
- [ ] Super Admin **não consegue** acessar cursos diretamente (apenas via tenants)
- [ ] Queries sempre filtram por `tenantId` (usar Prisma extension)
- [ ] Webhooks Stripe validam assinatura (prevent replay attacks)
- [ ] Rate limiting por tenant (100 req/min)

---

### 2.10 Fluxo de Autenticação Completo

```
1. Usuário acessa: academia-xyz.plataforma.com/browse
   ↓
2. Middleware detecta tenant: "academia-xyz"
   ↓
3. Middleware checa JWT: não autenticado
   ↓
4. Redireciona: /login?callbackUrl=/browse
   ↓
5. Usuário faz login (email + senha)
   ↓
6. NextAuth valida credenciais
   ↓
7. NextAuth cria JWT com: { userId, role: "STUDENT", tenantId: "xyz" }
   ↓
8. Redireciona: /browse
   ↓
9. Middleware valida: role = STUDENT, tenantId = "xyz" ✅
   ↓
10. Renderiza página com tema do tenant "academia-xyz"
```

---

## 🚀 3. RESUMO DE BOAS PRÁTICAS

### Personalização de Cores
1. ✅ Usar CSS Variables + Tailwind
2. ✅ Middleware injeta tema no `<head>` via cookie
3. ✅ Root layout lê cookie e aplica `data-tenant` no `<body>`
4. ✅ Componentes usam classes Tailwind genéricas (`bg-primary`)
5. ✅ Gerar variações de cor automaticamente (hover, light, dark)

### Multi-tenancy e Segurança
1. ✅ SEMPRE filtrar queries por `tenantId`
2. ✅ Usar Prisma extension para auto-inject de `tenantId`
3. ✅ Middleware valida `role` + `tenantId` em toda request
4. ✅ Server Actions validam sessão + tenant antes de qualquer operação
5. ✅ JWT contém `userId`, `role` e `tenantId`
6. ✅ Subdomínio como estratégia principal (fallback para path)
7. ✅ Cookies com `httpOnly`, `secure` e `sameSite: lax`
8. ✅ Rate limiting por tenant (Upstash Redis)

---

## 📝 4. PRÓXIMOS PASSOS

Agora que você tem:
- ✅ Estrutura de diretórios completa
- ✅ Schema Prisma com multi-tenancy
- ✅ Solução técnica para personalização de cores
- ✅ Solução técnica para proteção de rotas

**Pode começar a implementação seguindo esta ordem**:

1. Setup do projeto (Next.js 14 + TypeScript + Tailwind)
2. Configurar Prisma + PostgreSQL
3. Implementar autenticação (NextAuth)
4. Criar middleware de tenant detection
5. Implementar personalização de tema
6. Criar layouts (Super Admin, Tenant Admin, Student)
7. Implementar CRUD de Cursos/Módulos/Aulas
8. Integrar Vimeo Player
9. Implementar gamificação (XP, certificados)
10. Integrar Stripe (pagamentos)
11. Criar dashboards de analytics
12. Implementar webhooks (N8N)

---

**🎯 Essa arquitetura suporta milhares de tenants com performance e segurança enterprise-grade!**
