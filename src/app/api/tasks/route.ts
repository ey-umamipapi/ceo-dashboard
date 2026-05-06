import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const department = searchParams.get('department')

  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (department && department !== 'all') {
    query = query.or(`department.eq.${department},department.eq.all`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, priority, department, assignee_email, assignee_name,
          due_date, linked_type, linked_id, linked_label } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const { data, error } = await supabase.from('tasks').insert({
    title: title.trim(),
    description: description?.trim() || null,
    status: 'todo',
    priority: priority ?? 'medium',
    department: department ?? 'all',
    assignee_email: assignee_email ?? null,
    assignee_name: assignee_name ?? null,
    created_by: user.email ?? user.id,
    due_date: due_date ?? null,
    linked_type: linked_type ?? null,
    linked_id: linked_id ?? null,
    linked_label: linked_label ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data }, { status: 201 })
}
