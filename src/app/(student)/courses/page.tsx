'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Users, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDuration } from '@/lib/utils/format'
import type { Course } from '@/types/database.types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Courses</h1>
        <p className="text-text-secondary mt-1">Explore and enroll in courses to level up your English</p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Courses are being prepared by our amazing teachers. Check back soon!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/courses/${course.slug}`}>
                <Card className="h-full group cursor-pointer">
                  <div className="h-40 rounded-t-[1rem] bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-primary/40" />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {course.is_free && <Badge variant="success" size="sm">Free</Badge>}
                      {course.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                      ))}
                    </div>
                    <h3 className="text-lg font-display font-bold text-text-primary group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.total_lessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(course.total_duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course.enrolled_count}
                      </span>
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                          {course.rating.toFixed(1)}
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
