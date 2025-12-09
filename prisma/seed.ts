import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================================================
  // 1. CREATE SUPER ADMIN
  // ============================================================================
  console.log('👤 Creating Super Admin...')

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@flix.com'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Super Admin created: ${superAdmin.email}`)

  // ============================================================================
  // 2. CREATE PLANS (Planos de licença para Tenants)
  // ============================================================================
  console.log('💳 Creating subscription plans...')

  const plans = [
    {
      name: 'Básico',
      description: 'Ideal para começar sua plataforma de cursos',
      setupFee: 0,
      monthlyPrice: 97,
      yearlyPrice: 970, // 2 meses grátis
      maxStudents: 100,
      maxCourses: 10,
      maxStorage: 10, // 10GB
      customDomain: false,
      whiteLabel: false,
      analytics: false,
      position: 1,
    },
    {
      name: 'Profissional',
      description: 'Para escolas e academias em crescimento',
      setupFee: 0,
      monthlyPrice: 297,
      yearlyPrice: 2970, // 2 meses grátis
      maxStudents: 500,
      maxCourses: 50,
      maxStorage: 50, // 50GB
      customDomain: true,
      whiteLabel: true,
      analytics: true,
      position: 2,
    },
    {
      name: 'Enterprise',
      description: 'Solução completa para grandes organizações',
      setupFee: 0,
      monthlyPrice: 997,
      yearlyPrice: 9970, // 2 meses grátis
      maxStudents: null, // Ilimitado
      maxCourses: null, // Ilimitado
      maxStorage: null, // Ilimitado
      customDomain: true,
      whiteLabel: true,
      analytics: true,
      position: 3,
    },
  ]

  for (const plan of plans) {
    const createdPlan = await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
    console.log(`✅ Plan created: ${createdPlan.name}`)
  }

  // ============================================================================
  // 3. CREATE DEMO TENANT (Opcional - para testes)
  // ============================================================================
  console.log('🏢 Creating demo tenant...')

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Academia Demo',
      slug: 'demo',
      subdomain: 'demo',
      primaryColor: '#E50914', // Netflix red
      secondaryColor: '#2F2F2F',
      fontFamily: 'Inter',
      isActive: true,
    },
  })

  console.log(`✅ Demo tenant created: ${demoTenant.name}`)

  // ============================================================================
  // 4. CREATE DEMO TENANT ADMIN
  // ============================================================================
  console.log('👤 Creating demo tenant admin...')

  const tenantAdminPassword = await bcrypt.hash('demo123', 10)

  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin Demo',
      password: tenantAdminPassword,
      role: 'TENANT_ADMIN',
      tenantId: demoTenant.id,
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Demo tenant admin created: ${tenantAdmin.email}`)

  // ============================================================================
  // 5. CREATE DEMO SUBSCRIPTION (Tenant com plano Profissional)
  // ============================================================================
  console.log('💳 Creating demo subscription...')

  const professionalPlan = await prisma.plan.findFirst({
    where: { name: 'Profissional' },
  })

  if (professionalPlan) {
    const demoSubscription = await prisma.subscription.create({
      data: {
        tenantId: demoTenant.id,
        planId: professionalPlan.id,
        status: 'ACTIVE',
        interval: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      },
    })

    console.log(`✅ Demo subscription created: ${demoSubscription.id}`)
  }

  // ============================================================================
  // 6. CREATE DEMO CATEGORIES
  // ============================================================================
  console.log('📂 Creating demo categories...')

  const categories = [
    {
      name: 'Programação',
      slug: 'programacao',
      description: 'Cursos de desenvolvimento de software',
      position: 1,
    },
    {
      name: 'Marketing Digital',
      slug: 'marketing-digital',
      description: 'Estratégias de marketing online',
      position: 2,
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX, Gráfico e Motion Design',
      position: 3,
    },
  ]

  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        ...category,
        tenantId: demoTenant.id,
      },
    })
    console.log(`✅ Category created: ${createdCategory.name}`)
  }

  // ============================================================================
  // 7. CREATE DEMO STUDENT
  // ============================================================================
  console.log('👤 Creating demo student...')

  const studentPassword = await bcrypt.hash('student123', 10)

  const demoStudent = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      name: 'Aluno Demo',
      password: studentPassword,
      role: 'STUDENT',
      tenantId: demoTenant.id,
      emailVerified: new Date(),
      xp: 150,
      level: 2,
      lastLoginAt: new Date(),
    },
  })

  console.log(`✅ Demo student created: ${demoStudent.email}`)

  // ============================================================================
  // 8. CREATE DEMO COURSE
  // ============================================================================
  console.log('📚 Creating demo course...')

  const programmingCategory = await prisma.category.findFirst({
    where: {
      slug: 'programacao',
      tenantId: demoTenant.id,
    },
  })

  if (programmingCategory) {
    const demoCourse = await prisma.course.create({
      data: {
        tenantId: demoTenant.id,
        categoryId: programmingCategory.id,
        title: 'Curso Completo de Next.js 14',
        slug: 'curso-nextjs-14',
        description:
          'Aprenda a criar aplicações modernas com Next.js 14, React 18 e TypeScript',
        thumbnail: 'https://picsum.photos/seed/nextjs/800/450',
        heroImage: 'https://picsum.photos/seed/nextjs-hero/1920/1080',
        price: 297,
        monthlyPrice: 97,
        yearlyPrice: 970,
        isPublished: true,
        isFeatured: true,
        duration: 1200, // 20 horas
      },
    })

    console.log(`✅ Demo course created: ${demoCourse.title}`)

    // Criar módulo de demonstração
    const demoModule = await prisma.module.create({
      data: {
        courseId: demoCourse.id,
        title: 'Módulo 1: Introdução ao Next.js',
        slug: 'introducao-nextjs',
        description: 'Fundamentos do Next.js 14 e App Router',
        position: 1,
        isPublished: true,
      },
    })

    console.log(`✅ Demo module created: ${demoModule.title}`)

    // Criar aula de demonstração
    const demoLesson = await prisma.lesson.create({
      data: {
        moduleId: demoModule.id,
        title: 'Aula 1: O que é Next.js?',
        slug: 'o-que-e-nextjs',
        description: 'Introdução ao framework Next.js',
        type: 'VIDEO',
        thumbnail: 'https://picsum.photos/seed/lesson1/800/450',
        duration: 600, // 10 minutos
        position: 1,
        isPublished: true,
        isFree: true, // Aula gratuita (preview)
        xpReward: 10,
      },
    })

    console.log(`✅ Demo lesson created: ${demoLesson.title}`)

    // Criar matrícula do aluno demo
    await prisma.enrollment.create({
      data: {
        userId: demoStudent.id,
        courseId: demoCourse.id,
        progress: 10,
      },
    })

    console.log(`✅ Demo student enrolled in course`)
  }

  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📝 Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Super Admin: ${superAdminEmail} / ${superAdminPassword}`)
  console.log(`Tenant Admin: admin@demo.com / demo123`)
  console.log(`Student: student@demo.com / student123`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
