'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Brain, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<Record<string, unknown> | null>(null)

  const generateReport = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentData: { totalStudents: 150, activeStudents: 120, avgScore: 72, topCourses: ['Grammar Basics', 'Vocabulary Builder'], commonErrors: ['Subject-verb agreement', 'Article usage'] },
          reportMonth: new Date().toISOString().slice(0, 10),
        }),
      })
      const data = await res.json()
      if (data.insights) setReport(data.insights)
      else toast.error('Failed to generate')
    } catch { toast.error('Error generating report') }
    setGenerating(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">AI Reports</h1>
        <Button onClick={generateReport} disabled={generating}>
          <Sparkles size={16} className="mr-2" /> {generating ? 'Generating...' : 'Generate Monthly Report'}
        </Button>
      </div>

      {generating && <div className="flex justify-center py-12"><LoadingSpinner /></div>}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain size={20} /> AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-surface-2 rounded-xl p-4 overflow-auto max-h-96">
              {JSON.stringify(report, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <FileText size={24} className="text-foreground/30" />
          <div>
            <p className="font-medium">Monthly reports are generated using GPT-4o</p>
            <p className="text-sm text-foreground/50">Reports analyze student performance, identify trends, and provide actionable recommendations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
