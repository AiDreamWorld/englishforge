'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, BookOpen, Gamepad2, Trophy, Star } from 'lucide-react'

const AVATAR_FACES = [
  '😀','😃','😄','😁','😆','😊','🙂','😎','🤓','😇',
  '🥳','🤩','😺','🐱','🐶','🐰','🦊','🐼','🐨','🦁',
  '🐯','🐸','🐵','🦄','🐲','🐙','🦋','🐝','🐞','🦜',
  '🐧','🐢','🦀','🐬','🐠','🦩','🦚','🐿️','🐾','🌟',
]

const ENGLISH_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'I\'m just starting to learn English', emoji: '🌱' },
  { id: 'elementary', label: 'Elementary', desc: 'I know some basic words and phrases', emoji: '📖' },
  { id: 'intermediate', label: 'Intermediate', desc: 'I can read and write simple sentences', emoji: '✍️' },
  { id: 'advanced', label: 'Advanced', desc: 'I\'m quite good but want to improve more', emoji: '🚀' },
]

const INTERESTS = [
  { id: 'stories', label: 'Stories & Reading', emoji: '📚' },
  { id: 'games', label: 'Word Games', emoji: '🎮' },
  { id: 'videos', label: 'Videos & Songs', emoji: '🎵' },
  { id: 'speaking', label: 'Speaking Practice', emoji: '🗣️' },
  { id: 'writing', label: 'Creative Writing', emoji: '✏️' },
  { id: 'grammar', label: 'Grammar Challenges', emoji: '🧩' },
  { id: 'quizzes', label: 'Fun Quizzes', emoji: '🏆' },
  { id: 'science', label: 'Science in English', emoji: '🔬' },
]

const GOALS = [
  { id: 'school', label: 'Do better in school', emoji: '🏫' },
  { id: 'speak', label: 'Speak English fluently', emoji: '💬' },
  { id: 'read', label: 'Read English books', emoji: '📖' },
  { id: 'exams', label: 'Pass English exams', emoji: '📝' },
  { id: 'fun', label: 'Just for fun!', emoji: '🎉' },
  { id: 'friends', label: 'Talk with friends in English', emoji: '👫' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('😀')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
      if (profile?.role !== 'student') { router.push('/teacher/dashboard'); return }
      const name = profile?.full_name?.split(' ')[0] || 'Friend'
      setUserName(name)
      setDisplayName(name)
    }
    load()
  }, [router])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const handleFinish = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      display_name: displayName,
      avatar_emoji: selectedAvatar,
      onboarding_completed: true,
    }).eq('id', user.id)

    router.push('/dashboard')
  }

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="text-center">
      <SparkyCharacter mood="celebrating" size={160} className="mx-auto" />
      <h1 className="mt-6 text-4xl font-display font-extrabold text-text-primary">
        Welcome to EnglishForge, {userName}! 🎉
      </h1>
      <p className="mt-3 text-lg text-text-secondary max-w-md mx-auto">
        We&apos;re so excited to have you here! Let&apos;s set up your profile so we can make your learning experience amazing.
      </p>
      <div className="mt-8 flex items-center justify-center gap-6">
        {[
          { icon: Gamepad2, label: '120 Levels', color: 'text-primary' },
          { icon: Trophy, label: '40+ Badges', color: 'text-accent' },
          { icon: Star, label: 'Earn XP', color: 'text-success' },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <item.icon className={`h-8 w-8 ${item.color}`} />
            <span className="text-xs font-display font-bold text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>,

    // Step 1: Choose Avatar
    <motion.div key="avatar" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center">
      <h2 className="text-2xl font-display font-extrabold text-text-primary">Choose Your Avatar 🎭</h2>
      <p className="mt-2 text-text-secondary">Pick a face that represents you!</p>

      <div className="mt-4 flex justify-center">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-5xl shadow-xl border-4 border-white">
          {selectedAvatar}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-8 gap-2 max-w-md mx-auto">
        {AVATAR_FACES.map(face => (
          <button
            key={face}
            onClick={() => setSelectedAvatar(face)}
            className={`h-12 w-12 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110 ${
              selectedAvatar === face
                ? 'bg-primary/20 ring-2 ring-primary scale-110 shadow-md'
                : 'bg-card hover:bg-primary/5 border border-border'
            }`}
          >
            {face}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-xs mx-auto">
        <label className="block text-sm font-display font-bold text-text-primary mb-1 text-left">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="What should we call you?"
        />
      </div>
    </motion.div>,

    // Step 2: English Level
    <motion.div key="level" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center">
      <h2 className="text-2xl font-display font-extrabold text-text-primary">What&apos;s Your English Level? 📊</h2>
      <p className="mt-2 text-text-secondary">This helps us find the right starting point for you</p>

      <div className="mt-8 grid grid-cols-1 gap-3 max-w-md mx-auto">
        {ENGLISH_LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              selectedLevel === level.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/30 bg-card'
            }`}
          >
            <span className="text-3xl">{level.emoji}</span>
            <div>
              <p className={`font-display font-bold ${selectedLevel === level.id ? 'text-primary' : 'text-text-primary'}`}>{level.label}</p>
              <p className="text-xs text-text-secondary">{level.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 3: Interests
    <motion.div key="interests" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center">
      <h2 className="text-2xl font-display font-extrabold text-text-primary">What Do You Like? 🎯</h2>
      <p className="mt-2 text-text-secondary">Pick up to 4 things you enjoy (we&apos;ll customize your experience!)</p>

      <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg mx-auto">
        {INTERESTS.map(interest => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              selectedInterests.includes(interest.id)
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/30 bg-card'
            }`}
          >
            <span className="text-2xl">{interest.emoji}</span>
            <span className={`text-sm font-display font-bold ${selectedInterests.includes(interest.id) ? 'text-primary' : 'text-text-primary'}`}>
              {interest.label}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-text-secondary">{selectedInterests.length}/4 selected</p>
    </motion.div>,

    // Step 4: Goal
    <motion.div key="goal" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="text-center">
      <h2 className="text-2xl font-display font-extrabold text-text-primary">What&apos;s Your Goal? 🎯</h2>
      <p className="mt-2 text-text-secondary">Why do you want to learn English?</p>

      <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg mx-auto">
        {GOALS.map(goal => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              selectedGoal === goal.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/30 bg-card'
            }`}
          >
            <span className="text-2xl">{goal.emoji}</span>
            <span className={`text-sm font-display font-bold ${selectedGoal === goal.id ? 'text-primary' : 'text-text-primary'}`}>
              {goal.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 5: All Set!
    <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
      <div className="relative inline-block">
        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-6xl shadow-2xl border-4 border-white mx-auto">
          {selectedAvatar}
        </div>
        <div className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-success flex items-center justify-center shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
      </div>
      <h2 className="mt-6 text-3xl font-display font-extrabold text-text-primary">
        You&apos;re All Set, {displayName}! 🚀
      </h2>
      <p className="mt-3 text-lg text-text-secondary max-w-md mx-auto">
        Your personalized learning adventure awaits. Let&apos;s start earning XP and collecting badges!
      </p>
      <SparkyCharacter mood="celebrating" size={100} className="mx-auto mt-4" />
    </motion.div>,
  ]

  const canProceed = () => {
    if (step === 1) return displayName.trim().length >= 2
    if (step === 2) return selectedLevel !== ''
    if (step === 3) return selectedInterests.length >= 1
    if (step === 4) return selectedGoal !== ''
    return true
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress bar */}
      <div className="flex gap-2 mb-8 max-w-md mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      <div className="mt-8 flex justify-center gap-4">
        {step > 0 && step < 5 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < 5 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} size="lg">
            {step === 0 ? 'Let\'s Go!' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleFinish} size="xl">
            Start My Adventure!
            <Sparkles className="h-5 w-5" />
          </Button>
        )}
      </div>

      {step > 0 && step < 5 && (
        <button
          onClick={() => { setStep(5) }}
          className="block mx-auto mt-4 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          I know what I&apos;m doing — skip this
        </button>
      )}
    </div>
  )
}
