'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Building2, Smartphone, CreditCard, Lightbulb, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Students see enabled payment gateways on the subscribe page with your account details.',
  'Bank Transfer is the most common method in Pakistan. Always include IBAN for international transfers.',
  'EasyPaisa and JazzCash are popular mobile wallets — most students prefer them.',
  'After a student sends payment, manually verify and activate their subscription from the Payments page.',
  'Instructions field is shown to students — write clear steps for how to pay.',
]

const DEFAULT_GATEWAYS = [
  {
    slug: 'bank_transfer',
    display_name: 'Bank Transfer',
    icon: '🏦',
    fields: [
      { key: 'bank_name', label: 'Bank Name', placeholder: 'Meezan Bank' },
      { key: 'account_name', label: 'Account Name', placeholder: 'Aadil Khan' },
      { key: 'account_number', label: 'Account #', placeholder: '01234567890123' },
      { key: 'iban', label: 'IBAN', placeholder: 'PK36MEZN0000000001234567' },
      { key: 'swift', label: 'SWIFT (optional)', placeholder: 'MEZNPKKA' },
      { key: 'instructions', label: 'Instructions to user', placeholder: 'Transfer the amount to the account above. Include the reference code in the transfer note.', multiline: true },
    ],
  },
  {
    slug: 'easypaisa',
    display_name: 'EasyPaisa',
    icon: '📱',
    fields: [
      { key: 'mobile_number', label: 'Mobile #', placeholder: '03451234567' },
      { key: 'account_name', label: 'Account Name', placeholder: 'Aadil Khan' },
      { key: 'instructions', label: 'Instructions to user', placeholder: 'Send via EasyPaisa to the number above. Include the reference code in the message.', multiline: true },
    ],
  },
  {
    slug: 'jazzcash',
    display_name: 'JazzCash',
    icon: '💚',
    fields: [
      { key: 'mobile_number', label: 'Mobile #', placeholder: '03001234567' },
      { key: 'account_name', label: 'Account Name', placeholder: 'Aadil Khan' },
      { key: 'instructions', label: 'Instructions to user', placeholder: 'Send via JazzCash to the number above. Include the reference code in the message.', multiline: true },
    ],
  },
]

interface GatewayData {
  id?: string
  slug: string
  display_name: string
  enabled: boolean
  config: Record<string, string>
}

export default function AdminPaymentGatewaysPage() {
  const [gateways, setGateways] = useState<GatewayData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('payment_gateways').select('*').order('display_name')

      const existing = (data || []) as GatewayData[]
      const merged = DEFAULT_GATEWAYS.map(def => {
        const found = existing.find(e => e.slug === def.slug)
        if (found) return found
        return { slug: def.slug, display_name: def.display_name, enabled: true, config: {} }
      })
      setGateways(merged)
      setLoading(false)
    }
    load()
  }, [])

  const updateConfig = (slug: string, key: string, value: string) => {
    setGateways(prev => prev.map(gw =>
      gw.slug === slug ? { ...gw, config: { ...gw.config, [key]: value } } : gw
    ))
  }

  const toggleEnabled = (slug: string) => {
    setGateways(prev => prev.map(gw =>
      gw.slug === slug ? { ...gw, enabled: !gw.enabled } : gw
    ))
  }

  const saveGateway = async (gw: GatewayData) => {
    setSaving(gw.slug)
    const supabase = createClient()
    const payload = {
      slug: gw.slug,
      display_name: gw.display_name,
      enabled: gw.enabled,
      config: gw.config,
    }

    if (gw.id) {
      await supabase.from('payment_gateways').update(payload).eq('id', gw.id)
    } else {
      const { data } = await supabase.from('payment_gateways').insert(payload).select().single()
      if (data) {
        setGateways(prev => prev.map(g => g.slug === gw.slug ? { ...g, id: data.id } : g))
      }
    }
    toast.success(`${gw.display_name} saved!`)
    setSaving(null)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Payment Gateways</h1>
        <p className="text-sm text-foreground/50">Configure bank accounts and mobile wallets where students send payments.</p>
      </div>

      <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-teal-700">{tip}</p>
      </div>

      {DEFAULT_GATEWAYS.map(def => {
        const gw = gateways.find(g => g.slug === def.slug)
        if (!gw) return null

        return (
          <Card key={def.slug} className="overflow-hidden">
            <CardHeader className="bg-surface border-b flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{def.icon}</span>
                <div>
                  <CardTitle className="text-lg">{def.display_name}</CardTitle>
                  <p className="text-xs text-foreground/40">{def.slug}</p>
                </div>
              </div>
              <button onClick={() => toggleEnabled(def.slug)} className="flex items-center gap-2">
                {gw.enabled ? (
                  <><ToggleRight className="h-8 w-8 text-green-500" /><span className="text-sm font-bold text-green-600">Enabled</span></>
                ) : (
                  <><ToggleLeft className="h-8 w-8 text-foreground/30" /><span className="text-sm font-bold text-foreground/40">Disabled</span></>
                )}
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {def.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-display font-bold mb-1">{field.label}</label>
                  {field.multiline ? (
                    <textarea
                      className="w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
                      placeholder={field.placeholder}
                      value={gw.config[field.key] || ''}
                      onChange={e => updateConfig(def.slug, field.key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      className="w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder={field.placeholder}
                      value={gw.config[field.key] || ''}
                      onChange={e => updateConfig(def.slug, field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <Button onClick={() => saveGateway(gw)} disabled={saving === def.slug} className="bg-gradient-to-r from-primary to-indigo-600">
                <Save className="h-4 w-4 mr-2" />
                {saving === def.slug ? 'Saving...' : 'Save'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
