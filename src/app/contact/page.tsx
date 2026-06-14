'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gamepad2, Mail, Phone, MapPin, MessageCircle, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 1500)
  }

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
            <Link href="/blog" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="text-sm font-medium text-primary">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link href="/register"><Button size="sm">Start Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-4xl font-display font-extrabold text-text-primary">Contact Us</h1>
            <p className="mt-3 text-text-secondary">Have a question or feedback? We&apos;d love to hear from you.</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              {[
                { icon: Mail, title: 'Email', detail: 'support@englishforge.pk', sub: 'We reply within 24 hours' },
                { icon: Phone, title: 'Phone', detail: '+92 300 1234567', sub: 'Mon-Sat, 9am-6pm PKT' },
                { icon: MapPin, title: 'Office', detail: 'Lahore, Pakistan', sub: 'PANOS Technologies HQ' },
                { icon: Clock, title: 'Support Hours', detail: 'Mon - Sat', sub: '9:00 AM - 6:00 PM PKT' },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm text-text-primary">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.detail}</p>
                      <p className="text-xs text-text-secondary">{item.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-display font-bold text-text-primary mb-4">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                      <Input label="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                    </div>
                    <Input label="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="What's this about?" />
                    <div>
                      <label className="block text-sm font-medium mb-1">Message *</label>
                      <textarea
                        className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px]"
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Tell us what's on your mind..."
                      />
                    </div>
                    <Button type="submit" disabled={sending} className="w-full">
                      {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
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
