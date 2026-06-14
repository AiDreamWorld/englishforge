'use client'

import { StudentNav } from '@/components/layout/StudentNav'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <StudentNav />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
