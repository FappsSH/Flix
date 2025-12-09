'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

interface NavbarProps {
  user: {
    name: string | null
    email: string
    image: string | null
  }
  tenantName: string
  logo?: string | null
}

const navigation = [
  { name: 'Início', href: '/browse' },
  { name: 'Minha Lista', href: '/my-list' },
  { name: 'Certificados', href: '/certificates' },
]

export function Navbar({ user, tenantName, logo }: NavbarProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        isScrolled ? 'bg-background' : 'bg-gradient-to-b from-background/80 to-transparent'
      )}
    >
      <div className="container-netflix">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/browse" className="flex items-center gap-2 flex-shrink-0">
              {logo ? (
                <img src={logo} alt={tenantName} className="h-8 md:h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {tenantName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-text hidden md:block">
                    {tenantName}
                  </span>
                </div>
              )}
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors relative',
                      isActive ? 'text-text' : 'text-text-secondary hover:text-text'
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <motion.div
              initial={false}
              animate={{ width: showSearch ? '240px' : '40px' }}
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center justify-center h-10 w-10 text-text hover:text-primary transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>
              <AnimatePresence>
                {showSearch && (
                  <motion.input
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    type="text"
                    placeholder="Buscar cursos..."
                    className="absolute top-0 left-0 h-10 w-full pl-10 pr-4 bg-background-card border border-secondary rounded-md text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                    autoFocus
                    onBlur={() => setShowSearch(false)}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center h-10 w-10 text-text hover:text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            </motion.button>

            {/* Profile Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-text"
              >
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform hidden md:block',
                    showProfileMenu && 'rotate-180'
                  )}
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-48 bg-background-card border border-secondary rounded-md shadow-lg overflow-hidden"
                  >
                    <div className="p-3 border-b border-secondary">
                      <p className="text-sm font-medium text-text truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-text hover:bg-secondary transition-colors"
                      >
                        Meu Perfil
                      </Link>
                      <Link
                        href="/certificates"
                        className="block px-4 py-2 text-sm text-text hover:bg-secondary transition-colors"
                      >
                        Certificados
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-secondary transition-colors"
                      >
                        Sair
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-secondary">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-text-secondary'
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
