/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // EXPERIMENTAL FEATURES
  // ============================================================================
  experimental: {
    // Server Actions
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },

  // ============================================================================
  // IMAGES
  // ============================================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vimeocdn.com', // Vimeo thumbnails
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // Cloudinary
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Demo images (remover em produção)
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ============================================================================
  // HEADERS
  // ============================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // CORS para API routes (webhooks, etc)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Ajustar em produção
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // REDIRECTS
  // ============================================================================
  async redirects() {
    return [
      // Redireciona /admin para /admin/dashboard
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      // Redireciona /super-admin para /super-admin/dashboard
      {
        source: '/super-admin',
        destination: '/super-admin/dashboard',
        permanent: true,
      },
    ]
  },

  // ============================================================================
  // WEBPACK CONFIG
  // ============================================================================
  webpack: (config, { isServer }) => {
    // Fixes para pacotes específicos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // ============================================================================
  // TYPESCRIPT
  // ============================================================================
  typescript: {
    // ⚠️ AVISO: Desabilitar em produção só se tiver certeza do que está fazendo
    ignoreBuildErrors: false,
  },

  // ============================================================================
  // ESLINT
  // ============================================================================
  eslint: {
    // ⚠️ AVISO: Desabilitar em produção só se tiver certeza do que está fazendo
    ignoreDuringBuilds: false,
  },

  // ============================================================================
  // PERFORMANCE
  // ============================================================================
  compress: true, // Gzip compression
  poweredByHeader: false, // Remove X-Powered-By header

  // ============================================================================
  // LOGGING
  // ============================================================================
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig
