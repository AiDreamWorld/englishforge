'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
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

    const { error } = await supabase.from('courses').insert({
      title: form.title,
      slug: `${slug}-${Date.now().toString(36)}`,
      description: form.description,
      is_free: form.is_free,
      price: form.is_free ? 0 : form.price,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      age_group: [form.age_group],
      teacher_id: user.id,
      status: 'draft',
    })

    if (error) { toast.error('Failed to create course'); setSaving(false); return }
    toast.success('Course created!')
    router.push('/teacher/courses')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-display mb-6">Create New Course</h1>
      <Card>
        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
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
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Course'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
