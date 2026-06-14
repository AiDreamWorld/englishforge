'use client'

import { TeacherNav } from '@/components/layout/TeacherNav'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <TeacherNav />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
