'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'teacher']),
    dateOfBirth: z.string().optional(),
    parentEmail: z.string().email('Please enter a valid parent email').optional().or(z.literal('')),
    agreeTerms: z.literal(true, {
      error: 'You must accept the terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

function calculateAgeGroup(dob: string): string | null {
  const birth = new Date(dob)
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  if (age >= 5 && age <= 7) return '5-7'
  if (age >= 8 && age <= 10) return '8-10'
  if (age >= 11 && age <= 13) return '11-13'
  if (age >= 14 && age <= 15) return '14-15'
  return null
}

function isUnder13(dob: string): boolean {
  const birth = new Date(dob)
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return age < 13
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')
  const dateOfBirth = watch('dateOfBirth')
  const needsParentEmail = selectedRole === 'student' && dateOfBirth && isUnder13(dateOfBirth)

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      toast.error('Registration failed', { description: error.message })
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const ageGroup = data.dateOfBirth ? calculateAgeGroup(data.dateOfBirth) : null
      await supabase.from('profiles').upsert({
        id: user.id,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        date_of_birth: data.dateOfBirth || null,
        age_group: ageGroup,
        parent_email: data.parentEmail || null,
      })

      if (data.role === 'student') {
        await supabase.from('student_stats').upsert({ student_id: user.id })
      }
    }

    toast.success('Account created! Let\'s get started!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <SparkyCharacter mood="excited" size={90} />
        <h1 className="mt-3 text-3xl font-display font-extrabold text-text-primary">
          Join EnglishForge!
        </h1>
        <p className="mt-1 text-text-secondary text-center">
          Start your English learning adventure today
        </p>
      </div>

      <div className="bg-card rounded-[1.5rem] border border-border shadow-[0_8px_40px_rgba(108,99,255,0.12)] p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'student'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <input type="radio" value="student" {...register('role')} className="sr-only" />
              <GraduationCap className={`h-8 w-8 ${selectedRole === 'student' ? 'text-primary' : 'text-text-secondary'}`} />
              <span className={`text-sm font-display font-bold ${selectedRole === 'student' ? 'text-primary' : 'text-text-secondary'}`}>
                Student
              </span>
            </label>
            <label
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'teacher'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <input type="radio" value="teacher" {...register('role')} className="sr-only" />
              <BookOpen className={`h-8 w-8 ${selectedRole === 'teacher' ? 'text-primary' : 'text-text-secondary'}`} />
              <span className={`text-sm font-display font-bold ${selectedRole === 'teacher' ? 'text-primary' : 'text-text-secondary'}`}>
                Teacher
              </span>
            </label>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/50 pointer-events-none" />
            <Input
              {...register('fullName')}
              placeholder="Your full name"
              error={errors.fullName?.message}
              className="pl-11"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/50 pointer-events-none" />
            <Input
              {...register('email')}
              type="email"
              placeholder="Your email address"
              error={errors.email?.message}
              className="pl-11"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/50 pointer-events-none" />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              error={errors.password?.message}
              className="pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
          />

          {selectedRole === 'student' && (
            <Input
              {...register('dateOfBirth')}
              type="date"
              label="Date of Birth"
              error={errors.dateOfBirth?.message}
            />
          )}

          {needsParentEmail && (
            <Input
              {...register('parentEmail')}
              type="email"
              placeholder="Parent or guardian's email"
              label="Parent Email (required for children under 13)"
              error={errors.parentEmail?.message}
            />
          )}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4 mt-0.5"
            />
            <span className="text-sm text-text-secondary">
              I agree to the{' '}
              <span className="text-primary font-semibold">Terms of Service</span> and{' '}
              <span className="text-primary font-semibold">Privacy Policy</span>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-sm text-secondary font-medium">{errors.agreeTerms.message}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
