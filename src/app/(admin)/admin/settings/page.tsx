'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'EnglishForge',
    supportEmail: 'support@englishforge.pk',
    maxStudentsPerClass: 30,
    defaultCurrency: 'PKR',
    enableNotifications: true,
    enableAIReports: true,
    maintenanceMode: false,
    registrationOpen: true,
  })

  const handleSave = () => {
    toast.success('Settings saved (demo)')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <Button onClick={handleSave}><Save size={16} className="mr-2" /> Save Changes</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe size={18} /> General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Site Name" value={settings.siteName} onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))} />
          <Input label="Support Email" value={settings.supportEmail} onChange={e => setSettings(p => ({ ...p, supportEmail: e.target.value }))} />
          <Input label="Max Students Per Class" type="number" value={settings.maxStudentsPerClass} onChange={e => setSettings(p => ({ ...p, maxStudentsPerClass: Number(e.target.value) }))} />
          <Input label="Default Currency" value={settings.defaultCurrency} onChange={e => setSettings(p => ({ ...p, defaultCurrency: e.target.value }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell size={18} /> Features</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: 'enableNotifications', label: 'Enable Push Notifications' },
            { key: 'enableAIReports', label: 'Enable AI Reports' },
            { key: 'registrationOpen', label: 'Open Registration' },
            { key: 'maintenanceMode', label: 'Maintenance Mode' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">{item.label}</span>
              <button
                onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                className={`w-11 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-primary' : 'bg-foreground/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={18} /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/60">
          <p>Supabase RLS is enabled on all tables.</p>
          <p>Authentication is handled via Supabase Auth with Google OAuth.</p>
          <p>API routes are protected with session validation.</p>
        </CardContent>
      </Card>
    </div>
  )
}
