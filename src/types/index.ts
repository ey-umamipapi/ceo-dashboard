export interface RevenueMonth {
  id?: number
  fiscal_year: string
  month: string
  total: number
  direct: number
  wsale: number
  distrbn: number
  coles: number
  metcash: number
  fserv: number
  nandos: number
  other: number
  orders: number
  ad: number
  roas: number
  mtd: boolean
  sort_order: number
}

export interface RevenueWeek {
  id?: number
  week_label: string
  total: number
  direct: number
  coles: number
  distrbn: number
  nandos: number
  other: number
  sort_order: number
}

export interface ProductionMonth {
  id?: number
  month: string
  units: number
  hours: number
  staff: number
  uph: number
  days: number
  sort_order: number
}

export interface ProductionWeek {
  id?: number
  week_label: string
  units: number
  hours: number
  uph: number
  staff: number
  sort_order: number
}

export interface ProductionSku {
  id?: number
  sku: string
  units: number
  pct: number
  sort_order: number
}

export interface Issue {
  id?: number
  date: string
  issue: string
  category: string
  ownership: string
  resolved: string
}

export interface CalendarEvent {
  id?: number
  day: string
  month: string
  info: string
  category: string
  color: string
  sort_order: number
}

export interface ApCategory {
  id?: number
  name: string
  amount: number
  sort_order: number
}

export interface MarketingMonth {
  id?: number
  month: string
  rev: number
  orders: number
  meta_spend: number
  google_spend: number
  total_spend: number
  mer: number
  meta_roas: number | null
  google_roas: number | null
  conv_rate: number | null
  aov: number
  cpa: number
  mtd: boolean
  sort_order: number
}

export interface LargeTransaction {
  id?: number
  date: string
  vendor: string
  category: string
  amount: number
  sort_order: number
}

export interface Anomaly {
  id?: number
  category: string
  average: number
  current_val: number
  ratio: number
  flag: string
}

export interface Signal {
  id?: number
  signal_type: string
  date: string
  text: string
  archived: boolean
}

export interface MarketingDaily {
  id?: number
  date: string
  channel: string
  spend: number
  impressions: number
  conversions: number
}

export interface SEOSnapshot {
  id?: number
  date: string
  keyword: string
  ranking: number
  traffic: number
  ctr: number
  impressions: number
}

export interface DismissedAlert {
  id?: number
  alert_id: string
  alert_type: string
  dismissed_date: string
}

export interface SyncMetadata {
  id?: number
  source: string
  last_sync_at: string
}

export interface DashboardData {
  fy26: RevenueMonth[]
  fy25: RevenueMonth[]
  weekly: RevenueWeek[]
  prodMonthly: ProductionMonth[]
  prodWeekly: ProductionWeek[]
  prodSku: ProductionSku[]
  issues: Issue[]
  calendar: CalendarEvent[]
  apCategories: ApCategory[]
  marketing: MarketingMonth[]
  largeTxns: LargeTransaction[]
  anomalies: Anomaly[]
  signals: Signal[]
  marketingDaily: MarketingDaily[]
  seoSnapshots: SEOSnapshot[]
  syncMetadata: SyncMetadata[]
}

export type PageId =
  | 'command'
  | 'growth'
  | 'ops'
  | 'financial'
  | 'spend'
  | 'marketing'
  | 'seo'
  | 'team'
  | 'rev-detail'
  | 'margin-detail'
  | 'ch-detail'
  | 'prod-detail'

export type Theme = 'night' | 'day' | 'dusk'
