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

export interface ProdRun {
  id?: number
  run_date: string
  staff: number
  hours_worked: number
  comments: string | null
  sku1: string | null
  sku2: string | null
  sku3: string | null
  sku4: string | null
  sku1_tins: number | null
  sku2_tins: number | null
  sku3_tins: number | null
  sku4_tins: number | null
  total_tins: number
  tins_per_hour: number
  jarring_efficiency: number | null
}

export interface ProdEfficiency {
  id?: number
  month: string
  sort_order: number
  total_tins: number | null
  coles_tins: number | null
  distrbn_tins: number | null
  nandos_tins: number | null
  fserv_tins: number | null
  wsale_tins: number | null
  direct_tins: number | null
}

export interface MarginSku {
  id?: number
  product: string
  channel: string
  sell_price: number | null
  cogs: number | null
  margin_dollars: number | null
  margin_pct: number | null
  volume: number | null
  sort_order?: number | null
  source_file?: string | null
  file_modified_at?: string | null
  last_reviewed_at?: string | null
  data_issue?: boolean | null
  data_issue_note?: string | null
  synced_at?: string | null
}

export interface InventorySnapshot {
  id: number
  sku: string
  available: number
  status: string
  snapshot_date: string
}

export interface PlMonth {
  id: number
  month: string
  fiscal_year: string
  revenue: number
  cogs: number
  gross_profit: number
  gpm: number
  opex: number
  net_op_profit: number
  nopm: number
  sort_order: number
}

export interface ProdSchedule {
  run_date: string
  day_name: string
  sku1: string | null
  sku2: string | null
  sku3: string | null
  sku4: string | null
  staff: number | null
  hours: number | null
  notes: string | null
}

export interface XeroExecSummary {
  id: number
  month: string
  fiscal_year: string
  cash: number | null
  receivables: number | null
  payables: number | null
  working_capital: number | null
  sort_order: number
}

export interface ShopifyCohort {
  id: number
  cohort_month: string
  first_purchase_count: number
  repeat_customers_30d: number
  repeat_customers_90d: number
  repeat_rate_30d: number
  repeat_rate_90d: number
  avg_ltv: number
  avg_orders: number
  total_revenue: number
}

export interface XeroArInvoice {
  invoice_id: string
  invoice_number: string
  contact_name: string
  amount_due: number
  currency_code: string
  days_overdue: number
  due_date: string
  snapshot_date: string
}

export interface CostingCogs {
  id?: number
  sku_name: string
  source_file: string
  product_variant: string
  ingredients_cogs: number | null
  packaging_cogs: number | null
  overheads_cogs: number | null
  total_cogs: number | null
  batches_per_month: number | null
  units_per_batch: number | null
  total_units: number | null
  synced_at?: string
}

export interface CostingIngredient {
  id?: number
  sku_name: string
  source_file: string
  component: string
  qty_per_unit: number | null
  qty_per_batch: number | null
  unit_cost: number | null
  batch_cost: number | null
  synced_at?: string
}

export interface CostingPackaging {
  id?: number
  sku_name: string
  source_file: string
  packaging_type: string
  product_variant: string
  unit_cost: number | null
  synced_at?: string
}

export interface CostingOverhead {
  id?: number
  sku_name: string
  source_file: string
  hourly_rate: number | null
  super_pct: number | null
  annual_rent: number | null
  synced_at?: string
}

export interface DailyMetric {
  id?: number
  metric_date: string
  week_label: string | null
  commentary: string | null
  tins_produced: number | null
  tins_filled_overnight: number | null
  tins_filled_day: number | null
  jars_filled_overnight: number | null
  jars_filled_day: number | null
  synced_at?: string
}

export interface InventoryBatch {
  id?: number
  batch_code: string
  product_type: string
  expiry_date: string | null
  synced_at?: string
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
  prodRuns: ProdRun[]
  prodEfficiency: ProdEfficiency[]
  marginSkus: MarginSku[]
  inventorySnapshot: InventorySnapshot[]
  plMonthly: PlMonth[]
  shopifyCohorts: ShopifyCohort[]
  xeroExecSummary: XeroExecSummary[]
  prodSchedule: ProdSchedule[]
  xeroArInvoices: XeroArInvoice[]
  costingCogs: CostingCogs[]
  costingIngredients: CostingIngredient[]
  costingPackaging: CostingPackaging[]
  costingOverheads: CostingOverhead[]
  dailyMetrics: DailyMetric[]
  inventoryBatches: InventoryBatch[]
}

export type PageId =
  | 'command'
  | 'growth'
  | 'financial'
  | 'spend'
  | 'marketing'
  | 'seo'
  | 'team'
  | 'rev-detail'
  | 'margin-detail'
  | 'ch-detail'
  | 'prod-overview'
  | 'efficiency'
  | 'run-log'
  | 'costing'
  | 'inventory'
  | 'settings'
  | 'weekly-pulse'
  | 'automations'
  | 'board'
  | 'socials'
  | 'brand-comms'

export type Theme = 'night' | 'day' | 'dusk'

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskDepartment = 'ceo' | 'commercial' | 'marketing' | 'finance' | 'people' | 'ops' | 'all'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  department: TaskDepartment | null
  assignee_email: string | null
  assignee_name: string | null
  created_by: string
  due_date: string | null
  linked_type: string | null
  linked_id: string | null
  linked_label: string | null
  created_at: string
  updated_at: string
}

export type Role = 'ceo' | 'admin' | 'finance' | 'ops' | 'commercial' | 'production' | 'guest' | 'viewer'

export interface WeeklyPulseEntry {
  id: string
  title: string
  created_time: string
  last_edited_time: string
}

export interface WeeklyPulseContent {
  bigRock: string
  bigRockStatus: string
  progress: string
  leverage: string
  drag: string
  alignment: string
  adjustment: string
  depthMode?: {
    avoidance: string
    people: string
    constraint: string
  }
}
