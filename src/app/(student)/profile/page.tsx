'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'

const profileSchema = z.object({
  full_name: z.string().min(2),
  display_name: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      full_name: profile.full_name,
      display_name: profile.display_name || '',
      city: profile.city || '',
      phone: profile.phone || '',
    } : undefined,
  })

  if (loading) return <FullPageLoader />

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated!')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-display font-extrabold text-text-primary">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.full_name || 'User'}
              fallback={profile?.full_name?.[0]?.toUpperCase() || 'U'}
              size="xl"
            />
            <div>
              <h2 className="text-xl font-display font-bold">{profile?.full_name}</h2>
              <p className="text-sm text-text-secondary">{profile?.email}</p>
              <p className="text-xs text-primary font-semibold capitalize mt-1">{profile?.role}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input {...register('full_name')} label="Full Name" error={errors.full_name?.message} />
            <Input {...register('display_name')} label="Display Name" placeholder="How should we call you?" />
            <Input {...register('city')} label="City" />
            <Input {...register('phone')} label="Phone" />
            <Button type="submit" disabled={saving}>
              {saving ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
