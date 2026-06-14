import { createClient } from '@/lib/supabase/client'

export function getXPForLevel(level: number): number {
  return (level - 1) * 500
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 500) + 1
}

export function getLevelProgress(totalXP: number): {
  current: number
  required: number
  percentage: number
} {
  const level = calculateLevel(totalXP)
  const xpForCurrentLevel = getXPForLevel(level)
  const xpForNextLevel = getXPForLevel(level + 1)
  const required = xpForNextLevel - xpForCurrentLevel
  const current = totalXP - xpForCurrentLevel

  return {
    current,
    required,
    percentage: Math.min(Math.round((current / required) * 100), 100),
  }
}

export async function awardXP(
  studentId: string,
  amount: number,
  reason: string,
  entityId?: string
): Promise<{ newTotal: number; leveledUp: boolean; newLevel?: number }> {
  const supabase = createClient()

  const { data: stats } = await supabase
    .from('student_stats')
    .select('total_xp, current_level')
    .eq('student_id', studentId)
    .single()

  if (!stats) {
    throw new Error('Student stats not found')
  }

  const newTotal = stats.total_xp + amount
  const newLevel = calculateLevel(newTotal)
  const leveledUp = newLevel > stats.current_level

  await supabase
    .from('student_stats')
    .update({
      total_xp: newTotal,
      current_level: newLevel,
    })
    .eq('student_id', studentId)

  await supabase.from('activity_log').insert({
    user_id: studentId,
    event_type: 'xp_earned',
    entity_type: reason,
    entity_id: entityId,
    metadata: { amount, new_total: newTotal, leveled_up: leveledUp },
  })

  if (leveledUp) {
    await supabase.from('activity_log').insert({
      user_id: studentId,
      event_type: 'level_up',
      metadata: { from: stats.current_level, to: newLevel },
    })

    await supabase.from('notifications').insert({
      user_id: studentId,
      title: `Level Up! You reached Level ${newLevel}!`,
      body: `Amazing work! You've grown from Level ${stats.current_level} to Level ${newLevel}. Keep going!`,
      type: 'achievement',
      icon: 'level_up',
    })
  }

  return { newTotal, leveledUp, newLevel: leveledUp ? newLevel : undefined }
}
