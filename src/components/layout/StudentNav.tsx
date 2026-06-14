'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Map, Trophy, Medal,
  User, LogOut, Flame, Gamepad2, Crown
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/levels', label: 'Levels', icon: Map },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: Medal },
  { href: '/subscribe', label: 'Subscribe', icon: Crown },
  { href: '/profile', label: 'Profile', icon: User },
]

export function StudentNav() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-extrabold text-text-primary leading-none">
              EnglishForge
            </h1>
            <p className="text-[10px] text-text-secondary leading-none mt-0.5">Learn & Play</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.label === 'Dashboard' && (
                <Flame className="h-4 w-4 ml-auto text-accent fill-accent" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || 'User'}
            fallback={profile?.full_name?.[0]?.toUpperCase() || 'U'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-text-primary truncate">
              {profile?.display_name || profile?.full_name || 'Student'}
            </p>
            <p className="text-xs text-text-secondary truncate">{profile?.email}</p>
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
