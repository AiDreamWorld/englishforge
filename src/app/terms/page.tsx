import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Terms of Service</h1>
        <p className="text-text-secondary text-sm mt-1">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">1. Acceptance of Terms</h2>
            <p>By accessing or using EnglishForge, you agree to these Terms of Service. If you are registering on behalf of a minor, you confirm that you are the parent or legal guardian.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">2. Account Registration</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. Users under 13 require parental consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">3. Subscriptions & Payments</h2>
            <p>Paid plans are billed monthly or annually as selected. Prices are in Pakistani Rupees (PKR). We accept EasyPaisa, JazzCash, NayaPay, SadaPay, and bank transfers. Subscriptions auto-renew unless cancelled.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">4. Acceptable Use</h2>
            <p>You agree not to misuse the platform, attempt unauthorized access, share accounts, or use automated tools to interact with the service. Content created by users (assignments, messages) must be appropriate for a children&apos;s platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">5. Intellectual Property</h2>
            <p>All content, including courses, quizzes, graphics, and the Sparky character, is owned by PANOS Technologies. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">6. Limitation of Liability</h2>
            <p>EnglishForge is provided &quot;as is&quot;. We do not guarantee uninterrupted service or specific learning outcomes. Our liability is limited to the amount paid for the subscription in the current billing period.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">7. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. You may cancel your account at any time. Upon cancellation, your data will be retained for 30 days before deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">8. Contact</h2>
            <p>For questions about these terms, contact us at support@englishforge.pk.</p>
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
