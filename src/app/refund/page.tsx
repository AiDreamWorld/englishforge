import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RefundPage() {
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
          <Link href="/"><Button variant="ghost" size="sm">Back to Home</Button></Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Refund Policy</h1>
        <p className="text-text-secondary text-sm mt-1">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">7-Day Money-Back Guarantee</h2>
            <p>We offer a full refund within 7 days of your first paid subscription purchase if you are not satisfied with EnglishForge. No questions asked.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">How to Request a Refund</h2>
            <p>Email support@englishforge.pk with your account email and reason for the refund. Refunds are processed within 5-7 business days to your original payment method.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">After 7 Days</h2>
            <p>After the 7-day window, refunds are provided on a pro-rata basis for the unused portion of your subscription. Annual subscriptions may be eligible for partial refunds based on months remaining.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">Cancellation</h2>
            <p>You can cancel your subscription at any time. Your access continues until the end of your current billing period. No further charges will be made after cancellation.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">Contact</h2>
            <p>For refund requests or billing questions, contact support@englishforge.pk or call +92 300 1234567 during business hours (Mon-Sat, 9am-6pm PKT).</p>
          </section>
        </div>
      </div>

      <footer className="bg-text-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} EnglishForge by PANOS Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
