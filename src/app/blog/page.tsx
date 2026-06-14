'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gamepad2, Calendar, ArrowRight, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const posts = [
  {
    title: '10 Fun Ways to Practice English at Home',
    excerpt: 'Discover simple activities that make English practice enjoyable for children of all ages. From storytelling to language games.',
    date: '2026-06-10',
    readTime: '5 min',
    category: 'Tips',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Why Gamification Works for Language Learning',
    excerpt: 'Research shows gamified learning increases retention by 40%. Here\'s the science behind EnglishForge\'s approach.',
    date: '2026-06-05',
    readTime: '7 min',
    category: 'Research',
    color: 'bg-info/10 text-info',
  },
  {
    title: 'How to Build a Daily English Learning Habit',
    excerpt: 'Consistency is key. Learn how to help your child develop a sustainable daily English practice routine.',
    date: '2026-05-28',
    readTime: '4 min',
    category: 'Parenting',
    color: 'bg-success/10 text-success',
  },
  {
    title: 'The Role of AI in Modern Education',
    excerpt: 'How artificial intelligence is personalizing education and helping students learn at their own pace.',
    date: '2026-05-20',
    readTime: '6 min',
    category: 'Technology',
    color: 'bg-accent/10 text-accent',
  },
  {
    title: 'Common English Mistakes Pakistani Students Make',
    excerpt: 'A guide to the most frequent errors and how EnglishForge helps students overcome them through practice.',
    date: '2026-05-15',
    readTime: '5 min',
    category: 'Education',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Celebrating Our First 500 Students',
    excerpt: 'A milestone worth celebrating! Read about our journey and what\'s coming next for EnglishForge.',
    date: '2026-05-10',
    readTime: '3 min',
    category: 'News',
    color: 'bg-info/10 text-info',
  },
]

export default function BlogPage() {
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
            <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">About Us</Link>
            <Link href="/blog" className="text-sm font-medium text-primary">Blog</Link>
            <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link href="/register"><Button size="sm">Start Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl font-display font-extrabold text-text-primary">Blog</h1>
            <p className="mt-3 text-text-secondary">Tips, research, and updates from the EnglishForge team</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <motion.div key={post.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <span className={`inline-block text-xs font-display font-bold px-3 py-1 rounded-full ${post.color}`}>
                      {post.category}
                    </span>
                    <h2 className="mt-3 text-lg font-display font-bold text-text-primary">{post.title}</h2>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
