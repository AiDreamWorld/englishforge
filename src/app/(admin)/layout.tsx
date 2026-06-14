'use client'

import { AdminNav } from '@/components/layout/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNav />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  )
}
