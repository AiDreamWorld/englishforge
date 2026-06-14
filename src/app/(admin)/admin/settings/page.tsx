'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Shield, Bell, BookOpen, Lightbulb, Save, Settings, Gamepad2
} from 'lucide-react'

const TIPS = [
  'Disable registration temporarily during maintenance windows.',
  'Turn off Google login if you want email-only signups.',
  'Enable maintenance mode before deploying database changes.',
  'Set quiz time limits based on student feedback from AI Reports.',
]

function Toggle({ enabled, onChange, label, desc }: { enabled: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface/50 transition-colors">
      <div>
        <p className="text-sm font-display font-bold text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function AdminSettingsPage() {
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])
  const [settings, setSettings] = useState({
    registrationOpen: true,
    googleLoginEnabled: true,
    maintenanceMode: false,
    emailNotifications: true,
    newStudentAlerts: true,
    paymentAlerts: true,
    weeklyReportEmail: true,
    gamificationEnabled: true,
    leaderboardPublic: true,
    streakReminders: true,
    badgeNotifications: true,
    xpMultiplier: false,
    quizTimeLimits: true,
    aiHintsEnabled: true,
    liveClassesEnabled: true,
    assignmentsEnabled: true,
    parentDashboard: false,
    autoSuspendInactive: false,
    requireParentEmail: true,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Platform Settings</h1>
          <p className="text-sm text-foreground/50">Control every aspect of your EnglishForge platform.</p>
        </div>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save All Changes</Button>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">{tip}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Access &amp; Security</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Toggle enabled={settings.registrationOpen} onChange={() => toggle('registrationOpen')} label="Open Registration" desc="Allow new students and teachers to sign up" />
            <Toggle enabled={settings.googleLoginEnabled} onChange={() => toggle('googleLoginEnabled')} label="Google Login" desc="Allow sign in with Google accounts" />
            <Toggle enabled={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} label="Maintenance Mode" desc="Show maintenance page to all non-admin users" />
            <Toggle enabled={settings.requireParentEmail} onChange={() => toggle('requireParentEmail')} label="Require Parent Email" desc="Mandatory for students under 13 years old" />
            <Toggle enabled={settings.autoSuspendInactive} onChange={() => toggle('autoSuspendInactive')} label="Auto-Suspend Inactive" desc="Suspend accounts inactive for 90+ days" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-info" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Toggle enabled={settings.emailNotifications} onChange={() => toggle('emailNotifications')} label="Email Notifications" desc="Send emails for important events" />
            <Toggle enabled={settings.newStudentAlerts} onChange={() => toggle('newStudentAlerts')} label="New Student Alerts" desc="Get notified when a new student registers" />
            <Toggle enabled={settings.paymentAlerts} onChange={() => toggle('paymentAlerts')} label="Payment Alerts" desc="Get notified for new payments and failures" />
            <Toggle enabled={settings.weeklyReportEmail} onChange={() => toggle('weeklyReportEmail')} label="Weekly Report Email" desc="Receive weekly platform summary every Monday" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gamepad2 className="h-5 w-5 text-accent" /> Gamification</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Toggle enabled={settings.gamificationEnabled} onChange={() => toggle('gamificationEnabled')} label="Gamification System" desc="Enable XP, coins, badges, and leaderboards" />
            <Toggle enabled={settings.leaderboardPublic} onChange={() => toggle('leaderboardPublic')} label="Public Leaderboard" desc="Show leaderboard to all students" />
            <Toggle enabled={settings.streakReminders} onChange={() => toggle('streakReminders')} label="Streak Reminders" desc="Notify students when their streak is about to break" />
            <Toggle enabled={settings.badgeNotifications} onChange={() => toggle('badgeNotifications')} label="Badge Notifications" desc="Show celebration when students earn badges" />
            <Toggle enabled={settings.xpMultiplier} onChange={() => toggle('xpMultiplier')} label="2x XP Weekend" desc="Double XP rewards on Saturday and Sunday" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-success" /> Learning Features</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Toggle enabled={settings.quizTimeLimits} onChange={() => toggle('quizTimeLimits')} label="Quiz Time Limits" desc="Enforce time limits on quiz assessments" />
            <Toggle enabled={settings.aiHintsEnabled} onChange={() => toggle('aiHintsEnabled')} label="AI Hints (Sparky)" desc="Allow Sparky to give AI-powered hints during quizzes" />
            <Toggle enabled={settings.liveClassesEnabled} onChange={() => toggle('liveClassesEnabled')} label="Live Classes" desc="Enable teachers to schedule and run live classes" />
            <Toggle enabled={settings.assignmentsEnabled} onChange={() => toggle('assignmentsEnabled')} label="Assignments" desc="Enable homework assignments from teachers" />
            <Toggle enabled={settings.parentDashboard} onChange={() => toggle('parentDashboard')} label="Parent Dashboard" desc="Allow parents to view child progress (coming soon)" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Platform Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div><p className="text-text-secondary">Platform</p><p className="font-bold">EnglishForge v1.0</p></div>
            <div><p className="text-text-secondary">Framework</p><p className="font-bold">Next.js 16</p></div>
            <div><p className="text-text-secondary">Database</p><p className="font-bold">Supabase</p></div>
            <div><p className="text-text-secondary">Hosting</p><p className="font-bold">Vercel</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
