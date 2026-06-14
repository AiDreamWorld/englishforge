'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gamepad2, Star, BookOpen, Brain, Video,
  Sparkles, Trophy, ChevronDown, ArrowRight, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'
import { SUBSCRIPTION_PLANS } from '@/lib/utils/constants'
import { formatPKR } from '@/lib/utils/format'
import { useState } from 'react'

const features = [
  { icon: Gamepad2, title: '100 Learning Levels', desc: 'Progress through beautifully themed worlds — from sunny meadows to outer space!' },
  { icon: Brain, title: 'Gamified Quizzes', desc: 'Multiple question types, instant feedback, hints from Sparky, and XP rewards.' },
  { icon: Video, title: 'Live Classes', desc: 'Join interactive sessions with expert English teachers in real time.' },
  { icon: Sparkles, title: 'AI-Powered Learning', desc: 'Personalized hints, explanations, and monthly progress reports powered by AI.' },
  { icon: Trophy, title: 'Achievements & Badges', desc: 'Earn 40+ badges, climb the leaderboard, and show off your skills!' },
  { icon: BookOpen, title: 'Rich Course Content', desc: 'Videos, audio, interactive exercises, and reading materials for every level.' },
]

const faqs = [
  { q: 'What ages is EnglishForge designed for?', a: 'EnglishForge is designed for children aged 5 to 15. Content difficulty adjusts automatically based on the student\'s age group and level.' },
  { q: 'Is there a free plan?', a: 'Yes! Our Explorer plan gives free access to the first 5 levels, 3 quizzes per day, and 1 live class per month. No credit card required.' },
  { q: 'How does the leveling system work?', a: 'Students earn XP by completing lessons, quizzes, and daily activities. XP accumulates and unlocks new levels — there are 100 levels in total, each with increasing challenges.' },
  { q: 'Can teachers create their own content?', a: 'Absolutely! Teachers get a full course builder with lesson editor, quiz builder, and live class scheduler.' },
  { q: 'What payment methods do you accept?', a: 'We accept EasyPaisa, JazzCash, NayaPay, SadaPay, and Meezan Bank for convenient payment in Pakistan.' },
  { q: 'Is my child\'s data safe?', a: 'Yes. We require parent email for children under 13, use encrypted connections, and never share student data with third parties.' },
  { q: 'Can I track my child\'s progress?', a: 'Parents receive monthly AI-generated progress reports and can access the student dashboard anytime.' },
  { q: 'Do you offer certificates?', a: 'Champion plan students earn certificates upon completing each level milestone. These can be downloaded and shared.' },
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
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 flex items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-text-primary leading-tight">
              Where Children{' '}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                Love Learning
              </span>{' '}
              English
            </h1>
            <p className="mt-6 text-xl text-text-secondary max-w-lg">
              100 levels of fun, gamified English education for ages 5-15. Earn badges, climb leaderboards, and learn with AI-powered help.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/register">
                <Button size="xl">
                  Start for Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="xl">See How It Works</Button>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6">
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
            <SparkyCharacter mood="excited" size={280} />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-card py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-extrabold text-text-primary text-center">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up free in seconds. No credit card needed.' },
              { step: '2', title: 'Choose Your Level', desc: 'Take a quick placement quiz to find your starting level.' },
              { step: '3', title: 'Start Learning!', desc: 'Complete lessons, earn XP, unlock levels, and collect badges.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-xl mb-4">
                  <span className="text-2xl font-mono font-extrabold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-display font-extrabold text-text-primary text-center">
            Everything You Need to Excel
          </h2>
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <feat.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-lg font-display font-bold text-text-primary">{feat.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-extrabold text-text-primary text-center">
            What Parents Are Saying
          </h2>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { name: 'Ayesha Malik', city: 'Lahore', quote: 'My daughter looks forward to her English lessons every single day. The badges and streaks keep her motivated!' },
              { name: 'Ahmed Khan', city: 'Karachi', quote: 'The AI reports help me understand exactly where my son needs improvement. It\'s like having a personal tutor.' },
              { name: 'Fatima Ali', city: 'Islamabad', quote: 'The live classes are fantastic. My kids love interacting with the teachers and competing on the leaderboard.' },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary italic">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-text-primary">{testimonial.name}</p>
                        <p className="text-xs text-text-secondary">{testimonial.city}</p>
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
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-extrabold text-text-primary text-center">
            Choose Your Plan
          </h2>

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

          <div className="mt-10 grid grid-cols-3 gap-6">
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
                    <Card className={`relative h-full ${isPopular ? 'ring-2 ring-primary shadow-xl shadow-primary/20' : ''}`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-display font-bold px-4 py-1 rounded-full">
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
                            {price === 0 ? 'Get Started' : 'Subscribe'}
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
          <h2 className="text-3xl font-display font-extrabold text-text-primary text-center">
            Frequently Asked Questions
          </h2>
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
                    <p className="text-sm text-text-secondary">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SparkyCharacter mood="celebrating" size={120} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-display font-extrabold text-text-primary">
            Join 500+ Students Already Learning with EnglishForge
          </h2>
          <p className="mt-3 text-text-secondary text-lg">
            Start your free account today. No credit card required.
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
      <footer className="bg-text-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-extrabold">EnglishForge</span>
            </div>
            <p className="text-sm text-white/50">
              Made with love in Pakistan
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/40">
            &copy; {new Date().getFullYear()} EnglishForge by PANOS Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
