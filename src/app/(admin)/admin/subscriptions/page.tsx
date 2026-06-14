'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Crown, Users } from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  status: string
  price: number
  currency: string
  gateway: string
  current_period_end: string | null
  created_at: string
  user: { full_name: string; email: string } | null
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('subscriptions')
        .select('*, user:profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)
      setSubs((data || []) as unknown as Subscription[])
      setLoading(false)
    }
    load()
  }, [])

  const activeSubs = subs.filter(s => s.status === 'active')
  const mrr = activeSubs.reduce((s, sub) => s + sub.price, 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">Subscriptions</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Crown className="text-primary" /></div>
            <div><p className="text-2xl font-bold">{activeSubs.length}</p><p className="text-xs text-foreground/50">Active Subscriptions</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Users className="text-success" /></div>
            <div><p className="text-2xl font-bold">PKR {mrr.toLocaleString()}</p><p className="text-xs text-foreground/50">Monthly Recurring</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Subscriptions</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-foreground/50">
              <th className="pb-3">User</th><th className="pb-3">Plan</th><th className="pb-3">Price</th><th className="pb-3">Status</th><th className="pb-3">Expires</th>
            </tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-3"><p className="font-medium">{s.user?.full_name}</p><p className="text-xs text-foreground/40">{s.user?.email}</p></td>
                  <td className="py-3"><Badge variant="primary">{s.plan}</Badge></td>
                  <td className="py-3">{s.currency} {s.price?.toLocaleString()}</td>
                  <td className="py-3"><Badge variant={s.status === 'active' ? 'success' : 'accent'}>{s.status}</Badge></td>
                  <td className="py-3 text-foreground/50">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
