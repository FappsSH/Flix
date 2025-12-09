'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Package,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/super-admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Tenants',
    href: '/super-admin/tenants',
    icon: Building2,
  },
  {
    name: 'Planos',
    href: '/super-admin/plans',
    icon: Package,
  },
  {
    name: 'Faturamento',
    href: '/super-admin/billing',
    icon: CreditCard,
  },
  {
    name: 'Configurações',
    href: '/super-admin/settings',
    icon: Settings,
  },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background-card border-r border-secondary px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/super-admin/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-text">Flix Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:text-text hover:bg-secondary'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* Bottom */}
            <li className="mt-auto">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-xs text-text-secondary">
                  Super Admin Panel
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Gerencie todos os tenants
                </p>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
