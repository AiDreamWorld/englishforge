'use client'

import { motion, type TargetAndTransition, type Transition } from 'framer-motion'

export type SparkyMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging' | 'sleeping'

interface SparkyCharacterProps {
  mood?: SparkyMood
  size?: number
  className?: string
}

const moodAnimations: Record<SparkyMood, { animate: TargetAndTransition; transition: Transition }> = {
  happy: {
    animate: { rotate: [0, -3, 3, 0] },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
  excited: {
    animate: { y: [0, -15, 0], scale: [1, 1.1, 1] },
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
  thinking: {
    animate: { rotate: [0, 5, 0] },
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
  celebrating: {
    animate: { y: [0, -20, 0], rotate: [0, 10, -10, 0] },
    transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' },
  },
  encouraging: {
    animate: { scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
  sleeping: {
    animate: { rotate: [0, 2, 0] },
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
  },
}

export function SparkyCharacter({ mood = 'happy', size = 120, className }: SparkyCharacterProps) {
  const { animate, transition } = moodAnimations[mood]

  return (
    <motion.div
      className={className}
      animate={animate}
      transition={transition}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        {/* Body */}
        <ellipse cx="100" cy="130" rx="55" ry="50" fill="#FF8C42" />
        {/* Head */}
        <circle cx="100" cy="80" r="45" fill="#FFA756" />
        {/* Left Ear */}
        <path d="M65 45 L55 10 L85 35 Z" fill="#FF8C42" />
        <path d="M68 42 L60 18 L82 37 Z" fill="#FFD4A8" />
        {/* Right Ear */}
        <path d="M135 45 L145 10 L115 35 Z" fill="#FF8C42" />
        <path d="M132 42 L140 18 L118 37 Z" fill="#FFD4A8" />
        {/* Face patch */}
        <ellipse cx="100" cy="90" rx="30" ry="25" fill="#FFD4A8" />
        {/* Eyes */}
        {mood === 'sleeping' ? (
          <>
            <path d="M80 75 Q85 80 90 75" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M110 75 Q115 80 120 75" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="85" cy="75" r="6" fill="#1A1A2E" />
            <circle cx="115" cy="75" r="6" fill="#1A1A2E" />
            <circle cx="87" cy="73" r="2" fill="white" />
            <circle cx="117" cy="73" r="2" fill="white" />
          </>
        )}
        {/* Nose */}
        <ellipse cx="100" cy="85" rx="5" ry="4" fill="#1A1A2E" />
        {/* Mouth */}
        {mood === 'excited' || mood === 'celebrating' ? (
          <path d="M88 95 Q100 110 112 95" stroke="#1A1A2E" strokeWidth="2.5" fill="#FF6B6B" strokeLinecap="round" />
        ) : mood === 'thinking' ? (
          <circle cx="108" cy="95" r="4" fill="#1A1A2E" opacity="0.3" />
        ) : mood === 'sleeping' ? (
          <path d="M92 95 Q100 100 108 95" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M90 93 Q100 105 110 93" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {/* Belly patch */}
        <ellipse cx="100" cy="140" rx="25" ry="20" fill="#FFD4A8" />
        {/* Tail */}
        <path d="M45 130 Q25 100 40 80" stroke="#FF8C42" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="80" r="6" fill="#FFD4A8" />
        {/* Paws */}
        <ellipse cx="70" cy="170" rx="12" ry="8" fill="#FFA756" />
        <ellipse cx="130" cy="170" rx="12" ry="8" fill="#FFA756" />
        {/* Encouraging thumbs up */}
        {mood === 'encouraging' && (
          <g transform="translate(145, 100)">
            <circle cx="0" cy="0" r="12" fill="#FFA756" />
            <rect x="-3" y="-15" width="6" height="12" rx="3" fill="#FFA756" />
          </g>
        )}
        {/* Thinking paw on chin */}
        {mood === 'thinking' && (
          <ellipse cx="115" cy="95" rx="8" ry="6" fill="#FFA756" />
        )}
        {/* Sleeping zzz */}
        {mood === 'sleeping' && (
          <g fill="#6C63FF" fontFamily="var(--font-nunito)" fontWeight="bold">
            <text x="130" y="60" fontSize="14" opacity="0.5">z</text>
            <text x="140" y="45" fontSize="18" opacity="0.7">z</text>
            <text x="150" y="28" fontSize="22">Z</text>
          </g>
        )}
        {/* Celebrating stars */}
        {mood === 'celebrating' && (
          <>
            <text x="40" y="40" fontSize="20">⭐</text>
            <text x="145" y="35" fontSize="16">✨</text>
            <text x="155" y="65" fontSize="14">⭐</text>
          </>
        )}
      </svg>
    </motion.div>
  )
}
