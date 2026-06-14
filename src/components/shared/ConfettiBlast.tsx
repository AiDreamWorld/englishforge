'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiBlastProps {
  trigger: boolean
}

export function ConfettiBlast({ trigger }: ConfettiBlastProps) {
  useEffect(() => {
    if (!trigger) return

    const end = Date.now() + 2000
    const colors = ['#6C63FF', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [trigger])

  return null
}
