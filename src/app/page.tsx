'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gamepad2, Star, BookOpen, Brain, Video, Users, Globe, Shield,
  Sparkles, Trophy, ChevronDown, ArrowRight, Check, Zap, Award,
  BarChart3, Headphones, MessageCircle, GraduationCap, Heart,
  Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants'
import { formatPKR } from '@/lib/utils/format'
import { useState } from 'react'

const features = [
  { icon: Gamepad2, title: '120 Learning Levels', desc: 'Progress through beautifully themed worlds — from sunny meadows to outer space!', color: 'from-violet-500 to-purple-600' },
  { icon: Brain, title: 'Gamified Quizzes', desc: 'Multiple question types, instant feedback, hints from Sparky, and XP rewards.', color: 'from-pink-500 to-rose-600' },
  { icon: Video, title: 'Live Classes', desc: 'Join interactive sessions with expert English teachers in real time.', color: 'from-blue-500 to-cyan-600' },
  { icon: Sparkles, title: 'AI-Powered Learning', desc: 'Personalized hints, explanations, and monthly progress reports powered by AI.', color: 'from-amber-500 to-orange-600' },
  { icon: Trophy, title: 'Achievements & Badges', desc: 'Earn 40+ badges, climb the leaderboard, and show off your skills!', color: 'from-emerald-500 to-green-600' },
  { icon: BookOpen, title: 'Rich Course Content', desc: 'Videos, audio, interactive exercises, and reading materials for every level.', color: 'from-indigo-500 to-blue-600' },
  { icon: Headphones, title: 'Listening & Speaking', desc: 'Practice pronunciation with audio exercises and speech recognition tools.', color: 'from-teal-500 to-emerald-600' },
  { icon: BarChart3, title: 'Parent Dashboard', desc: 'Track your child\'s progress with detailed analytics and AI-generated reports.', color: 'from-fuchsia-500 to-pink-600' },
]

const stats = [
  { value: '500+', label: 'Active Students' },
  { value: '120', label: 'Learning Levels' },
  { value: '40+', label: 'Badges to Earn' },
  { value: '98%', label: 'Parent Satisfaction' },
]

const howItWorks = [
  { step: '1', title: 'Create Your Account', desc: 'Sign up free in seconds. No credit card needed. Pick your age group and you\'re ready!', icon: Users },
  { step: '2', title: 'Take Placement Quiz', desc: 'A quick fun quiz finds your perfect starting level. No stress, just play!', icon: Brain },
  { step: '3', title: 'Learn & Level Up', desc: 'Complete lessons, earn XP, unlock new levels, collect badges, and climb the leaderboard.', icon: Zap },
  { step: '4', title: 'Become a Champion', desc: 'Master all 120 levels and earn your EnglishForge Champion Certificate!', icon: GraduationCap },
]

const testimonials = [
  { name: 'Ayesha Malik', city: 'Lahore', role: 'Parent of 2', quote: 'My daughter looks forward to her English lessons every single day. The badges and streaks keep her motivated like nothing else!' },
  { name: 'Ahmed Khan', city: 'Karachi', role: 'Father', quote: 'The AI reports help me understand exactly where my son needs improvement. It\'s like having a personal tutor at a fraction of the cost.' },
  { name: 'Fatima Ali', city: 'Islamabad', role: 'Mother of 3', quote: 'The live classes are fantastic. My kids love interacting with the teachers and competing on the leaderboard.' },
  { name: 'Usman Raza', city: 'Rawalpindi', role: 'Parent', quote: 'We tried many platforms but EnglishForge is the only one that kept our kids engaged for more than a week. The gamification is brilliant!' },
  { name: 'Sara Imran', city: 'Faisalabad', role: 'Mother', quote: 'The pronunciation exercises and listening activities have improved my daughter\'s spoken English dramatically in just 3 months.' },
  { name: 'Hassan Siddiqui', city: 'Multan', role: 'Father', quote: 'Affordable, fun, and effective. My son went from struggling with basic sentences to writing short paragraphs confidently.' },
]

const faqs = [
  { q: 'What ages is EnglishForge designed for?', a: 'EnglishForge is designed for children aged 5 to 15. Content difficulty adjusts automatically based on the student\'s age group and level.' },
  { q: 'Is there a free plan?', a: 'Yes! Our Explorer plan gives free access to the first 5 levels, 3 quizzes per day, and 1 live class per month. No credit card required.' },
  { q: 'How does the leveling system work?', a: 'Students earn XP by completing lessons, quizzes, and daily activities. XP accumulates and unlocks new levels — there are 120 levels in total, each with increasing challenges.' },
  { q: 'Can teachers create their own content?', a: 'Absolutely! Teachers get a full course builder with lesson editor, quiz builder, assignment manager, and live class scheduler.' },
  { q: 'What payment methods do you accept?', a: 'We accept EasyPaisa, JazzCash, NayaPay, SadaPay, and Meezan Bank for convenient payment in Pakistan.' },
  { q: 'Is my child\'s data safe?', a: 'Yes. We require parent email for children under 13, use encrypted connections, and never share student data with third parties.' },
  { q: 'Can I track my child\'s progress?', a: 'Parents receive monthly AI-generated progress reports and can access the student dashboard anytime to see detailed analytics.' },
  { q: 'Do you offer certificates?', a: 'Champion plan students earn certificates upon completing each level milestone. These can be downloaded and shared on social media.' },
  { q: 'What makes EnglishForge different from other platforms?', a: 'Our gamified approach with 120 levels, XP system, badges, leaderboards, and AI-powered personalization keeps children engaged and motivated unlike traditional learning apps.' },
  { q: 'Can siblings share one account?', a: 'Each child needs their own account for personalized learning paths and accurate progress tracking. However, we offer family discounts for multiple subscriptions.' },
]

const subjects = [
  'Grammar', 'Vocabulary', 'Reading', 'Writing', 'Listening', 'Speaking', 'Phonics', 'Spelling',
  'Sentence Building', 'Story Writing', 'Comprehension', 'Pronunciation',
]

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-extrabold text-text-primary">EnglishForge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Pricing</a>
            <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">About Us</Link>
            <Link href="/blog" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-info/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-display font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              Pakistan&apos;s #1 Kids English Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-text-primary leading-tight">
              Where Children{' '}
              <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent bg-[length:200%] animate-pulse">
                Love Learning
              </span>{' '}
              English
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-text-secondary max-w-xl mx-auto lg:mx-0">
              120 levels of fun, gamified English education for ages 5-15. Earn badges, climb leaderboards, attend live classes, and learn with AI-powered help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/register">
                <Button size="xl">
                  Start Learning Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="xl">See How It Works</Button>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary">Trusted by <strong>500+</strong> students across Pakistan</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-info/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card rounded-3xl p-8 shadow-2xl border border-border">
                <SparkyCharacter mood="excited" size={240} />
                <div className="mt-4 text-center">
                  <p className="font-display font-bold text-text-primary">Meet Sparky!</p>
                  <p className="text-sm text-text-secondary">Your AI learning buddy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-primary to-info py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl lg:text-4xl font-mono font-extrabold">{stat.value}</p>
                <p className="text-sm text-white/80 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects We Cover */}
      <section className="py-16 bg-card">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-extrabold text-text-primary">Subjects We Cover</h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">Comprehensive English curriculum designed by education experts</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {subjects.map((subject, i) => (
              <motion.span
                key={subject}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-display font-bold hover:bg-primary/20 transition-colors cursor-default"
              >
                <Check className="h-4 w-4" />
                {subject}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-extrabold text-text-primary">How It Works</h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">Get started in minutes — it&apos;s as easy as 1-2-3-4!</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold -mt-2 mb-2">
                  {item.step}
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-extrabold text-text-primary">Everything You Need to Excel</h2>
            <p className="mt-3 text-text-secondary max-w-2xl mx-auto">A complete learning ecosystem designed to make English fun, engaging, and effective</p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feat.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-base font-display font-bold text-text-primary">{feat.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-extrabold text-text-primary">
                Why Parents Choose EnglishForge
              </h2>
              <p className="mt-4 text-text-secondary">
                We combine the best of education science with game design to create an experience children actually want to come back to.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Shield, title: 'Safe & Secure', desc: 'COPPA-compliant with parental controls. No ads, no distractions.' },
                  { icon: Globe, title: 'Made for Pakistan', desc: 'Content designed for Pakistani students. Local payment methods supported.' },
                  { icon: Award, title: 'Proven Results', desc: '85% of students improve their English grade within 3 months of regular use.' },
                  { icon: Heart, title: 'Kids Love It', desc: 'The gamification makes learning addictive (the good kind!). Average session: 25 minutes.' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-text-primary">{item.title}</h3>
                      <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-info/10 rounded-3xl blur-xl" />
                <div className="relative bg-card rounded-3xl p-8 shadow-xl border border-border space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                    <Trophy className="h-8 w-8 text-success" />
                    <div>
                      <p className="font-display font-bold text-text-primary text-sm">Level 42 Complete!</p>
                      <p className="text-xs text-text-secondary">+500 XP earned</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl">
                    <Award className="h-8 w-8 text-accent" />
                    <div>
                      <p className="font-display font-bold text-text-primary text-sm">New Badge Unlocked!</p>
                      <p className="text-xs text-text-secondary">Grammar Guru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-display font-bold text-text-primary text-sm">7-Day Streak!</p>
                      <p className="text-xs text-text-secondary">+250 bonus XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-info/10 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-info" />
                    <div>
                      <p className="font-display font-bold text-text-primary text-sm">Leaderboard Rank #3</p>
                      <p className="text-xs text-text-secondary">Keep going to reach #1!</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-extrabold text-text-primary">What Parents Are Saying</h2>
            <p className="mt-3 text-text-secondary">Join hundreds of happy families across Pakistan</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-text-primary">{testimonial.name}</p>
                        <p className="text-xs text-text-secondary">{testimonial.role} &middot; {testimonial.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-extrabold text-text-primary">Choose Your Plan</h2>
            <p className="mt-3 text-text-secondary">Start free, upgrade anytime. No hidden fees.</p>
          </div>

          <div className="flex justify-center mt-6">
            <div className="inline-flex bg-border/50 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-display font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-primary text-white shadow-md' : 'text-text-secondary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-display font-bold transition-all ${
                  billingCycle === 'yearly' ? 'bg-primary text-white shadow-md' : 'text-text-secondary'
                }`}
              >
                Yearly <span className="text-accent ml-1">Save 25%</span>
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(SUBSCRIPTION_PLANS) as [string, typeof SUBSCRIPTION_PLANS.free][]).map(
              ([key, plan], i) => {
                const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
                const isPopular = key === 'premium'
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`relative h-full ${isPopular ? 'ring-2 ring-primary shadow-xl shadow-primary/20 scale-105' : ''}`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-display font-bold px-4 py-1 rounded-full shadow-lg">
                          Most Popular
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="text-xl font-display font-extrabold text-text-primary">{plan.name}</h3>
                        <div className="mt-3">
                          {price === 0 ? (
                            <p className="text-3xl font-mono font-extrabold text-text-primary">Free</p>
                          ) : (
                            <div>
                              <p className="text-3xl font-mono font-extrabold text-text-primary">
                                {formatPKR(price)}
                              </p>
                              <p className="text-xs text-text-secondary">
                                /{billingCycle === 'monthly' ? 'month' : 'year'}
                              </p>
                            </div>
                          )}
                        </div>
                        <ul className="mt-6 space-y-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                              <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Link href="/register" className="block mt-6">
                          <Button
                            variant={isPopular ? 'primary' : 'outline'}
                            className="w-full"
                            size="lg"
                          >
                            {price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              }
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-display font-extrabold text-text-primary">Frequently Asked Questions</h2>
            <p className="mt-3 text-text-secondary">Got questions? We&apos;ve got answers.</p>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm font-display font-bold text-text-primary">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-text-secondary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-info/5" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <SparkyCharacter mood="celebrating" size={120} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-display font-extrabold text-text-primary">
            Join 500+ Students Already Learning with EnglishForge
          </h2>
          <p className="mt-3 text-text-secondary text-lg">
            Start your free account today. No credit card required. No commitments.
          </p>
          <Link href="/register">
            <Button size="xl" className="mt-8">
              Create Your Free Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-display font-extrabold text-lg">EnglishForge</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Pakistan&apos;s leading gamified English learning platform for children aged 5-15.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-sm text-white/60 hover:text-white transition-colors">Refund Policy</Link></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-white/60">
                  <Mail className="h-4 w-4" /> support@englishforge.pk
                </li>
                <li className="flex items-center gap-2 text-sm text-white/60">
                  <Phone className="h-4 w-4" /> +92 300 1234567
                </li>
                <li className="flex items-start gap-2 text-sm text-white/60">
                  <MapPin className="h-4 w-4 mt-0.5" /> Lahore, Pakistan
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              &copy; {new Date().getFullYear()} EnglishForge by PANOS Technologies. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              Made with <Heart className="h-3 w-3 inline text-red-400" /> in Pakistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
