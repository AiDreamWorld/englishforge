'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  gateway: string
  status: string
  created_at: string
  user: { full_name: string; email: string } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('payments')
        .select('id, amount, currency, gateway, status, created_at, user:profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)
      setPayments((data || []) as unknown as Payment[])
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const thisMonth = payments.filter(p => {
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'completed'
  }).reduce((s, p) => s + p.amount, 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="text-success" /></div>
            <div><p className="text-2xl font-bold">PKR {totalRevenue.toLocaleString()}</p><p className="text-xs text-foreground/50">Total Revenue</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="text-primary" /></div>
            <div><p className="text-2xl font-bold">PKR {thisMonth.toLocaleString()}</p><p className="text-xs text-foreground/50">This Month</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"><CreditCard className="text-accent" /></div>
            <div><p className="text-2xl font-bold">{payments.length}</p><p className="text-xs text-foreground/50">Total Transactions</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-foreground/50">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Gateway</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3">
                      <p className="font-medium">{p.user?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-foreground/40">{p.user?.email}</p>
                    </td>
                    <td className="py-3 font-medium">{p.currency} {p.amount.toLocaleString()}</td>
                    <td className="py-3"><Badge>{p.gateway}</Badge></td>
                    <td className="py-3">
                      <Badge variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'accent' : 'secondary'}>{p.status}</Badge>
                    </td>
                    <td className="py-3 text-foreground/50">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
