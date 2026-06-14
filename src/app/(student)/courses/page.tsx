'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Users, Star, Search, Sparkles, GraduationCap, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { formatDuration } from '@/lib/utils/format'
import type { Course } from '@/types/database.types'

const categoryEmojis: Record<string, string> = {
  grammar: '📝', vocabulary: '📖', speaking: '🎤', listening: '👂',
  reading: '📚', writing: '✍️', phonics: '🔤', conversation: '💬',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('enrolled_count', { ascending: false })
      setCourses(data || [])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  if (loading) return <FullPageLoader />

  const filtered = courses
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filter === 'all' || c.tags?.includes(filter))

  const allTags = [...new Set(courses.flatMap(c => c.tags || []))]

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 p-8 text-white">
        <div className="absolute top-2 right-4 text-[100px] leading-none opacity-20">📚</div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold flex items-center gap-3">
            📚 Courses
          </h1>
          <p className="text-white/80 mt-2 text-lg">Explore amazing courses crafted by our expert teachers!</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <BookOpen className="h-4 w-4" />
              <span className="font-bold">{courses.length} Courses</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <GraduationCap className="h-4 w-4" />
              <span className="font-bold">{courses.filter(c => c.is_free).length} Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            className="w-full rounded-2xl border-2 border-border bg-surface pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
            placeholder="🔍 Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')} className="rounded-full">
            ✨ All
          </Button>
          {allTags.slice(0, 5).map(tag => (
            <Button key={tag} size="sm" variant={filter === tag ? 'primary' : 'outline'} onClick={() => setFilter(tag)} className="rounded-full">
              {categoryEmojis[tag] || '📌'} {tag}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-8xl mb-4">📭</div>
          <h2 className="text-2xl font-display font-extrabold text-foreground/70">No courses yet</h2>
          <p className="text-foreground/50 mt-2 max-w-md mx-auto">
            Our amazing teachers are preparing incredible courses for you. Check back soon! 🎉
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/courses/${course.slug}`}>
                <Card className="h-full group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/20 overflow-hidden">
                  <div className="h-44 bg-gradient-to-br from-primary/20 via-info/20 to-purple-100 flex items-center justify-center overflow-hidden relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-center">
                        <div className="text-5xl mb-2">{categoryEmojis[course.tags?.[0] || ''] || '📖'}</div>
                        <BookOpen className="h-8 w-8 text-primary/30 mx-auto" />
                      </div>
                    )}
                    {course.is_free && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ✨ FREE
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {course.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-display font-extrabold group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-foreground/50 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-foreground/50 font-bold">
                      <span className="flex items-center gap-1">
                        📖 {course.total_lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        ⏱️ {formatDuration(course.total_duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {course.enrolled_count}
                      </span>
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
                          ⭐ {course.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
