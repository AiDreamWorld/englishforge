'use client'

import Link from 'next/link'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <SparkyCharacter mood="thinking" size={160} />
      <h1 className="mt-8 text-6xl font-mono font-extrabold text-primary">404</h1>
      <h2 className="mt-2 text-2xl font-display font-bold text-text-primary">
        Oops! Page Not Found
      </h2>
      <p className="mt-2 text-text-secondary text-center max-w-sm">
        Sparky looked everywhere but couldn&apos;t find this page. Maybe it moved to a new level?
      </p>
      <Link href="/">
        <Button size="lg" className="mt-8">
          <Home className="h-5 w-5" />
          Go Home
        </Button>
      </Link>
    </div>
  )
}
