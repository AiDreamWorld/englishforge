'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, DollarSign, TrendingUp,
  Star, Zap, AlertTriangle, Moon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'

interface PlatformStats {
  totalStudents: number
  activeToday: number
  monthlyRevenue: number
  avgCompletionRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalStudents: 0,
    activeToday: 0,
    monthlyRevenue: 0,
    avgCompletionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      setStats({
        totalStudents: studentCount || 0,
        activeToday: Math.floor((studentCount || 0) * 0.3),
        monthlyRevenue: 125000,
        avgCompletionRate: 68,
      })
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <FullPageLoader />

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-extrabold text-text-primary">Admin Dashboard</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10', change: '+12%' },
          { label: 'Active Today', value: stats.activeToday.toLocaleString(), icon: UserCheck, color: 'text-success', bg: 'bg-success/10', change: '+5%' },
          { label: 'Monthly Revenue', value: `PKR ${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10', change: '+18%' },
          { label: 'Completion Rate', value: `${stats.avgCompletionRate}%`, icon: TrendingUp, color: 'text-info', bg: 'bg-info/10', change: '+3%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Student Intelligence Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gifted Students', desc: 'Top 5% XP gain this week', icon: Star, color: 'text-accent', bg: 'bg-accent/10', count: 12 },
          { label: 'Fast Learners', desc: 'Most lessons per day', icon: Zap, color: 'text-primary', bg: 'bg-primary/10', count: 28 },
          { label: 'Needs Support', desc: 'Lowest progress, at risk', icon: AlertTriangle, color: 'text-secondary', bg: 'bg-secondary/10', count: 5 },
          { label: 'Losing Interest', desc: '7+ days inactive', icon: Moon, color: 'text-text-secondary', bg: 'bg-border', count: 8 },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-mono font-extrabold text-text-primary">{card.count}</p>
                <p className="text-sm font-display font-bold text-text-primary">{card.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{card.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Student Registrations (30 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">
              Chart will render with real data from Supabase
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue by Gateway</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">
              Chart will render with real payment data
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
