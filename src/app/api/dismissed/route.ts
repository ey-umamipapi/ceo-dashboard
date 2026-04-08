import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { todayStamp } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const today = todayStamp()
  const { searchParams } = new URL(req.url)
  const alertType = searchParams.get('type')

  const query = supabase
    .from('dismissed_alerts')
    .select('alert_id, alert_type')
    .eq('dismissed_date', today)

  if (alertType) query.eq('alert_type', alertType)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { alert_id, alert_type } = body
  const today = todayStamp()

  await supabase.from('dismissed_alerts').upsert(
    { alert_id, alert_type, dismissed_date: today },
    { onConflict: 'alert_id,alert_type,dismissed_date' }
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const alertType = searchParams.get('type')
  const today = todayStamp()

  if (alertType) {
    await supabase
      .from('dismissed_alerts')
      .delete()
      .eq('alert_type', alertType)
      .eq('dismissed_date', today)
  } else {
    await supabase.from('dismissed_alerts').delete().eq('dismissed_date', today)
  }

  return NextResponse.json({ ok: true })
}
