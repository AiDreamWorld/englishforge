'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  Plus, Trash2, Save, Send, ChevronDown, ChevronRight,
  FileText, FlaskConical, ClipboardCheck, GraduationCap, Download, BookOpen,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface LessonItem {
  id: string
  title: string
  description: string
  content: string
  lesson_type: string
  section_title: string
  section_order: number
  duration_minutes: number
  order_index: number
  xp_reward: number
  is_preview: boolean
  status: string
}

const LESSON_TYPES = [
  { value: 'lesson', label: 'Lesson', emoji: '📖', icon: FileText, description: 'Text-based teaching content' },
  { value: 'reading', label: 'Reading', emoji: '📚', icon: BookOpen, description: 'Reading activity or annotated extract' },
  { value: 'lab', label: 'Lab', emoji: '🧪', icon: FlaskConical, description: 'Writing task or exercise (teacher grades)' },
  { value: 'quiz', label: 'Quiz', emoji: '📝', icon: ClipboardCheck, description: 'Assessment checkpoint' },
  { value: 'exam', label: 'Exam', emoji: '🎓', icon: GraduationCap, description: 'End-of-course examination' },
  { value: 'resource', label: 'Resource', emoji: '📎', icon: Download, description: 'Downloadable reference material' },
]

const TIPS = [
  'Structure: PDF Day/Chapter → Section. Each concept page → Lesson. Each task → Lab. End-of-section questions → Quiz.',
  'A good course has 4-6 sections with 3-5 items each. Mix lessons, labs, and quizzes for engagement.',
  'Mark the first lesson as "Preview" so students can try before enrolling.',
  'Labs are teacher-graded tasks. Quizzes are auto-graded checkpoints. Exams are final assessments.',
  'Resources are cheat sheets or reference cards students can access anytime.',
  'Use HTML in content: <h2>, <p>, <ul>, <li>, <blockquote>, <strong>, <em> for rich formatting.',
]

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Record<string, unknown> | null>(null)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', skills: '', tags: '' })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: c } = await supabase.from('courses').select('*').eq('id', params.id).single()
      if (c) {
        setCourse(c)
        setForm({
          title: c.title,
          description: c.description || '',
          skills: (c.skills || []).join(', '),
          tags: (c.tags || []).join(', '),
        })
      }
      const { data: l } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', params.id)
        .order('section_order', { ascending: true })
        .order('order_index', { ascending: true })
      const items = (l || []) as LessonItem[]
      setLessons(items)
      setExpandedSections(new Set(items.map(i => i.section_title || 'General')))
      setLoading(false)
    }
    load()
  }, [params.id])

  const saveCourse = async () => {
    setSaving(true)
    const supabase = createClient()
    const totalDuration = lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0)
    await supabase.from('courses').update({
      title: form.title,
      description: form.description,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      total_lessons: lessons.length,
      total_duration_minutes: totalDuration,
    }).eq('id', params.id)
    toast.success('Course saved!')
    setSaving(false)
  }

  const publishCourse = async () => {
    if (lessons.length === 0) { toast.error('Add at least one lesson before publishing'); return }
    const supabase = createClient()
    await supabase.from('courses').update({ status: 'published' }).eq('id', params.id)
    // Also publish all lessons
    await supabase.from('lessons').update({ status: 'published' }).eq('course_id', params.id)
    setCourse(prev => prev ? { ...prev, status: 'published' } : prev)
    toast.success('Course published! Students can now see it.')
  }

  const sections = (() => {
    const map = new Map<string, LessonItem[]>()
    const orders = new Map<string, number>()
    lessons.forEach(l => {
      const sec = l.section_title || 'General'
      if (!map.has(sec)) { map.set(sec, []); orders.set(sec, l.section_order || 0) }
      map.get(sec)!.push(l)
    })
    const result: { title: string; order: number; items: LessonItem[] }[] = []
    map.forEach((items, title) => result.push({ title, order: orders.get(title) || 0, items }))
    result.sort((a, b) => a.order - b.order)
    return result
  })()

  const addSection = () => {
    if (!newSectionName.trim()) { toast.error('Section name required'); return }
    setShowAddSection(false)
    setExpandedSections(prev => new Set([...prev, newSectionName]))
    // Add a default lesson in the new section
    addLessonToSection(newSectionName, (sections.length) + 1)
    setNewSectionName('')
  }

  const addLessonToSection = async (sectionTitle: string, sectionOrder: number) => {
    const supabase = createClient()
    const sectionLessons = lessons.filter(l => l.section_title === sectionTitle)
    const maxOrder = sectionLessons.length > 0 ? Math.max(...sectionLessons.map(l => l.order_index)) + 1 : 0
    const totalMax = lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 0

    const { data } = await supabase.from('lessons').insert({
      course_id: params.id,
      title: `New Item`,
      section_title: sectionTitle,
      section_order: sectionOrder,
      order_index: Math.max(maxOrder, totalMax),
      lesson_type: 'lesson',
      xp_reward: 20,
      duration_minutes: 10,
      status: 'draft',
    }).select().single()

    if (data) {
      setLessons(prev => [...prev, data as LessonItem])
      setEditingLesson(data.id)
    }
  }

  const updateLesson = (id: string, updates: Partial<LessonItem>) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const saveLesson = async (lesson: LessonItem) => {
    const supabase = createClient()
    await supabase.from('lessons').update({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      lesson_type: lesson.lesson_type,
      section_title: lesson.section_title,
      section_order: lesson.section_order,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      is_preview: lesson.is_preview,
      order_index: lesson.order_index,
    }).eq('id', lesson.id)
    toast.success('Saved!')
    setEditingLesson(null)
  }

  const deleteLesson = async (id: string) => {
    if (!confirm('Delete this item?')) return
    const supabase = createClient()
    await supabase.from('lessons').delete().eq('id', id)
    setLessons(prev => prev.filter(l => l.id !== id))
    toast.success('Deleted')
  }

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  if (loading) return <LoadingSpinner />
  if (!course) return <div className="p-8">Course not found</div>

  const typeConfig = Object.fromEntries(LESSON_TYPES.map(t => [t.value, t]))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">✏️ Course Builder</h1>
          <p className="text-sm text-foreground/50">Build your course with sections, lessons, labs, quizzes & more</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>← Back</Button>
          <Button onClick={saveCourse} disabled={saving}>
            <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save All'}
          </Button>
          {(course as Record<string, string>).status === 'draft' && (
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600" onClick={publishCourse}>
              <Send size={16} className="mr-2" /> Publish
            </Button>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tip}</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant={(course as Record<string, string>).status === 'published' ? 'success' : 'accent'}>
          {(course as Record<string, string>).status}
        </Badge>
        <span className="text-foreground/50">{sections.length} sections • {lessons.length} items</span>
        <span className="text-foreground/50">{lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0)} min total</span>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader><CardTitle>📋 Course Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Course Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe what students will learn in this course..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Skills (comma-separated)" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="writing, grammar, vocabulary" />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="creative, story, beginner" />
          </div>
        </CardContent>
      </Card>

      {/* Sections & Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-extrabold">📚 Course Content</h2>
          <Button onClick={() => setShowAddSection(true)} className="bg-gradient-to-r from-primary to-indigo-600">
            <Plus size={16} className="mr-2" /> Add Section
          </Button>
        </div>

        {/* Add Section Form */}
        {showAddSection && (
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <input
                className="flex-1 rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Section title, e.g. 'Section 1: Who Is Your Character?'"
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSection()}
                autoFocus
              />
              <Button onClick={addSection}>Create</Button>
              <Button variant="outline" onClick={() => setShowAddSection(false)}>Cancel</Button>
            </CardContent>
          </Card>
        )}

        {/* Section List */}
        {sections.length === 0 && !showAddSection && (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-display font-extrabold text-foreground/60">No content yet</h3>
              <p className="text-sm text-foreground/40 mt-2 max-w-md mx-auto">
                Click "Add Section" to create your first section (e.g. "Section 1: Introduction").
                Then add lessons, labs, quizzes, and resources inside each section.
              </p>
            </CardContent>
          </Card>
        )}

        {sections.map((section, sIdx) => {
          const isExpanded = expandedSections.has(section.title)
          return (
            <Card key={section.title} className="overflow-hidden border-2">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-4 bg-surface cursor-pointer hover:bg-surface/80" onClick={() => toggleSection(section.title)}>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-foreground/30" /> : <ChevronRight className="h-5 w-5 text-foreground/30" />}
                <div className="flex-1">
                  <h3 className="font-display font-extrabold">{section.title}</h3>
                  <p className="text-xs text-foreground/40">{section.items.length} items</p>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); addLessonToSection(section.title, section.order) }}>
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>

              {/* Section Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t">
                    {section.items.map((lesson) => {
                      const type = typeConfig[lesson.lesson_type] || typeConfig.lesson
                      const isEditing = editingLesson === lesson.id

                      return (
                        <div key={lesson.id} className="border-b border-border/30 last:border-0">
                          {/* Collapsed Row */}
                          <div
                            className="flex items-center gap-3 px-5 py-3 hover:bg-primary/5 cursor-pointer"
                            onClick={() => setEditingLesson(isEditing ? null : lesson.id)}
                          >
                            <span className="text-lg">{type.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{lesson.title || 'Untitled'}</p>
                              {lesson.description && <p className="text-xs text-foreground/40 truncate">{lesson.description}</p>}
                            </div>
                            <Badge variant="outline" className="text-[10px]">{type.label}</Badge>
                            <span className="text-xs text-foreground/30">{lesson.duration_minutes}m</span>
                            <span className="text-xs text-foreground/30">{lesson.xp_reward} XP</span>
                            {lesson.is_preview && <Badge variant="accent" className="text-[10px]">Preview</Badge>}
                          </div>

                          {/* Expanded Editor */}
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-surface/50 border-t border-border/30"
                              >
                                <div className="p-5 space-y-4">
                                  {/* Type Selector */}
                                  <div>
                                    <label className="block text-sm font-bold mb-2">Content Type</label>
                                    <div className="flex flex-wrap gap-2">
                                      {LESSON_TYPES.map(t => (
                                        <button
                                          key={t.value}
                                          onClick={() => updateLesson(lesson.id, { lesson_type: t.value })}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                                            lesson.lesson_type === t.value
                                              ? 'border-primary bg-primary/5 font-bold'
                                              : 'border-border hover:border-primary/30'
                                          }`}
                                        >
                                          <span>{t.emoji}</span> {t.label}
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-xs text-foreground/40 mt-1">{LESSON_TYPES.find(t => t.value === lesson.lesson_type)?.description}</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-bold mb-1">Title</label>
                                      <input
                                        className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                        value={lesson.title}
                                        onChange={e => updateLesson(lesson.id, { title: e.target.value })}
                                        placeholder="e.g. Section 1: What Makes a Great Character?"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-bold mb-1">Description (short)</label>
                                      <input
                                        className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                                        value={lesson.description || ''}
                                        onChange={e => updateLesson(lesson.id, { description: e.target.value })}
                                        placeholder="Brief description shown in the course outline"
                                      />
                                    </div>
                                  </div>

                                  {/* Content Editor */}
                                  <div>
                                    <label className="block text-sm font-bold mb-1">Content (HTML supported)</label>
                                    <textarea
                                      className="w-full rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                                      rows={8}
                                      value={lesson.content || ''}
                                      onChange={e => updateLesson(lesson.id, { content: e.target.value })}
                                      placeholder="<h2>Lesson Title</h2>
<p>Write your content here...</p>
<ul>
  <li><strong>Key point 1</strong> — explanation</li>
  <li><strong>Key point 2</strong> — explanation</li>
</ul>"
                                    />
                                  </div>

                                  {/* Settings Row */}
                                  <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm font-bold">Duration:</label>
                                      <input
                                        type="number"
                                        className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm bg-white"
                                        value={lesson.duration_minutes}
                                        onChange={e => updateLesson(lesson.id, { duration_minutes: Number(e.target.value) })}
                                      />
                                      <span className="text-xs text-foreground/40">min</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm font-bold">XP Reward:</label>
                                      <input
                                        type="number"
                                        className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm bg-white"
                                        value={lesson.xp_reward}
                                        onChange={e => updateLesson(lesson.id, { xp_reward: Number(e.target.value) })}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        id={`preview-${lesson.id}`}
                                        checked={lesson.is_preview}
                                        onChange={e => updateLesson(lesson.id, { is_preview: e.target.checked })}
                                        className="rounded"
                                      />
                                      <label htmlFor={`preview-${lesson.id}`} className="text-sm">Allow preview (non-enrolled students can see)</label>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 pt-2 border-t">
                                    <Button onClick={() => saveLesson(lesson)} className="bg-gradient-to-r from-green-500 to-emerald-600">
                                      <Save size={14} className="mr-2" /> Save Item
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditingLesson(null)}>Close</Button>
                                    <div className="flex-1" />
                                    <Button variant="ghost" className="text-red-500" onClick={() => deleteLesson(lesson.id)}>
                                      <Trash2 size={14} className="mr-1" /> Delete
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                    {section.items.length === 0 && (
                      <div className="p-6 text-center text-foreground/40 text-sm">
                        Empty section. Click "Add Item" above to add content.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
