'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gamepad2, ArrowRight, Users, Target, Heart, Globe, Award, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const team = [
  { name: 'PANOS Technologies', role: 'Development Team', desc: 'Building innovative EdTech solutions for Pakistan\'s youth.' },
]

const values = [
  { icon: Heart, title: 'Child-First Design', desc: 'Every feature is designed with children\'s safety, engagement, and learning outcomes in mind.' },
  { icon: Globe, title: 'Made for Pakistan', desc: 'Content, pricing, and payment methods tailored specifically for Pakistani families.' },
  { icon: Target, title: 'Results-Driven', desc: 'We measure success by actual learning outcomes, not just engagement metrics.' },
  { icon: Award, title: 'Quality Content', desc: 'All content is created and reviewed by certified English language education experts.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-extrabold text-text-primary">EnglishForge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm font-medium text-primary">About Us</Link>
            <Link href="/blog" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link href="/register"><Button size="sm">Start Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-text-primary">About EnglishForge</h1>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              We&apos;re on a mission to make English education fun, accessible, and effective for every child in Pakistan.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-text-primary">Our Story</h2>
              <p className="mt-4 text-text-secondary leading-relaxed">
                EnglishForge was born from a simple observation: children in Pakistan struggle with English not because they lack intelligence, but because traditional methods fail to engage them.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                We combined proven educational methodologies with game mechanics — XP points, badges, leaderboards, and level progression — to create a platform where learning English feels like playing a game.
              </p>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Today, over 500 students across Pakistan use EnglishForge daily, and we&apos;re just getting started.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-2xl p-6 text-center">
                <p className="text-3xl font-mono font-extrabold text-primary">500+</p>
                <p className="text-sm text-text-secondary mt-1">Active Students</p>
              </div>
              <div className="bg-info/10 rounded-2xl p-6 text-center">
                <p className="text-3xl font-mono font-extrabold text-info">120</p>
                <p className="text-sm text-text-secondary mt-1">Learning Levels</p>
              </div>
              <div className="bg-success/10 rounded-2xl p-6 text-center">
                <p className="text-3xl font-mono font-extrabold text-success">40+</p>
                <p className="text-sm text-text-secondary mt-1">Badges</p>
              </div>
              <div className="bg-accent/10 rounded-2xl p-6 text-center">
                <p className="text-3xl font-mono font-extrabold text-accent">98%</p>
                <p className="text-sm text-text-secondary mt-1">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-display font-extrabold text-text-primary text-center">Our Values</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <v.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-text-primary">{v.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{v.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-display font-extrabold text-text-primary">Ready to Get Started?</h2>
          <p className="mt-3 text-text-secondary">Join hundreds of families who trust EnglishForge for their children&apos;s English education.</p>
          <Link href="/register">
            <Button size="xl" className="mt-6">Start Learning Free <ArrowRight className="h-5 w-5" /></Button>
          </Link>
        </div>
      </section>

      <footer className="bg-text-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} EnglishForge by PANOS Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
