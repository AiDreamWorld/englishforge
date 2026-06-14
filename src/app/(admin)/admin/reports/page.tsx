'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BarChart3, Brain, Sparkles, Lightbulb, FileText, Download, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const TIPS = [
  'AI Reports analyze real student data to find trends, at-risk students, and curriculum gaps.',
  'Generate reports monthly to track platform health over time.',
  'You can use either OpenAI (GPT-4o) or Anthropic (Claude) as the AI provider.',
  'Reports include actionable recommendations — share them with your teaching team.',
  'The more students and quiz data you have, the more insightful the reports become.',
]

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [report, setReport] = useState('')
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, quizAttempts: 0, avgXP: 0, activeRate: 0 })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [studentsRes, teachersRes, coursesRes, quizRes, activeRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('assessment_attempts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('last_seen_at', weekAgo),
      ])

      const studentCount = studentsRes.count || 0
      const activeCount = activeRes.count || 0

      let avgXP = 0
      if (studentCount > 0) {
        const { data: xpData } = await supabase.from('student_stats').select('total_xp')
        if (xpData && xpData.length) {
          avgXP = Math.round(xpData.reduce((s, r) => s + (r.total_xp || 0), 0) / xpData.length)
        }
      }

      setStats({
        students: studentCount,
        teachers: teachersRes.count || 0,
        courses: coursesRes.count || 0,
        quizAttempts: quizRes.count || 0,
        avgXP,
        activeRate: studentCount > 0 ? Math.round((activeCount / studentCount) * 100) : 0,
      })
      setDataLoading(false)
    }
    load()
  }, [])

  const generateReport = async () => {
    setLoading(true)
    setReport('')
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          studentData: {
            totalStudents: stats.students,
            totalTeachers: stats.teachers,
            totalCourses: stats.courses,
            activeStudents: Math.round(stats.students * stats.activeRate / 100),
            avgXP: stats.avgXP,
            quizAttempts: stats.quizAttempts,
            activeRate: stats.activeRate,
          },
        }),
      })

      if (!res.ok) throw new Error('Failed to generate report')
      const data = await res.json()
      setReport(data.report || data.content || JSON.stringify(data, null, 2))
      toast.success('Report generated!')
    } catch (err) {
      toast.error('Failed to generate report. Check your API key in environment variables.')
    }
    setLoading(false)
  }

  if (dataLoading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">AI Reports</h1>
        <p className="text-sm text-foreground/50">Generate AI-powered insights about your platform using real student data.</p>
      </div>

      <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-700">{tip}</p>
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-info" /> Data Being Analyzed</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.students}</p>
              <p className="text-xs text-foreground/50">Students</p>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.teachers}</p>
              <p className="text-xs text-foreground/50">Teachers</p>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.courses}</p>
              <p className="text-xs text-foreground/50">Courses</p>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.quizAttempts}</p>
              <p className="text-xs text-foreground/50">Quiz Attempts</p>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.avgXP}</p>
              <p className="text-xs text-foreground/50">Avg XP</p>
            </div>
            <div className="text-center p-3 bg-surface rounded-xl">
              <p className="text-xl font-mono font-extrabold">{stats.activeRate}%</p>
              <p className="text-xs text-foreground/50">Active Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Provider + Generate */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Generate Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-display font-bold mb-2">AI Provider</label>
            <div className="flex gap-3">
              <button
                onClick={() => setProvider('openai')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  provider === 'openai' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <Sparkles className={`h-5 w-5 ${provider === 'openai' ? 'text-primary' : 'text-foreground/40'}`} />
                <div className="text-left">
                  <p className={`text-sm font-bold ${provider === 'openai' ? 'text-primary' : 'text-foreground'}`}>OpenAI GPT-4o</p>
                  <p className="text-xs text-foreground/50">Requires OPENAI_API_KEY</p>
                </div>
              </button>
              <button
                onClick={() => setProvider('anthropic')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  provider === 'anthropic' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <Brain className={`h-5 w-5 ${provider === 'anthropic' ? 'text-primary' : 'text-foreground/40'}`} />
                <div className="text-left">
                  <p className={`text-sm font-bold ${provider === 'anthropic' ? 'text-primary' : 'text-foreground'}`}>Anthropic Claude</p>
                  <p className="text-xs text-foreground/50">Requires ANTHROPIC_API_KEY</p>
                </div>
              </button>
            </div>
          </div>

          <Button onClick={generateReport} disabled={loading} size="lg" className="w-full">
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate AI Report</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Output */}
      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-success" /> Report</CardTitle>
              <Badge variant="success">Generated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-surface rounded-xl p-6 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">{report}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
