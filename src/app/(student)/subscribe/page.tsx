'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, Zap, CheckCircle, Copy, CreditCard, Building2, Smartphone, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants'
import { formatPKR } from '@/lib/utils/format'
import { toast } from 'sonner'

interface PaymentGateway {
  id: string
  slug: string
  display_name: string
  enabled: boolean
  config: Record<string, string>
}

export default function SubscribePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null)
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      if (user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()
        if (sub) setCurrentPlan(sub.plan)
      }
      const { data: gw } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('enabled', true)
        .order('display_name')
      setGateways((gw || []) as PaymentGateway[])
      setLoading(false)
    }
    load()
  }, [user])

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`${label} copied!`)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return <FullPageLoader />

  const plans = [
    {
      key: 'basic' as const,
      name: 'Learner',
      emoji: '⭐',
      price: SUBSCRIPTION_PLANS.basic.price_monthly,
      color: 'from-blue-500 to-indigo-600',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200 hover:border-blue-400',
      features: SUBSCRIPTION_PLANS.basic.features,
      levels: '1-60',
    },
    {
      key: 'premium' as const,
      name: 'Champion',
      emoji: '👑',
      price: SUBSCRIPTION_PLANS.premium.price_monthly,
      color: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200 hover:border-amber-400',
      features: SUBSCRIPTION_PLANS.premium.features,
      levels: '1-120',
    },
  ]

  const gatewayIcons: Record<string, string> = {
    bank_transfer: '🏦', easypaisa: '📱', jazzcash: '💚',
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-8 text-6xl">⭐</div>
          <div className="absolute top-12 right-12 text-5xl">👑</div>
          <div className="absolute bottom-4 left-1/3 text-4xl">🎓</div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold">Upgrade Your Plan</h1>
          <p className="text-white/80 mt-2 text-lg">Unlock more levels, features, and accelerate your English journey!</p>
          {currentPlan && (
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mt-4">
              <CheckCircle className="h-4 w-4" />
              <span className="font-bold">Current: {currentPlan === 'premium' ? 'Champion' : currentPlan === 'basic' ? 'Learner' : 'Explorer (Free)'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.key
          const isSelected = selectedPlan === plan.key
          return (
            <motion.div key={plan.key} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                isSelected ? 'border-primary shadow-xl ring-2 ring-primary/20' : isActive ? 'border-green-400 shadow-lg' : plan.border
              }`} onClick={() => !isActive && setSelectedPlan(plan.key)}>
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white text-center`}>
                  <div className="text-5xl mb-2">{plan.emoji}</div>
                  <h2 className="text-2xl font-display font-extrabold">{plan.name}</h2>
                  <p className="text-white/70 text-sm">Levels {plan.levels}</p>
                  <div className="mt-3">
                    <span className="text-4xl font-mono font-extrabold">{formatPKR(plan.price)}</span>
                    <span className="text-white/60 text-sm">/month</span>
                  </div>
                </div>
                <CardContent className={`p-6 bg-gradient-to-b ${plan.bg}`}>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isActive ? (
                    <div className="mt-4 text-center">
                      <Badge variant="success" className="text-sm px-4 py-1">✅ Your Current Plan</Badge>
                    </div>
                  ) : (
                    <Button className={`w-full mt-4 bg-gradient-to-r ${plan.color}`} size="lg">
                      {isSelected ? '✅ Selected' : 'Choose Plan'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Payment Methods */}
      {selectedPlan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-display font-extrabold mb-4 flex items-center gap-2">
            💳 Payment Method
          </h2>

          {gateways.length === 0 ? (
            <Card className="border-2 border-dashed border-amber-300 bg-amber-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="font-bold text-amber-800">Payment methods not configured yet</p>
                <p className="text-sm text-amber-600 mt-1">
                  Please contact admin to set up payment gateways (Bank Transfer, EasyPaisa, JazzCash).
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {gateways.map(gw => (
                <Card
                  key={gw.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedGateway === gw.slug ? 'border-primary shadow-lg' : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedGateway(gw.slug)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{gatewayIcons[gw.slug] || '💳'}</span>
                        <div>
                          <h3 className="font-display font-extrabold text-lg">{gw.display_name}</h3>
                          <p className="text-xs text-foreground/40">{gw.slug}</p>
                        </div>
                      </div>
                      {selectedGateway === gw.slug && (
                        <Badge variant="primary">Selected</Badge>
                      )}
                    </div>

                    {selectedGateway === gw.slug && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 mt-4 bg-surface rounded-2xl p-4">
                        <p className="text-sm font-bold text-foreground/70 mb-2">
                          Send <span className="text-primary font-extrabold">{formatPKR(selectedPlan === 'premium' ? SUBSCRIPTION_PLANS.premium.price_monthly : SUBSCRIPTION_PLANS.basic.price_monthly)}</span> to:
                        </p>

                        {Object.entries(gw.config).filter(([k]) => !['instructions'].includes(k)).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between bg-white rounded-xl p-3 border">
                            <div>
                              <p className="text-xs text-foreground/40 capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="font-mono font-bold text-sm">{value}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyText(value, key) }}
                              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            >
                              {copied === key ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-foreground/40" />}
                            </button>
                          </div>
                        ))}

                        {gw.config.instructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-sm text-blue-700">{gw.config.instructions}</p>
                          </div>
                        )}

                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600" size="lg">
                          ✅ I&apos;ve Sent the Payment
                        </Button>
                        <p className="text-xs text-foreground/40 text-center">
                          After sending, click above. Admin will verify and activate your plan within 24 hours.
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
