'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Lightbulb, Search, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatPKR } from '@/lib/utils/format'

const TIPS = [
  'Payments are linked to subscriptions. When a student subscribes, a payment record is created.',
  'Failed payments should be followed up — the student may have insufficient balance.',
  'Revenue shown here is calculated from completed payments only.',
  'Export payment data monthly for your accounting records.',
  'Check pending payments daily — they may need manual verification for bank transfers.',
]

interface Payment {
  id: string
  amount: number
  currency: string
  gateway: string
  status: string
  created_at: string
  user_id: string
  profile?: { full_name: string; email: string } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('payments')
        .select('id, amount, currency, gateway, status, created_at, user_id, profile:profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200)
      setPayments((data || []).map(p => ({ ...p, profile: Array.isArray(p.profile) ? p.profile[0] : p.profile })) as Payment[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0)
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0)
  const completedCount = payments.filter(p => p.status === 'completed').length
  const failedCount = payments.filter(p => p.status === 'failed').length

  const filtered = payments
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p =>
      p.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.gateway?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Payments ({payments.length})</h1>
        <p className="text-sm text-foreground/50">Track all subscription payments. Connected to pricing plans and student subscriptions.</p>
      </div>

      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-700">{tip}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center"><DollarSign className="h-4 w-4 text-green-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{formatPKR(totalRevenue)}</p><p className="text-xs text-foreground/50">Total Revenue</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center"><Clock className="h-4 w-4 text-amber-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{formatPKR(pendingAmount)}</p><p className="text-xs text-foreground/50">Pending</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-blue-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{completedCount}</p><p className="text-xs text-foreground/50">Completed</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center"><XCircle className="h-4 w-4 text-red-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{failedCount}</p><p className="text-xs text-foreground/50">Failed</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search by name, email, or gateway..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'completed', 'pending', 'failed'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-foreground/50">
          No payments found. Payments appear here when students subscribe to Learner or Champion plans.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  p.status === 'completed' ? 'bg-green-100' : p.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  <CreditCard className={`h-5 w-5 ${
                    p.status === 'completed' ? 'text-green-600' : p.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.profile?.full_name || 'Unknown User'}</p>
                  <p className="text-xs text-foreground/50">{p.profile?.email || p.user_id}</p>
                </div>
                <div className="text-sm font-mono font-bold">{formatPKR(p.amount)}</div>
                <Badge variant="outline">{p.gateway || 'N/A'}</Badge>
                <Badge variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'accent' : 'secondary'}>
                  {p.status}
                </Badge>
                <p className="text-xs text-foreground/40">{new Date(p.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
