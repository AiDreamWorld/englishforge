'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CreditCard, Crown, BarChart3, Award, Layers, Settings,
  LogOut, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Crown },
  { href: '/admin/reports', label: 'AI Reports', icon: BarChart3 },
  { href: '/admin/badges', label: 'Badges', icon: Award },
  { href: '/admin/levels', label: 'Levels', icon: Layers },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-extrabold text-text-primary leading-none">
              EnglishForge
            </h1>
            <p className="text-[10px] text-secondary leading-none mt-0.5 font-semibold">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || 'Admin'}
            fallback={profile?.full_name?.[0]?.toUpperCase() || 'A'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-text-primary truncate">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-secondary font-semibold">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-secondary hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors font-medium"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
