import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/db/users'
import ProfileForm from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const user = await getUserById(session.user.id)
  if (!user) redirect('/login')

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Profile settings</h1>
      <p className="text-muted-foreground mb-6">Update your profile details and role.</p>
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl || '',
          bio: user.bio || '',
          role: user.role,
        }}
      />
    </div>
  )
}

