'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, LogIn, GraduationCap, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginBox({ role, onGoogleLogin }: { role: 'student' | 'teacher'; onGoogleLogin: () => void }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Oops! That didn\'t work', {
        description: error.message === 'Invalid login credentials'
          ? 'Check your email and password and try again.'
          : error.message,
      })
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push(role === 'teacher' ? '/teacher/dashboard' : '/dashboard')
    router.refresh()
  }

  const isStudent = role === 'student'
  const gradientFrom = isStudent ? 'from-primary' : 'from-emerald-500'
  const gradientTo = isStudent ? 'to-info' : 'to-teal-500'
  const accentColor = isStudent ? 'text-primary' : 'text-emerald-600'
  const borderColor = isStudent ? 'border-primary' : 'border-emerald-500'
  const bgAccent = isStudent ? 'bg-primary' : 'bg-emerald-500'

  return (
    <div className={`bg-card rounded-[1.5rem] border-2 ${borderColor}/30 shadow-[0_8px_40px_rgba(108,99,255,0.08)] p-6 flex-1`}>
      <div className="flex flex-col items-center mb-5">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg mb-3`}>
          {isStudent ? (
            <GraduationCap className="h-7 w-7 text-white" />
          ) : (
            <BookOpen className="h-7 w-7 text-white" />
          )}
        </div>
        <h2 className={`text-xl font-display font-extrabold ${accentColor}`}>
          {isStudent ? 'Student Login' : 'Teacher Login'}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          {isStudent ? 'Continue your learning adventure' : 'Manage courses & students'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50 pointer-events-none" />
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address"
            error={errors.email?.message}
            className="pl-10 text-sm"
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary/50 pointer-events-none" />
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            error={errors.password?.message}
            className="pl-10 pr-10 text-sm"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-primary transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20 h-3.5 w-3.5" />
            <span className="text-xs text-text-secondary">Remember me</span>
          </label>
          <Link href="/forgot-password" className={`text-xs ${accentColor} font-semibold hover:underline`}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className={`w-full ${bgAccent} hover:opacity-90`} size="lg" disabled={loading}>
          {loading ? (
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Log In
            </>
          )}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-card text-text-secondary">or</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onGoogleLogin} type="button">
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
    </div>
  )
}

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col items-center mb-8">
        <SparkyCharacter mood="happy" size={100} />
        <h1 className="mt-4 text-3xl font-display font-extrabold text-text-primary">
          Welcome Back!
        </h1>
        <p className="mt-1 text-text-secondary">
          Choose your login type to continue
        </p>
      </div>

      <div className="flex gap-6">
        <LoginBox role="student" onGoogleLogin={handleGoogleLogin} />
        <LoginBox role="teacher" onGoogleLogin={handleGoogleLogin} />
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Sign up for free!
        </Link>
      </p>
    </div>
  )
}
