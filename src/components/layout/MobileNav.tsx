'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Home, BookOpen, Map, Trophy, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const items = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/levels', label: 'Levels', icon: Map },
  { href: '/achievements', label: 'Awards', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                active ? 'text-primary' : 'text-foreground/50'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
