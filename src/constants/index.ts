// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  STUDENT: 'STUDENT',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// ============================================================================
// SUBSCRIPTION STATUS
// ============================================================================

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  INCOMPLETE: 'INCOMPLETE',
  TRIALING: 'TRIALING',
} as const

export type SubscriptionStatusType = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

// ============================================================================
// SUBSCRIPTION INTERVALS
// ============================================================================

export const SUBSCRIPTION_INTERVALS = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const

export type SubscriptionInterval = typeof SUBSCRIPTION_INTERVALS[keyof typeof SUBSCRIPTION_INTERVALS]

// ============================================================================
// LESSON TYPES
// ============================================================================

export const LESSON_TYPES = {
  VIDEO: 'VIDEO',
  TEXT: 'TEXT',
  QUIZ: 'QUIZ',
  LIVE: 'LIVE',
} as const

export type LessonType = typeof LESSON_TYPES[keyof typeof LESSON_TYPES]

// ============================================================================
// CHURN RISK LEVELS
// ============================================================================

export const CHURN_RISK = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CHURNED: 'CHURNED',
} as const

export type ChurnRiskLevel = typeof CHURN_RISK[keyof typeof CHURN_RISK]

// ============================================================================
// CERTIFICATE STATUS
// ============================================================================

export const CERTIFICATE_STATUS = {
  PENDING: 'PENDING',
  ISSUED: 'ISSUED',
  REVOKED: 'REVOKED',
} as const

export type CertificateStatusType = typeof CERTIFICATE_STATUS[keyof typeof CERTIFICATE_STATUS]

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Super Admin
  SUPER_ADMIN_DASHBOARD: '/super-admin/dashboard',
  SUPER_ADMIN_TENANTS: '/super-admin/tenants',
  SUPER_ADMIN_PLANS: '/super-admin/plans',
  SUPER_ADMIN_BILLING: '/super-admin/billing',
  SUPER_ADMIN_SETTINGS: '/super-admin/settings',

  // Tenant Admin
  TENANT_ADMIN_DASHBOARD: '/admin/dashboard',
  TENANT_ADMIN_COURSES: '/admin/courses',
  TENANT_ADMIN_STUDENTS: '/admin/students',
  TENANT_ADMIN_ANALYTICS: '/admin/analytics',
  TENANT_ADMIN_CUSTOMIZATION: '/admin/customization',
  TENANT_ADMIN_PRICING: '/admin/pricing',
  TENANT_ADMIN_SETTINGS: '/admin/settings',

  // Student
  STUDENT_BROWSE: '/browse',
  STUDENT_MY_LIST: '/my-list',
  STUDENT_COURSE: '/course',
  STUDENT_WATCH: '/course/:courseId/watch/:lessonId',
  STUDENT_CERTIFICATES: '/certificates',
  STUDENT_PROFILE: '/profile',
  STUDENT_SEARCH: '/search',

  // Error pages
  UNAUTHORIZED: '/unauthorized',
  TENANT_SUSPENDED: '/tenant-suspended',
  NOT_FOUND: '/404',
} as const

// ============================================================================
// ROLES PERMISSIONS
// ============================================================================

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    'manage_tenants',
    'manage_plans',
    'view_global_billing',
    'view_global_analytics',
  ],
  [USER_ROLES.TENANT_ADMIN]: [
    'manage_courses',
    'manage_students',
    'view_analytics',
    'customize_platform',
    'manage_pricing',
  ],
  [USER_ROLES.STUDENT]: [
    'view_courses',
    'enroll_courses',
    'track_progress',
    'comment_lessons',
    'download_certificates',
  ],
} as const

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_THEME = {
  primaryColor: '#E50914', // Netflix red
  secondaryColor: '#2F2F2F', // Dark gray
  fontFamily: 'Inter',
} as const

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

export const DEFAULT_TENANT_LIMITS = {
  maxStudents: null, // Unlimited
  maxCourses: null, // Unlimited
  maxStorage: null, // Unlimited (in GB)
} as const

// ============================================================================
// CHURN DETECTION THRESHOLDS
// ============================================================================

export const CHURN_THRESHOLDS = {
  MEDIUM_DAYS: 7, // Sem login há 7 dias = risco médio
  HIGH_DAYS: 14, // Sem login há 14 dias = risco alto
  NO_COMPLETION_DAYS: 30, // Sem conclusões há 30 dias = desengajado
} as const

// ============================================================================
// GAMIFICATION
// ============================================================================

export const GAMIFICATION = {
  XP_PER_LESSON: 10,
  XP_PER_MODULE: 50,
  XP_PER_COURSE: 200,
  XP_PER_COMMENT: 5,
  XP_PER_LOGIN: 2,

  // Níveis (XP necessário para cada nível)
  LEVELS: [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 300 },
    { level: 4, xpRequired: 600 },
    { level: 5, xpRequired: 1000 },
    { level: 6, xpRequired: 1500 },
    { level: 7, xpRequired: 2100 },
    { level: 8, xpRequired: 2800 },
    { level: 9, xpRequired: 3600 },
    { level: 10, xpRequired: 5000 },
  ],
} as const

// ============================================================================
// FILE UPLOAD LIMITS
// ============================================================================

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
  ],
} as const

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 100,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  REGISTRATION_PER_IP_PER_DAY: 3,
} as const

// ============================================================================
// CACHE TTL (Time To Live)
// ============================================================================

export const CACHE_TTL = {
  TENANT: 5 * 60 * 1000, // 5 minutos
  COURSE: 10 * 60 * 1000, // 10 minutos
  USER_SESSION: 30 * 60 * 1000, // 30 minutos
  ANALYTICS: 60 * 60 * 1000, // 1 hora
} as const

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

export const WEBHOOK_EVENTS = {
  STUDENT_ENROLLED: 'student.enrolled',
  STUDENT_COMPLETED_LESSON: 'student.completed_lesson',
  STUDENT_COMPLETED_COURSE: 'student.completed_course',
  CERTIFICATE_ISSUED: 'certificate.issued',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
} as const

export type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS]

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const ANALYTICS_EVENTS = {
  COURSE_VIEW: 'course.view',
  LESSON_START: 'lesson.start',
  LESSON_COMPLETE: 'lesson.complete',
  LESSON_PROGRESS: 'lesson.progress',
  VIDEO_PLAY: 'video.play',
  VIDEO_PAUSE: 'video.pause',
  VIDEO_COMPLETE: 'video.complete',
  SEARCH: 'search',
  COMMENT_CREATE: 'comment.create',
  FAVORITE_ADD: 'favorite.add',
  FAVORITE_REMOVE: 'favorite.remove',
  CERTIFICATE_DOWNLOAD: 'certificate.download',
} as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  COURSE_ENROLLMENT: 'course-enrollment',
  CERTIFICATE_ISSUED: 'certificate-issued',
  SUBSCRIPTION_REMINDER: 'subscription-reminder',
  SUBSCRIPTION_CANCELED: 'subscription-canceled',
  CHURN_WARNING: 'churn-warning',
} as const

export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES]
