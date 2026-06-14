'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StudentStats } from '@/types/database.types'

export function useStudent(userId: string | undefined) {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const fetchStats = async () => {
      const { data } = await supabase
        .from('student_stats')
        .select('*')
        .eq('student_id', userId)
        .single()
      setStats(data)
      setLoading(false)
    }

    fetchStats()

    const channel = supabase
      .channel(`stats-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_stats', filter: `student_id=eq.${userId}` },
        (payload) => {
          setStats(payload.new as StudentStats)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { stats, loading }
}
