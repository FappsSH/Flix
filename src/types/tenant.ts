import type { Tenant, Subscription, Plan, SubscriptionStatus } from '@prisma/client'

// ============================================================================
// TENANT TYPES
// ============================================================================

/**
 * Tenant com informações de licença/assinatura
 */
export type TenantWithLicense = Tenant & {
  subscriptions: (Subscription & {
    plan: Plan
  })[]
}

/**
 * Status da licença do tenant
 */
export type TenantLicenseStatus =
  | {
      isValid: true
      status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE'
      subscription: Subscription & { plan: Plan }
      plan: Plan
      trialEndsAt?: Date
      warning?: string
    }
  | {
      isValid: false
      status: 'INACTIVE' | 'NO_SUBSCRIPTION' | 'CANCELED' | 'INCOMPLETE' | 'UNKNOWN'
      reason: string
      canceledAt?: Date
    }

/**
 * Limites do tenant baseado no plano
 */
export interface TenantLimits {
  withinLimits: boolean
  limits?: {
    students: {
      current: number
      max: number | null
      exceeded: boolean
    }
    courses: {
      current: number
      max: number | null
      exceeded: boolean
    }
    storage: {
      current: number
      max: number | null
      exceeded: boolean
    }
  }
  plan?: Plan
  reason?: string
}

/**
 * Tenant com contadores
 */
export interface TenantWithStats extends Tenant {
  _count: {
    users: number
    courses: number
    certificates: number
  }
}

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Tema do tenant (cores, logo, fonte)
 */
export interface TenantTheme {
  tenantId: string
  slug: string
  colors: {
    primary: string // RGB format: "229 9 20"
    primaryHover: string
    primaryLight: string
    primaryDark: string
    secondary: string
    secondaryHover: string
    secondaryLight: string
    secondaryDark: string
  }
  logo?: string
  fontFamily: string
}

/**
 * Configurações de customização do tenant
 */
export interface TenantCustomization {
  logo: string | null
  favicon: string | null
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

/**
 * Preview do tema (para exibição no admin)
 */
export interface ThemePreview {
  primaryRgb: string
  secondaryRgb: string
  primaryHex: string
  secondaryHex: string
  primaryTextColor: string
  secondaryTextColor: string
  brightness: {
    primary: 'light' | 'dark'
    secondary: 'light' | 'dark'
  }
}

// ============================================================================
// TENANT DETECTION TYPES
// ============================================================================

/**
 * Resultado da detecção de tenant
 */
export interface TenantDetectionResult {
  tenant: TenantWithLicense | null
  method: 'domain' | 'subdomain' | 'path' | 'none'
  identifier?: string // domínio, subdomínio ou slug
}

/**
 * Contexto do tenant (para uso em componentes)
 */
export interface TenantContext {
  tenant: TenantWithLicense
  license: TenantLicenseStatus
  theme: TenantTheme
  limits?: TenantLimits
}

// ============================================================================
// TENANT CONFIGURATION TYPES
// ============================================================================

/**
 * Configurações avançadas do tenant
 */
export interface TenantSettings {
  // SEO
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]

  // Social
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }

  // Email
  emailFromName?: string
  emailFromAddress?: string

  // Features
  features?: {
    enableComments: boolean
    enableCertificates: boolean
    enableGamification: boolean
    enableLiveClasses: boolean
  }

  // Analytics
  analytics?: {
    googleAnalyticsId?: string
    facebookPixelId?: string
  }

  // Custom CSS/JS (avançado)
  customCSS?: string
  customJS?: string
}

/**
 * Dados do formulário de criação/edição de tenant
 */
export interface TenantFormData {
  name: string
  slug: string
  subdomain?: string
  domain?: string
  logo?: string
  favicon?: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  isActive: boolean
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

/**
 * Dados do checkout de assinatura
 */
export interface SubscriptionCheckoutData {
  tenantId: string
  planId: string
  interval: 'MONTHLY' | 'YEARLY'
  successUrl: string
  cancelUrl: string
}

/**
 * Informações de faturamento do tenant
 */
export interface TenantBilling {
  subscription: Subscription & { plan: Plan }
  upcomingInvoice?: {
    amount: number
    date: Date
  }
  paymentMethod?: {
    type: string
    last4: string
    expiryMonth: number
    expiryYear: number
  }
  invoices: {
    id: string
    amount: number
    status: string
    date: Date
    pdfUrl?: string
  }[]
}
