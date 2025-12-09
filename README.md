# 🎬 Flix Platform - Plataforma de Cursos Whitelabel Multi-Tenant

> Plataforma de cursos online estilo Netflix com arquitetura multi-tenant. Permite que você crie e gerencie múltiplas escolas online whitelabel com personalização completa.

---

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Video**: Vimeo API
- **Storage**: AWS S3 (ou Cloudinary)
- **Email**: Resend (ou SendGrid)

---

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn
- Conta Stripe (para pagamentos)
- Conta Vimeo Pro/Business (para vídeos)
- Conta AWS (para upload de arquivos)

---

## 🛠️ Setup do Projeto

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd flix-platform
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flix_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-um-secret-seguro-aqui"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Vimeo
VIMEO_ACCESS_TOKEN="seu-token-vimeo"

# AWS S3
AWS_ACCESS_KEY_ID="seu-access-key"
AWS_SECRET_ACCESS_KEY="seu-secret-key"
AWS_S3_BUCKET="seu-bucket"

# Email
RESEND_API_KEY="re_..."
```

### 4. Configure o banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular banco com dados iniciais
npm run prisma:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 👥 Credenciais Padrão (após seed)

### Super Admin
- **Email**: admin@flix.com
- **Senha**: admin123
- **Acesso**: http://localhost:3000/super-admin

### Tenant Admin (Demo)
- **Email**: admin@demo.com
- **Senha**: demo123
- **Acesso**: http://demo.localhost:3000/admin

### Aluno (Demo)
- **Email**: student@demo.com
- **Senha**: student123
- **Acesso**: http://demo.localhost:3000/browse

---

## 🏗️ Estrutura de Diretórios

```
flix-platform/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── migrations/            # Migrations
│   └── seed.ts                # Seed de dados
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (super-admin)/     # Rotas do Super Admin
│   │   ├── (tenant-admin)/    # Rotas do Admin do Tenant
│   │   ├── (student)/         # Rotas do Aluno (Netflix UI)
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilitários e configs
│   │   ├── prisma.ts          # Prisma Client
│   │   ├── tenant.ts          # Funções de tenant
│   │   └── theme.ts           # Funções de tema
│   ├── types/                 # TypeScript types
│   ├── constants/             # Constantes
│   └── hooks/                 # Custom hooks
└── middleware.ts              # Middleware (tenant detection)
```

---

## 🎨 Personalização de Tema (Whitelabel)

### Como funciona:

1. **Tenant salva cores no DB** (via Admin → Customização)
2. **Middleware detecta tenant** (por subdomínio, domínio ou path)
3. **Middleware injeta CSS variables** no `<head>`
4. **Componentes usam classes Tailwind** que referenciam as variáveis

### Exemplo de uso:

```tsx
// Componente usa classes Tailwind genéricas
<button className="bg-primary hover:bg-primary-hover">
  Clique aqui
</button>

// CSS Variables são injetadas dinamicamente:
// [data-tenant="demo"] {
//   --color-primary: 229 9 20; (vermelho Netflix)
// }
//
// [data-tenant="academia-xyz"] {
//   --color-primary: 59 130 246; (azul)
// }
```

---

## 🔐 Multi-Tenancy & Segurança

### Estratégia:
- **Row-Level Security (RLS)**: Todos os registros possuem `tenantId`
- **Middleware**: Valida tenant + role em toda request
- **Server Actions**: Sempre filtram por `tenantId`

### Proteção de Rotas:

```typescript
// middleware.ts valida:
// 1. Tenant existe e está ativo
// 2. Usuário autenticado
// 3. Role do usuário permite acesso à rota
// 4. tenantId do usuário bate com o tenant da URL
```

### Queries seguras:

```typescript
// ❌ ERRADO (permite acesso cruzado)
const courses = await prisma.course.findMany()

// ✅ CORRETO (filtra por tenant)
const courses = await prisma.course.findMany({
  where: { tenantId: session.user.tenantId }
})
```

---

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor de desenvolvimento

# Build & Deploy
npm run build              # Build para produção
npm run start              # Inicia servidor de produção

# Database
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Executa migrations
npm run prisma:studio      # Abre Prisma Studio (GUI)
npm run prisma:seed        # Popula banco com dados

# Type checking & Linting
npm run type-check         # Verifica tipos TypeScript
npm run lint               # Executa ESLint
```

---

## 🌐 Deploy em Produção

### Vercel (Recomendado)

1. **Configure variáveis de ambiente** no dashboard da Vercel
2. **Configure PostgreSQL** (Vercel Postgres, Supabase ou Neon)
3. **Deploy**:

```bash
vercel deploy --prod
```

### Configuração de DNS (Multi-tenancy via Subdomínio)

1. **Wildcard DNS**:
   - Adicione registro CNAME: `*.seudominio.com` → `cname.vercel-dns.com`

2. **Vercel**:
   - Adicione domínio wildcard nas configurações do projeto

### Migrations em Produção

```bash
# Executar migrations
npm run prisma:migrate deploy
```

---

## 📊 Planos de Licença (Tenants)

| Plano | Preço/mês | Alunos | Cursos | Storage | Domínio | Analytics |
|-------|-----------|--------|--------|---------|---------|-----------|
| Básico | R$ 97 | 100 | 10 | 10GB | ❌ | ❌ |
| Profissional | R$ 297 | 500 | 50 | 50GB | ✅ | ✅ |
| Enterprise | R$ 997 | Ilimitado | Ilimitado | Ilimitado | ✅ | ✅ |

---

## 🎯 Roadmap

- [x] Arquitetura multi-tenant
- [x] Autenticação com roles
- [x] Personalização de tema (whitelabel)
- [x] Schema Prisma completo
- [ ] Integração Stripe (pagamentos)
- [ ] Integração Vimeo (upload de vídeos)
- [ ] Player de vídeo customizado
- [ ] Dashboard de analytics (churn, vendas)
- [ ] Sistema de gamificação (XP, certificados)
- [ ] Webhooks para N8N
- [ ] UI estilo Netflix (carrosséis, hover expandido)
- [ ] Mobile responsive
- [ ] PWA (Progressive Web App)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 🆘 Suporte

- **Documentação**: [Leia a documentação completa](./docs/)
- **Issues**: [Reporte bugs ou sugira features](https://github.com/seu-usuario/flix-platform/issues)

---

## 📚 Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vimeo API Docs](https://developer.vimeo.com/)

---

**Feito com ❤️ usando Next.js 14, TypeScript e Tailwind CSS**
