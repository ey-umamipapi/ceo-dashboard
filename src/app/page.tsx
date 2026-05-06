import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Dashboard from '@/components/Dashboard'
import type { Role } from '@/types'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const userRole: Role = (roleRow?.role as Role) ?? 'viewer'

  return <Dashboard userEmail={user.email ?? ''} userRole={userRole} />
}
