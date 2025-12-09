import type { TenantTheme } from '@/types/tenant'

// ============================================================================
// THEME GENERATION UTILITIES
// ============================================================================

/**
 * Converte HEX para RGB (formato Tailwind)
 * @param hex - Cor em formato hexadecimal (ex: "#E50914")
 * @returns String RGB (ex: "229 9 20")
 */
export function hexToRgb(hex: string): string {
  // Remove o # se presente
  const cleanHex = hex.replace('#', '')

  // Valida formato
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    console.warn(`Invalid hex color: ${hex}. Using fallback.`)
    return '229 9 20' // Netflix red fallback
  }

  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return `${r} ${g} ${b}`
}

/**
 * Gera variações de uma cor (hover, light, dark)
 * @param hex - Cor base em formato hexadecimal
 * @returns Objeto com variações da cor
 */
export function generateColorVariations(hex: string) {
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

/**
 * Gera objeto de tema completo para o tenant
 * @param tenant - Dados do tenant (com cores e logo)
 * @returns Objeto TenantTheme pronto para injeção
 */
export function generateTenantTheme(tenant: {
  id: string
  slug: string
  primaryColor: string
  secondaryColor: string
  logo: string | null
  fontFamily: string
}): TenantTheme {
  const primaryColors = generateColorVariations(tenant.primaryColor)
  const secondaryColors = generateColorVariations(tenant.secondaryColor)

  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    colors: {
      primary: primaryColors.default,
      primaryHover: primaryColors.hover,
      primaryLight: primaryColors.light,
      primaryDark: primaryColors.dark,
      secondary: secondaryColors.default,
      secondaryHover: secondaryColors.hover,
      secondaryLight: secondaryColors.light,
      secondaryDark: secondaryColors.dark,
    },
    logo: tenant.logo || undefined,
    fontFamily: tenant.fontFamily,
  }
}

/**
 * Gera CSS inline para injetar no <head>
 * @param theme - Objeto TenantTheme
 * @returns String CSS pronta para injeção
 */
export function generateThemeCSS(theme: TenantTheme): string {
  return `
    [data-tenant="${theme.slug}"] {
      --color-primary: ${theme.colors.primary};
      --color-primary-hover: ${theme.colors.primaryHover};
      --color-primary-light: ${theme.colors.primaryLight};
      --color-primary-dark: ${theme.colors.primaryDark};
      --color-secondary: ${theme.colors.secondary};
      --color-secondary-hover: ${theme.colors.secondaryHover};
      --color-secondary-light: ${theme.colors.secondaryLight};
      --color-secondary-dark: ${theme.colors.secondaryDark};
      --font-family: ${theme.fontFamily}, sans-serif;
    }
  `.trim()
}

/**
 * Serializa tema para cookie
 * @param theme - Objeto TenantTheme
 * @returns String JSON
 */
export function serializeTheme(theme: TenantTheme): string {
  return JSON.stringify(theme)
}

/**
 * Desserializa tema do cookie
 * @param themeString - String JSON do cookie
 * @returns Objeto TenantTheme ou null se inválido
 */
export function deserializeTheme(themeString: string): TenantTheme | null {
  try {
    return JSON.parse(themeString) as TenantTheme
  } catch (error) {
    console.error('Error parsing theme cookie:', error)
    return null
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Verifica se uma cor é clara ou escura (para contraste)
 * @param hex - Cor em formato hexadecimal
 * @returns 'light' ou 'dark'
 */
export function getColorBrightness(hex: string): 'light' | 'dark' {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.split(' ').map(Number)

  // Fórmula de luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? 'light' : 'dark'
}

/**
 * Gera cor de texto com bom contraste
 * @param bgHex - Cor de fundo em formato hexadecimal
 * @returns Cor do texto (branco ou preto)
 */
export function getContrastingTextColor(bgHex: string): string {
  const brightness = getColorBrightness(bgHex)
  return brightness === 'light' ? '#000000' : '#FFFFFF'
}

/**
 * Valida se uma cor hexadecimal é válida
 * @param hex - Cor em formato hexadecimal
 * @returns Boolean
 */
export function isValidHexColor(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex)
}

/**
 * Converte RGB para HEX
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns String hexadecimal (ex: "#E50914")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')}`
}

// ============================================================================
// PRESET THEMES (Netflix-inspired)
// ============================================================================

export const PRESET_THEMES = {
  netflix: {
    name: 'Netflix (Padrão)',
    primaryColor: '#E50914',
    secondaryColor: '#2F2F2F',
    fontFamily: 'Inter',
  },
  spotify: {
    name: 'Spotify',
    primaryColor: '#1DB954',
    secondaryColor: '#191414',
    fontFamily: 'Inter',
  },
  youtube: {
    name: 'YouTube',
    primaryColor: '#FF0000',
    secondaryColor: '#212121',
    fontFamily: 'Roboto',
  },
  prime: {
    name: 'Prime Video',
    primaryColor: '#00A8E1',
    secondaryColor: '#0F171E',
    fontFamily: 'Inter',
  },
  disney: {
    name: 'Disney+',
    primaryColor: '#1A4BD4',
    secondaryColor: '#040814',
    fontFamily: 'Inter',
  },
  hbo: {
    name: 'HBO Max',
    primaryColor: '#9E36DB',
    secondaryColor: '#0E0E10',
    fontFamily: 'Inter',
  },
  custom: {
    name: 'Customizado',
    primaryColor: '#3B82F6', // blue-500
    secondaryColor: '#1F2937', // gray-800
    fontFamily: 'Inter',
  },
} as const

/**
 * Obtém preset de tema por nome
 * @param presetName - Nome do preset
 * @returns Configuração do preset ou null
 */
export function getPresetTheme(
  presetName: keyof typeof PRESET_THEMES
): typeof PRESET_THEMES[keyof typeof PRESET_THEMES] | null {
  return PRESET_THEMES[presetName] || null
}

// ============================================================================
// THEME PREVIEW (para uso no admin)
// ============================================================================

/**
 * Gera preview do tema (SVG ou CSS)
 * @param primaryColor - Cor primária
 * @param secondaryColor - Cor secundária
 * @returns Objeto com preview CSS
 */
export function generateThemePreview(
  primaryColor: string,
  secondaryColor: string
) {
  return {
    primaryRgb: hexToRgb(primaryColor),
    secondaryRgb: hexToRgb(secondaryColor),
    primaryHex: primaryColor,
    secondaryHex: secondaryColor,
    primaryTextColor: getContrastingTextColor(primaryColor),
    secondaryTextColor: getContrastingTextColor(secondaryColor),
    brightness: {
      primary: getColorBrightness(primaryColor),
      secondary: getColorBrightness(secondaryColor),
    },
  }
}
