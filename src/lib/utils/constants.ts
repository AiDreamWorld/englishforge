export const APP_NAME = 'EnglishForge'
export const APP_TAGLINE = 'Where Children Learn English and Love It'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const COLORS = {
  primary: '#6C63FF',
  secondary: '#FF6B6B',
  accent: '#FFD93D',
  success: '#6BCB77',
  info: '#4D96FF',
  background: '#F7F3FF',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#4A4A6A',
  border: '#E8E0FF',
} as const

export const AGE_GROUPS = ['5-7', '8-10', '11-13', '14-15'] as const

export const XP_REWARDS = {
  COMPLETE_LESSON: 50,
  PASS_QUIZ: 100,
  PERFECT_QUIZ: 200,
  SUBMIT_ASSIGNMENT: 75,
  COMPLETE_LEVEL: 500,
  STREAK_7: 250,
  STREAK_30: 1000,
  WATCH_VIDEO: 30,
  DAILY_LOGIN: 20,
} as const

export const COIN_REWARDS = {
  COMPLETE_LESSON: 10,
  PASS_QUIZ: 25,
  PERFECT_QUIZ: 50,
  SUBMIT_ASSIGNMENT: 15,
  COMPLETE_LEVEL: 100,
  STREAK_7: 75,
  STREAK_30: 300,
  WATCH_VIDEO: 5,
  DAILY_LOGIN: 5,
} as const

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Explorer',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      'Access to Levels 1-5',
      '3 quizzes per day',
      'Basic progress tracking',
      '1 live class per month',
    ],
    limits: { levels: 5, quizzes_per_day: 3 },
  },
  basic: {
    name: 'Learner',
    price_monthly: 999,
    price_yearly: 8999,
    features: [
      'Access to Levels 1-40',
      'Unlimited quizzes',
      'All progress features',
      '4 live classes per month',
      'Assignment submissions',
    ],
    limits: { levels: 40, quizzes_per_day: -1 },
  },
  premium: {
    name: 'Champion',
    price_monthly: 2499,
    price_yearly: 21999,
    features: [
      'All 100 levels',
      'Unlimited everything',
      'AI personal tutor',
      'Unlimited live classes',
      'Priority support',
      'Certificate on level completion',
    ],
    limits: { levels: 100, quizzes_per_day: -1 },
  },
} as const
