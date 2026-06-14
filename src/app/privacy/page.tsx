import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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

      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-sm">
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Privacy Policy</h1>
        <p className="text-text-secondary text-sm">Last updated: June 2026</p>

        <div className="mt-8 space-y-6 text-text-secondary text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account: name, email address, age group, and parent/guardian email for users under 13. We also collect learning progress data, quiz scores, and platform usage analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">2. How We Use Your Information</h2>
            <p>Your information is used to personalize the learning experience, generate progress reports, communicate important updates, and improve our platform. We use AI to analyze learning patterns and provide personalized recommendations.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">3. Children&apos;s Privacy (COPPA)</h2>
            <p>We are committed to protecting children&apos;s privacy. For users under 13, we require verifiable parental consent. Parents can review, modify, or delete their child&apos;s information at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">4. Data Security</h2>
            <p>We use industry-standard encryption (TLS 1.3) for all data transmission. User data is stored securely on Supabase infrastructure with row-level security policies. We conduct regular security audits.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">5. Data Sharing</h2>
            <p>We do not sell, trade, or share personal information with third parties for marketing purposes. We may share anonymized, aggregated data for research purposes. Service providers who assist our operations are bound by strict confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You can export your learning data at any time. To exercise these rights, contact us at support@englishforge.pk.</p>
          </section>

          <section>
            <h2 className="text-lg font-display font-bold text-text-primary">7. Contact</h2>
            <p>For privacy-related inquiries, contact us at support@englishforge.pk or write to PANOS Technologies, Lahore, Pakistan.</p>
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
