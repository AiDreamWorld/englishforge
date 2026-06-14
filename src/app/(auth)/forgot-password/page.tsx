'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
    })

    if (error) {
      toast.error('Something went wrong', { description: error.message })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <SparkyCharacter mood="encouraging" size={100} />
        <h1 className="mt-4 text-2xl font-display font-extrabold text-text-primary">
          Check Your Email!
        </h1>
        <p className="mt-2 text-text-secondary">
          We sent you a password reset link. Click the link in the email to set a new password.
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <SparkyCharacter mood="thinking" size={100} />
        <h1 className="mt-4 text-2xl font-display font-extrabold text-text-primary">
          Forgot Your Password?
        </h1>
        <p className="mt-1 text-text-secondary text-center">
          No worries! Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="bg-card rounded-[1.5rem] border border-border shadow-[0_8px_40px_rgba(108,99,255,0.12)] p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/50 pointer-events-none" />
            <Input
              {...register('email')}
              type="email"
              placeholder="Your email address"
              error={errors.email?.message}
              className="pl-11"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
