import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ============================================
        // CORES DINÂMICAS (via CSS Variables)
        // ============================================
        // Essas cores são injetadas dinamicamente por tenant
        // via middleware. Cada tenant pode ter suas próprias cores.

        // Cor Primária (Whitelabel - customizável por tenant)
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
        },

        // Cor Secundária (Whitelabel - customizável por tenant)
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          hover: 'rgb(var(--color-secondary-hover) / <alpha-value>)',
          light: 'rgb(var(--color-secondary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-secondary-dark) / <alpha-value>)',
        },

        // Background (Netflix style - dark mode)
        background: {
          DEFAULT: 'rgb(var(--color-background) / <alpha-value>)',
          card: 'rgb(var(--color-background-card) / <alpha-value>)',
          hover: 'rgb(var(--color-background-hover) / <alpha-value>)',
        },

        // Text
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },

        // ============================================
        // CORES FIXAS (Sistema - não customizáveis)
        // ============================================
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Estados
        success: {
          DEFAULT: '#10b981', // green-500
          hover: '#059669',   // green-600
          light: '#34d399',   // green-400
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#d97706',   // amber-600
          light: '#fbbf24',   // amber-400
        },
        error: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626',   // red-600
          light: '#f87171',   // red-400
        },
        info: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb',   // blue-600
          light: '#60a5fa',   // blue-400
        },
      },

      fontFamily: {
        sans: ['var(--font-family)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Tipografia Netflix-style
        'hero': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],      // 64px
        'title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],   // 40px
        'heading': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],   // 32px
        'subheading': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // 24px
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],  // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],         // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],   // 12px
      },

      spacing: {
        '18': '4.5rem',  // 72px
        '88': '22rem',   // 352px
        '128': '32rem',  // 512px
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      boxShadow: {
        // Sombras estilo Netflix (para hover em cards)
        'netflix': '0 10px 40px rgba(0, 0, 0, 0.5)',
        'netflix-lg': '0 20px 60px rgba(0, 0, 0, 0.7)',
        'glow': '0 0 20px rgb(var(--color-primary) / 0.5)',
      },

      animation: {
        // Animações customizadas
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-netflix': 'linear-gradient(to bottom, transparent 0%, rgba(20,20,20,0.5) 50%, rgba(20,20,20,1) 100%)',
      },

      transitionDuration: {
        '400': '400ms',
      },

      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
