'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CreditCard, Users, TrendingUp, AlertCircle, Lightbulb, Search, Crown, Star, Calendar } from 'lucide-react'
import { formatPKR } from '@/lib/utils/format'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants'

const TIPS = [
  'Subscriptions connect students to plans (Explorer/Learner/Champion) and control level access.',
  'Active subscriptions generate recurring revenue — monitor MRR closely.',
  'Cancelled subscriptions remain active until the billing period ends.',
  'Students on the free Explorer plan can access Levels 1-5 and 3 quizzes/day.',
  'Learner plan gives access to Levels 1-60. Champion plan unlocks all 120 levels.',
  'Expired subscriptions downgrade the student to Explorer (free) automatically.',
]

interface Subscription {
  id: string
  plan: string
  status: string
  starts_at: string
  ends_at: string | null
  created_at: string
  user_id: string
  profile?: { full_name: string; email: string } | null
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all')
  const [search, setSearch] = useState('')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('subscriptions')
        .select('id, plan, status, starts_at, ends_at, created_at, user_id, profile:profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200)
      setSubs((data || []).map(s => ({ ...s, profile: Array.isArray(s.profile) ? s.profile[0] : s.profile })) as Subscription[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const activeSubs = subs.filter(s => s.status === 'active')
  const basicActive = activeSubs.filter(s => s.plan === 'basic').length
  const premiumActive = activeSubs.filter(s => s.plan === 'premium').length
  const mrr = basicActive * SUBSCRIPTION_PLANS.basic.price_monthly + premiumActive * SUBSCRIPTION_PLANS.premium.price_monthly

  const filtered = subs
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s =>
      s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.profile?.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.plan?.toLowerCase().includes(search.toLowerCase())
    )

  const planLabel = (plan: string) => {
    if (plan === 'basic') return 'Learner'
    if (plan === 'premium') return 'Champion'
    if (plan === 'free') return 'Explorer'
    return plan
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Subscriptions ({subs.length})</h1>
        <p className="text-sm text-foreground/50">Manage student subscriptions. Each subscription links a student to a plan and controls what levels they can access.</p>
      </div>

      <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-violet-700">{tip}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-green-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{formatPKR(mrr)}</p><p className="text-xs text-foreground/50">Monthly MRR</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xl font-mono font-extrabold">{activeSubs.length}</p><p className="text-xs text-foreground/50">Active Subs</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><Star className="h-4 w-4 text-blue-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{basicActive}</p><p className="text-xs text-foreground/50">Learner Plans</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center"><Crown className="h-4 w-4 text-amber-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{premiumActive}</p><p className="text-xs text-foreground/50">Champion Plans</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search by name or plan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'cancelled', 'expired'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-foreground/50">
          No subscriptions found. Subscriptions are created when students choose a paid plan.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  s.plan === 'premium' ? 'bg-amber-100' : s.plan === 'basic' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {s.plan === 'premium' ? <Crown className="h-5 w-5 text-amber-600" /> : <Star className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.profile?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-foreground/50">{s.profile?.email}</p>
                </div>
                <Badge variant={s.plan === 'premium' ? 'accent' : 'primary'}>{planLabel(s.plan)}</Badge>
                <div className="hidden lg:flex items-center gap-1 text-xs text-foreground/50">
                  <Calendar size={12} />
                  {new Date(s.starts_at).toLocaleDateString()}
                  {s.ends_at && ` → ${new Date(s.ends_at).toLocaleDateString()}`}
                </div>
                <Badge variant={s.status === 'active' ? 'success' : s.status === 'cancelled' ? 'secondary' : 'outline'}>
                  {s.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
