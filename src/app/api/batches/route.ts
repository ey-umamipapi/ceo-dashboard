import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function serverSupabase() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { batch_code, product_type, expiry_date } = await request.json()

    if (!batch_code || !product_type) {
      return NextResponse.json({ error: 'batch_code and product_type are required' }, { status: 400 })
    }

    const sb = serverSupabase()
    const { data, error } = await sb
      .from('inventory_batches')
      .insert({ batch_code, product_type, expiry_date: expiry_date || null })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Batch code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ batch: data })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { batch_code } = await request.json()
    if (!batch_code) {
      return NextResponse.json({ error: 'batch_code required' }, { status: 400 })
    }
    const sb = serverSupabase()
    const { error } = await sb.from('inventory_batches').delete().eq('batch_code', batch_code)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
