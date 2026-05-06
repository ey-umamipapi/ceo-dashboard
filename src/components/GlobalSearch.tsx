'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { PageId, DashboardData } from '@/types'

interface SearchResult {
  key: string
  label: string
  sub: string
  icon: string
  section: string
  page: PageId
}

// Static page index
const PAGE_RESULTS: SearchResult[] = [
  { key:'command',       label:'Command Centre',      sub:'CEO dashboard',                  icon:'★', section:'Pages', page:'command' },
  { key:'weekly-pulse',  label:'Weekly Pulse',         sub:'CEO — Notion',                   icon:'◉', section:'Pages', page:'weekly-pulse' },
  { key:'automations',   label:'Automations',          sub:'CEO — scripts & triggers',       icon:'⚡', section:'Pages', page:'automations' },
  { key:'growth',        label:'Sales Overview',       sub:'Commercial',                     icon:'↗', section:'Pages', page:'growth' },
  { key:'rev-detail',    label:'Revenue Detail',       sub:'Commercial — monthly breakdown', icon:'↑', section:'Pages', page:'rev-detail' },
  { key:'ch-detail',     label:'Channel Detail',       sub:'Commercial — by channel',        icon:'⇄', section:'Pages', page:'ch-detail' },
  { key:'brand-comms',   label:'Brand & Comms',        sub:'Marketing — OP Digital board',   icon:'◎', section:'Pages', page:'brand-comms' },
  { key:'marketing',     label:'Paid Media',           sub:'Marketing — Meta, Google, eComm',icon:'$', section:'Pages', page:'marketing' },
  { key:'socials',       label:'Social Media',         sub:'Marketing — Instagram, TikTok',  icon:'◈', section:'Pages', page:'socials' },
  { key:'seo',           label:'SEO',                  sub:'Marketing — search performance', icon:'⟳', section:'Pages', page:'seo' },
  { key:'financial',     label:'Financial Control',    sub:'Finance — P&L, Xero',            icon:'$', section:'Pages', page:'financial' },
  { key:'spend',         label:'Spend Control',        sub:'Finance — opex, payables',       icon:'⊟', section:'Pages', page:'spend' },
  { key:'margin-detail', label:'Margin Detail',        sub:'Finance — margin by SKU',        icon:'▲', section:'Pages', page:'margin-detail' },
  { key:'team',          label:'People & Team',        sub:'HR, performance, payroll',       icon:'◈', section:'Pages', page:'team' },
  { key:'prod-overview', label:'Production Overview',  sub:'Ops — output & scheduling',      icon:'⊙', section:'Pages', page:'prod-overview' },
  { key:'efficiency',    label:'Efficiency',           sub:'Ops — UPH, throughput',          icon:'≋', section:'Pages', page:'efficiency' },
  { key:'run-log',       label:'Run Log',              sub:'Ops — daily production runs',    icon:'≡', section:'Pages', page:'run-log' },
  { key:'inventory',     label:'Inventory & Batches',  sub:'Ops — stock levels',             icon:'▣', section:'Pages', page:'inventory' },
  { key:'costing',       label:'Costing Engine',       sub:'Ops — COGS, ingredients',        icon:'◆', section:'Pages', page:'costing' },
  { key:'board',         label:'Task Board',           sub:'Workspace — kanban tasks',       icon:'◫', section:'Pages', page:'board' },
  { key:'settings',      label:'Settings',             sub:'Account & profile',              icon:'⚙', section:'Pages', page:'settings' },
]

// Static data index — channels, metrics, people, known entities
const STATIC_RESULTS: SearchResult[] = [
  // Channels
  { key:'ch-coles',      label:"Coles",                sub:'Channel — supermarket retail',   icon:'⇄', section:'Channels', page:'ch-detail' },
  { key:'ch-nandos',     label:"Nando's",              sub:'Channel — food service',         icon:'⇄', section:'Channels', page:'ch-detail' },
  { key:'ch-metcash',    label:'Metcash / IGA',        sub:'Channel — wholesale',            icon:'⇄', section:'Channels', page:'ch-detail' },
  { key:'ch-distrbn',    label:'Distribution',         sub:'Channel — Paramount / distrib.', icon:'⇄', section:'Channels', page:'ch-detail' },
  { key:'ch-direct',     label:'Direct / eCommerce',   sub:'Channel — Shopify store',        icon:'↗', section:'Channels', page:'rev-detail' },
  { key:'ch-fserv',      label:'Food Service',         sub:'Channel — food service accounts',icon:'⇄', section:'Channels', page:'ch-detail' },
  // SKUs
  { key:'sku-og',        label:'OG Large',             sub:'SKU — Original Chilli Oil',      icon:'◆', section:'Products', page:'costing' },
  { key:'sku-es',        label:'ES Large',             sub:'SKU — Extra Spicy',              icon:'◆', section:'Products', page:'costing' },
  { key:'sku-cem',       label:'Chilli Egg Mayo',      sub:'SKU — CEM',                      icon:'◆', section:'Products', page:'costing' },
  { key:'sku-hh',        label:'Hot Honey',            sub:'SKU — Hot Honey',                icon:'◆', section:'Products', page:'costing' },
  { key:'sku-peri',      label:'PERi Crackle 1KG',     sub:'SKU — PERi Crackle',             icon:'◆', section:'Products', page:'costing' },
  { key:'sku-margin-og', label:'OG Large margin',      sub:'Margin — by channel',            icon:'▲', section:'Products', page:'margin-detail' },
  { key:'sku-margin-es', label:'ES Large margin',      sub:'Margin — by channel',            icon:'▲', section:'Products', page:'margin-detail' },
  { key:'sku-margin-cem',label:'Chilli Egg Mayo margin',sub:'Margin — by channel',           icon:'▲', section:'Products', page:'margin-detail' },
  { key:'sku-inv-og',    label:'OG Large stock',       sub:'Inventory — current levels',     icon:'▣', section:'Products', page:'inventory' },
  { key:'sku-inv-es',    label:'ES Large stock',       sub:'Inventory — current levels',     icon:'▣', section:'Products', page:'inventory' },
  { key:'sku-inv-cem',   label:'Chilli Egg Mayo stock',sub:'Inventory — current levels',     icon:'▣', section:'Products', page:'inventory' },
  // Metrics
  { key:'met-mer',       label:'MER',                  sub:'Marketing efficiency ratio',      icon:'$', section:'Metrics', page:'marketing' },
  { key:'met-roas',      label:'ROAS',                 sub:'Return on ad spend',              icon:'$', section:'Metrics', page:'marketing' },
  { key:'met-cpa',       label:'CPA',                  sub:'Cost per acquisition',            icon:'$', section:'Metrics', page:'marketing' },
  { key:'met-aov',       label:'AOV',                  sub:'Average order value',             icon:'$', section:'Metrics', page:'marketing' },
  { key:'met-uph',       label:'UPH',                  sub:'Units per hour — production',     icon:'≋', section:'Metrics', page:'efficiency' },
  { key:'met-gpm',       label:'Gross Profit Margin',  sub:'Finance — P&L',                  icon:'▲', section:'Metrics', page:'financial' },
  { key:'met-cogs',      label:'COGS',                 sub:'Cost of goods sold',              icon:'◆', section:'Metrics', page:'costing' },
  { key:'met-nopm',      label:'Net Operating Margin', sub:'Finance — P&L',                  icon:'▲', section:'Metrics', page:'financial' },
  { key:'met-cash',      label:'Cash position',        sub:'Finance — Xero',                 icon:'$', section:'Metrics', page:'financial' },
  { key:'met-recv',      label:'Receivables',          sub:'Finance — accounts receivable',   icon:'$', section:'Metrics', page:'financial' },
  { key:'met-payb',      label:'Payables',             sub:'Finance — accounts payable',      icon:'⊟', section:'Metrics', page:'spend' },
  { key:'met-ltv',       label:'LTV',                  sub:'Customer lifetime value',         icon:'↗', section:'Metrics', page:'marketing' },
  // People
  { key:'ppl-ethan',     label:'Ethan',                sub:'CEO — UmamiPapi',                icon:'◈', section:'People', page:'team' },
  { key:'ppl-mark',      label:'Mark',                 sub:'Operations manager',              icon:'◈', section:'People', page:'team' },
  { key:'ppl-aaron',     label:'Aaron',                sub:'Content / social media',          icon:'◈', section:'People', page:'socials' },
  { key:'ppl-chris',     label:'Chris',                sub:'Team member',                     icon:'◈', section:'People', page:'team' },
  { key:'ppl-opdigital', label:'OP Digital',           sub:'Agency — PR, website, EDM',      icon:'◎', section:'People', page:'brand-comms' },
  // Finance
  { key:'fin-pl',        label:'P&L',                  sub:'Profit & loss — monthly',        icon:'$', section:'Finance', page:'financial' },
  { key:'fin-xero',      label:'Xero',                 sub:'Accounting — financial data',    icon:'$', section:'Finance', page:'financial' },
  { key:'fin-opex',      label:'OPEX',                 sub:'Operating expenses',              icon:'⊟', section:'Finance', page:'spend' },
  { key:'fin-invoice',   label:'Invoices',             sub:'Finance — accounts receivable',  icon:'$', section:'Finance', page:'financial' },
  // Ops
  { key:'ops-batch',     label:'Batches',              sub:'Production — batch codes/expiry', icon:'▣', section:'Operations', page:'inventory' },
  { key:'ops-sched',     label:'Production schedule',  sub:'Ops — upcoming runs',            icon:'⊙', section:'Operations', page:'prod-overview' },
  { key:'ops-tins',      label:'Tins produced',        sub:'Ops — production output',        icon:'⊙', section:'Operations', page:'prod-overview' },
  { key:'ops-jars',      label:'Jars filled',          sub:'Ops — daily metrics',            icon:'⊙', section:'Operations', page:'run-log' },
  // Marketing
  { key:'mkt-meta',      label:'Meta Ads',             sub:'Paid media — Facebook/Instagram', icon:'$', section:'Marketing', page:'marketing' },
  { key:'mkt-google',    label:'Google Ads',           sub:'Paid media — search/display',    icon:'$', section:'Marketing', page:'marketing' },
  { key:'mkt-insta',     label:'Instagram',            sub:'Socials — @umamipapi',           icon:'◈', section:'Marketing', page:'socials' },
  { key:'mkt-tiktok',    label:'TikTok',               sub:'Socials — @umamipapi',           icon:'◈', section:'Marketing', page:'socials' },
  { key:'mkt-edm',       label:'EDM',                  sub:'Email marketing — OP Digital',   icon:'◎', section:'Marketing', page:'brand-comms' },
  { key:'mkt-pr',        label:'PR',                   sub:'Press & comms — OP Digital',     icon:'◎', section:'Marketing', page:'brand-comms' },
  { key:'mkt-cohort',    label:'Customer cohorts',     sub:'Retention — Shopify',            icon:'↗', section:'Marketing', page:'marketing' },
  { key:'mkt-seo',       label:'Google Search Console',sub:'SEO — organic traffic',          icon:'⟳', section:'Marketing', page:'seo' },
]

function buildDynamicResults(data?: DashboardData): SearchResult[] {
  if (!data) return []
  const results: SearchResult[] = []
  const seen = new Set<string>()

  // Dynamic SKUs from costing/margin data
  const skuNames = [
    ...(data.costingCogs ?? []).map(c => c.sku_name),
    ...(data.marginSkus ?? []).map(m => m.product),
    ...(data.inventorySnapshot ?? []).map(i => i.sku),
  ]
  for (const name of skuNames) {
    if (!name || seen.has(`dyn-sku-${name}`)) continue
    seen.add(`dyn-sku-${name}`)
    results.push({ key: `dyn-sku-${name}`, label: name, sub: 'Product — SKU', icon: '◆', section: 'Products', page: 'costing' })
  }

  // Recent production runs
  const recentRuns = (data.prodRuns ?? []).slice(-5)
  for (const run of recentRuns) {
    const k = `dyn-run-${run.run_date}`
    if (seen.has(k)) continue
    seen.add(k)
    results.push({ key: k, label: `Run ${run.run_date}`, sub: `${run.total_tins} tins · ${run.staff} staff`, icon: '≡', section: 'Production Runs', page: 'run-log' })
  }

  return results
}

function score(item: SearchResult, q: string): number {
  const lq = q.toLowerCase()
  const ll = item.label.toLowerCase()
  const ls = item.sub.toLowerCase()
  if (ll === lq) return 100
  if (ll.startsWith(lq)) return 80
  if (ll.includes(lq)) return 60
  if (ls.includes(lq)) return 40
  return 0
}

const CEO_PAGES = new Set(['command', 'weekly-pulse', 'automations'])
const FINANCE_PAGES = new Set(['financial', 'spend', 'margin-detail', 'rev-detail', 'ch-detail'])

interface Props {
  open: boolean
  onClose: () => void
  setActivePage: (p: PageId) => void
  userRole: string
  data?: DashboardData
}

export default function GlobalSearch({ open, onClose, setActivePage, userRole, data }: Props) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isCeo   = userRole === 'ceo'
  const isGuest = userRole === 'guest' || userRole === 'viewer'

  const allResults = useMemo(() => {
    const dynamic = buildDynamicResults(data)
    return [...PAGE_RESULTS, ...STATIC_RESULTS, ...dynamic].filter(item => {
      if (CEO_PAGES.has(item.page) && !isCeo) return false
      if (FINANCE_PAGES.has(item.page) && isGuest) return false
      return true
    })
  }, [data, isCeo, isGuest])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    return allResults
      .map(item => ({ item, s: score(item, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map(x => x.item)
  }, [allResults, query])

  useEffect(() => {
    if (open) { setQuery(''); setActiveIdx(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  const go = useCallback((page: PageId) => {
    setActivePage(page)
    onClose()
  }, [setActivePage, onClose])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[activeIdx]) { go(filtered[activeIdx].page) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, activeIdx, go, onClose])

  if (!open) return null

  const showEmpty = query.trim().length > 0 && filtered.length === 0
  const showPrompt = query.trim().length === 0

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrap">
          <span style={{ fontSize: 16, color: 'var(--mid)', flexShrink: 0 }}>⌕</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search pages, SKUs, channels, metrics, people…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <span style={{ fontSize: 10, color: 'var(--mid)', background: 'var(--grey3)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>ESC</span>
        </div>

        <div className="search-results">
          {showPrompt && (
            <div className="search-empty" style={{ padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ marginBottom: 10, color: 'var(--mid)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px' }}>Try searching for</div>
              {['Nando\'s', 'PERi Crackle', 'ROAS', 'Coles margin', 'Mark', 'inventory', 'Meta Ads'].map(s => (
                <button key={s} onClick={() => setQuery(s)} style={{ display: 'inline-block', margin: '3px 4px 3px 0', background: 'var(--grey3)', border: 'none', borderRadius: 6, padding: '4px 10px', color: 'var(--light)', fontSize: 11, cursor: 'pointer', fontFamily: "'AlbertSans', sans-serif" }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {showEmpty && (
            <div className="search-empty">No results for "{query}"</div>
          )}

          {filtered.map((item, i) => (
            <div
              key={item.key}
              className={`search-result${i === activeIdx ? ' active' : ''}`}
              onClick={() => go(item.page)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="search-result-icon">{item.icon}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block' }}>{item.label}</span>
                <span style={{ fontSize: 11, color: 'var(--mid)' }}>{item.sub}</span>
              </span>
              <span style={{ fontSize: 10, color: 'var(--mid)', background: 'var(--grey3)', padding: '2px 7px', borderRadius: 4, flexShrink: 0 }}>{item.section}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 18px', borderTop: '1px solid var(--grey3)', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>↑↓ navigate</span>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>↵ go</span>
          <span style={{ fontSize: 10, color: 'var(--mid)' }}>esc close</span>
        </div>
      </div>
    </div>
  )
}
