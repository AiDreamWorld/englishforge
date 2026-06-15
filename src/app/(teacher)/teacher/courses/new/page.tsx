'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Loader2, FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const router = useRouter()
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    is_free: true,
    price: 0,
    skills: '',
    age_group: '8-10',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data, error } = await supabase.from('courses').insert({
      title: form.title,
      slug: `${slug}-${Date.now().toString(36)}`,
      description: form.description,
      is_free: form.is_free,
      price: form.is_free ? 0 : form.price,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      age_group: [form.age_group],
      teacher_id: user.id,
      status: 'draft',
    }).select().single()

    if (error) {
      console.error('Create course error:', error)
      toast.error('Failed to create course: ' + error.message)
      setSaving(false)
      return
    }
    toast.success('Course created! Opening Course Builder...')
    router.push(`/teacher/courses/${data.id}/edit`)
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (file.size > 20 * 1024 * 1024) { toast.error('PDF must be under 20MB'); return }

    setPdfUploading(true)
    toast.info('🤖 Sending PDF to Claude AI... This may take 30-60 seconds.')

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const res = await fetch('/api/ai/pdf-to-course', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        console.error('PDF API error:', data)
        toast.error(data.error || 'Failed to process PDF')
        setPdfUploading(false)
        return
      }

      toast.success(`🎉 ${data.message}`)
      router.push(`/teacher/courses/${data.courseId}/edit`)
    } catch (err) {
      console.error('PDF upload failed:', err)
      toast.error('Failed to upload PDF')
    }
    setPdfUploading(false)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display">✨ Create New Course</h1>

      {/* AI PDF Import */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-5xl">🤖</div>
          <h3 className="text-lg font-display font-extrabold">AI-Powered Course Creation</h3>
          <p className="text-sm text-foreground/60 max-w-md mx-auto">
            Upload any PDF and Claude AI will automatically convert it into a full course with sections, lessons, labs, quizzes, and resources!
          </p>
          <label className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${
            pdfUploading
              ? 'bg-purple-200 text-purple-400 cursor-wait'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90'
          }`}>
            {pdfUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {pdfUploading ? 'AI is processing your PDF...' : 'Upload PDF & Auto-Generate Course'}
            <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={pdfUploading} />
          </label>
          <p className="text-xs text-foreground/40">Supports PDF files up to 20MB • Works with any educational content</p>
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-foreground/40 font-bold">OR CREATE MANUALLY</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Manual Creation */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} /> Course Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Course Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none"
                rows={4}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What will students learn in this course?"
              />
            </div>
            <Input label="Skills (comma-separated)" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="grammar, vocabulary, reading" />
            <div>
              <label className="block text-sm font-medium mb-1">Age Group</label>
              <select className="w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.age_group} onChange={e => setForm(p => ({ ...p, age_group: e.target.value }))}>
                <option value="5-7">5-7 years</option>
                <option value="8-10">8-10 years</option>
                <option value="11-13">11-13 years</option>
                <option value="14-16">14-16 years</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="free" checked={form.is_free} onChange={e => setForm(p => ({ ...p, is_free: e.target.checked }))} className="rounded" />
              <label htmlFor="free" className="text-sm">Free course</label>
            </div>
            {!form.is_free && (
              <Input label="Price (PKR)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create & Open Builder'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
