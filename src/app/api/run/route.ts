import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ALLOWED_JOB_TYPES = [
  'invoices',
  'retcon-sales',
  'sync-dashboard',
  '3pl-report',
  'gj-processor',
] as const
type JobType = typeof ALLOWED_JOB_TYPES[number]

async function getUserRole(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single()
  return data?.role ?? 'viewer'
}

// POST /api/run — queue a new automation job
export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(supabase, user.id)
  if (!['admin', 'ceo'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { jobType } = await req.json()
  if (!ALLOWED_JOB_TYPES.includes(jobType as JobType)) {
    return NextResponse.json({ error: 'Unknown job type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('automation_jobs')
    .insert({ job_type: jobType, status: 'pending', requested_by: user.email })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job: data })
}

// GET /api/run — recent jobs + Koji status
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getUserRole(supabase, user.id)
  if (!['admin', 'ceo'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [jobsRes, statusRes] = await Promise.all([
    supabase
      .from('automation_jobs')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(50),
    supabase
      .from('koji_status')
      .select('*')
      .eq('id', 1)
      .single(),
  ])

  return NextResponse.json({
    jobs: jobsRes.data ?? [],
    kojiStatus: statusRes.data ?? null,
  })
}
