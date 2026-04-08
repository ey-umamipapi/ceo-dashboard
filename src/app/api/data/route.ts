import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const [
    { data: fy26 },
    { data: fy25 },
    { data: weekly },
    { data: prodMonthly },
    { data: prodWeekly },
    { data: prodSku },
    { data: issues },
    { data: calendar },
    { data: apCategories },
    { data: marketing },
    { data: largeTxns },
    { data: anomalies },
    { data: signals },
    { data: marketingDaily },
    { data: seoSnapshots },
    { data: syncMetadata },
  ] = await Promise.all([
    supabase.from('revenue_monthly').select('*').eq('fiscal_year', 'fy26').order('sort_order'),
    supabase.from('revenue_monthly').select('*').eq('fiscal_year', 'fy25').order('sort_order'),
    supabase.from('revenue_weekly').select('*').order('sort_order'),
    supabase.from('production_monthly').select('*').order('sort_order'),
    supabase.from('production_weekly').select('*').order('sort_order'),
    supabase.from('production_sku').select('*').order('sort_order'),
    supabase.from('issues').select('*').order('date'),
    supabase.from('calendar_events').select('*').order('sort_order'),
    supabase.from('ap_categories').select('*').order('sort_order'),
    supabase.from('marketing_monthly').select('*').order('sort_order'),
    supabase.from('large_transactions').select('*').order('sort_order'),
    supabase.from('anomalies').select('*'),
    supabase.from('signals').select('*').order('id', { ascending: false }),
    supabase.from('marketing_daily').select('*').order('date', { ascending: false }),
    supabase.from('seo_snapshots').select('*').order('date', { ascending: false }),
    supabase.from('sync_metadata').select('*'),
  ])

  return NextResponse.json({
    fy26: fy26 ?? [],
    fy25: fy25 ?? [],
    weekly: weekly ?? [],
    prodMonthly: prodMonthly ?? [],
    prodWeekly: prodWeekly ?? [],
    prodSku: prodSku ?? [],
    issues: issues ?? [],
    calendar: calendar ?? [],
    apCategories: apCategories ?? [],
    marketing: marketing ?? [],
    largeTxns: largeTxns ?? [],
    anomalies: anomalies ?? [],
    signals: signals ?? [],
    marketingDaily: marketingDaily ?? [],
    seoSnapshots: seoSnapshots ?? [],
    syncMetadata: syncMetadata ?? [],
  })
}
