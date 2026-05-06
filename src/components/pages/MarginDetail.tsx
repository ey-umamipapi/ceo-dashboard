'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, BubbleController, LogarithmicScale, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Bubble } from 'react-chartjs-2'
import { DashboardData } from '@/types'

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, LineElement, PointElement, ArcElement, BubbleController, Title, Tooltip, Legend, Filler)

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

// Static rows for non-MarginPapi SKUs (kept as fallback / non-Chilli Oil data)
const STATIC_SKUS = [
  { sku: 'Hot Honey', ch: 'DTC', sell: '$15.50', cogs: '$4.65', gross: 70.0, net: 70.3, vol: 5935, verdict: 'monitor' },
  { sku: 'Mayo', ch: 'DTC', sell: '$14.00', cogs: '$2.91', gross: 79.2, net: 69.4, vol: null, verdict: 'scale' },
  { sku: 'Mayo', ch: 'Coles', sell: '$4.58', cogs: '$2.91', gross: 36.5, net: 29.9, vol: 10764, verdict: 'fix' },
  { sku: 'PERi Crackle', ch: 'Nandos', sell: '$7.30', cogs: '$4.61', gross: 36.8, net: 36.9, vol: 6282, verdict: 'monitor' },
  { sku: 'PERi Seed', ch: 'Nandos', sell: '$7.80', cogs: '$5.66', gross: 27.4, net: 27.4, vol: null, verdict: 'monitor' },
  { sku: 'CEM', ch: 'Unknown', sell: '—', cogs: '—', gross: null, net: null, vol: 17304, verdict: 'unknown' },
]

const MAYO_CHANNELS = [
  { label: 'DTC', margin: 79.2, color: GRN },
  { label: 'Coles', margin: 36.5, color: RED },
]

// COGS drivers
const CO_COGS = [
  { lbl: 'Ingredients (oil, chilli, seasonings)', pct: 38 },
  { lbl: 'Glass jar + lid', pct: 28 },
  { lbl: 'Label + printing', pct: 12 },
  { lbl: 'Filling + labour', pct: 14 },
  { lbl: 'Packaging + carton', pct: 8 },
]
const MAYO_COGS = [
  { lbl: 'Ingredients (eggs, oil, mayo base)', pct: 45 },
  { lbl: 'Jar + lid', pct: 22 },
  { lbl: 'Label', pct: 9 },
  { lbl: 'Filling + labour', pct: 16 },
  { lbl: 'Packaging', pct: 8 },
]
const NANDOS_COGS = [
  { lbl: 'Ingredients', pct: 52 },
  { lbl: 'Packaging (bulk)', pct: 18 },
  { lbl: 'Labour', pct: 20 },
  { lbl: 'Other', pct: 10 },
]

function rankClass(rank: number) {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  if (rank >= 8) return 'rank-lo'
  return ''
}

function margBarColor(m: number | null) {
  if (m == null) return '#444'
  if (m >= 70) return GRN
  if (m >= 50) return BLU
  if (m >= 30) return ORG
  return RED
}

function ChannelBars({ data }: { data: { label: string; margin: number; color: string }[] }) {
  return (
    <div>
      {data.map(ch => (
        <div key={ch.label} className="cat-row">
          <span className="cat-name">{ch.label}</span>
          <div className="cat-bg">
            <div className="cat-fill" style={{ width: `${ch.margin}%`, background: ch.color }} />
          </div>
          <span className="cat-n">{ch.margin.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

function CogsList({ items }: { items: { lbl: string; pct: number }[] }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.lbl} className="driver-row">
          <span className="driver-lbl">{item.lbl}</span>
          <div style={{ flex: 1, background: 'var(--bar-bg)', borderRadius: 3, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${item.pct}%`, height: 5, background: ORG, borderRadius: 3 }} />
          </div>
          <span className="driver-pct">{item.pct}%</span>
        </div>
      ))}
    </div>
  )
}

function verdictFromMargin(pct: number | null): string {
  if (pct == null) return 'unknown'
  if (pct >= 0.70) return 'scale'
  if (pct >= 0.50) return 'monitor'
  return 'fix'
}

function fmtPrice(v: number | null) {
  if (v == null) return '—'
  return `$${v.toFixed(2)}`
}

function fmtPct(v: number | null) {
  if (v == null) return null
  // value is stored as decimal (0.828 = 82.8%)
  return +(v * 100).toFixed(1)
}

// Channel colour map for bubble chart
const CHANNEL_COLORS: Record<string, string> = {
  'DTC':           GRN,
  'Coles':         RED,
  'Wholesale':     BLU,
  'Distribution':  BLU,
  'Nandos':        PRP,
  "Nando's":       PRP,
  'Foodservice':   ORG,
}
function channelColor(ch: string): string {
  for (const [key, col] of Object.entries(CHANNEL_COLORS)) {
    if (ch.toLowerCase().includes(key.toLowerCase())) return col
  }
  return '#888'
}

export default function MarginDetail({ data }: { data: DashboardData }) {
  const marginSkus = data.marginSkus ?? []

  // Build combined SKU rows: live Chilli Oil rows first, then static
  const liveRows = marginSkus.map((s, i) => ({
    sku: s.product,
    ch: s.channel,
    sell: fmtPrice(s.sell_price),
    cogs: fmtPrice(s.cogs),
    gross: fmtPct(s.margin_pct),
    net: null as number | null,
    vol: s.volume,
    verdict: verdictFromMargin(s.margin_pct),
    isLive: true,
  }))

  const staticRows = STATIC_SKUS.map(s => ({ ...s, isLive: false }))

  // Merge: live rows replace any static rows with same sku+channel
  const liveKeys = new Set(liveRows.map(r => `${r.sku}|${r.ch}`))
  const filteredStatic = staticRows.filter(r => !liveKeys.has(`${r.sku}|${r.ch}`))
  const allSkus = [...liveRows, ...filteredStatic]

  // Sort by gross margin desc (nulls last)
  allSkus.sort((a, b) => {
    if (a.gross == null && b.gross == null) return 0
    if (a.gross == null) return 1
    if (b.gross == null) return -1
    return b.gross - a.gross
  })

  // Chilli Oil channel breakdown from live data
  const coChannels = liveRows
    .filter(r => r.gross != null)
    .map(r => ({
      label: `${r.ch}${r.sku.includes('Jumbo') ? ' Jumbo' : r.sku.includes('Large') ? ' Large' : ''}`,
      margin: r.gross as number,
      color: (r.gross as number) >= 70 ? GRN : (r.gross as number) >= 50 ? BLU : ORG,
    }))
    .sort((a, b) => b.margin - a.margin)

  // Fall back to static Chilli Oil channels if no live data
  const CO_CHANNELS = coChannels.length > 0 ? coChannels : [
    { label: 'DTC Jumbo', margin: 92.9, color: GRN },
    { label: 'DTC Large', margin: 83.8, color: GRN },
    { label: 'Wholesale', margin: 70.0, color: BLU },
    { label: 'Coles', margin: 62.7, color: ORG },
  ]

  // Bubble chart — SKU Profitability Matrix
  const bubbleSkus = marginSkus.filter(s => (s.volume ?? 0) > 0 && s.margin_pct != null)
  const bubbleDatasets = bubbleSkus.map(s => {
    const vol = s.volume ?? 0
    const marg_d = s.margin_dollars ?? 0
    const marg_pct = s.margin_pct ?? 0
    const radius = Math.max(5, Math.min(30, Math.sqrt(Math.abs(marg_d) * vol) / 8))
    const color = channelColor(s.channel)
    return {
      label: `${s.product} — ${s.channel}`,
      data: [{ x: vol, y: +(marg_pct * 100).toFixed(1), r: radius }],
      backgroundColor: color + 'aa',
      borderColor: color,
      borderWidth: 1,
    }
  })

  const bubbleOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const s = bubbleSkus[ctx.datasetIndex]
            const vol = s.volume ?? 0
            const marg_d = s.margin_dollars ?? 0
            const contribution = Math.round(marg_d * vol)
            return [
              ` ${s.product} — ${s.channel}`,
              ` Margin: ${((s.margin_pct ?? 0) * 100).toFixed(1)}%`,
              ` Volume: ${vol.toLocaleString()} units`,
              ` Contribution: $${contribution.toLocaleString()}`,
            ]
          },
          title: () => '',
        },
      },
    },
    scales: {
      x: {
        type: 'logarithmic' as const,
        grid: { color: DL },
        ticks: { color: '#666', font: { size: 10 }, callback: (v: any) => v.toLocaleString() },
        title: { display: true, text: 'Volume (units, log scale)', color: '#666', font: { size: 10 } },
      },
      y: {
        grid: { color: DL },
        ticks: { color: '#666', font: { size: 10 }, callback: (v: any) => `${v}%` },
        title: { display: true, text: 'Gross Margin %', color: '#666', font: { size: 10 } },
        min: 0,
        suggestedMax: 100,
      },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Margin Data</span><span>{formatSyncTime(data.syncMetadata, 'financial')}</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{formatSyncTime(data.syncMetadata, 'financial')}</span></div>
      </div>

      {/* DD Note */}
      <div className="dd-note">
        Margin data as at 25 Mar 2026. COGS based on FY26 production actuals. Net margin estimates include allocated overhead. Nando's volumes are contractual minimums. Actual blended margins will shift with channel mix.
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Margin Intelligence — Key Takeaways</div>
        <div className="flag-row">
          <div className="flag-item green"><span className="flag-icon">↑</span><span>DTC Chilli Oil is the margin engine: 83–93% gross. Every dollar shifted from Coles to DTC is worth ~20pp margin.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Mayo at Coles ($4.58 sell-in) is a structural problem: 36.5% gross vs 79.2% DTC. Validate pricing with Retcon + Joe before Coles next review.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>CEM: 17,304 units with unknown sell-in and unvalidated COGS. No margin model exists. This is a blind spot.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>CEO Decision required: Is Mayo at Coles strategic (distribution/brand) or financial (profit contributor)? Decide before next range review.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Build CEM margin model. Establish sell-in price, COGS actuals, and channel strategy.</span></div>
        </div>
      </div>

      {/* SKU Margin Ranking Table */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">SKU Margin Ranking</span><span className="pg">Gross → Net</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th className="c">#</th>
                <th>SKU</th>
                <th>Channel</th>
                <th className="r">Sell-In</th>
                <th className="r">COGS</th>
                <th className="r">Gross %</th>
                <th className="r">Net %</th>
                <th className="r">Volume</th>
                <th className="c">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {allSkus.map((s, i) => (
                <tr key={`${s.sku}-${s.ch}`}>
                  <td className="c">
                    <span className={`rank-badge ${rankClass(i + 1)}`}>{i + 1}</span>
                  </td>
                  <td>
                    {s.sku}
                    {(s as any).isLive && <span style={{ fontSize: 9, color: GRN, marginLeft: 4 }}>live</span>}
                  </td>
                  <td>{s.ch}</td>
                  <td className="r">{s.sell}</td>
                  <td className="r">{s.cogs}</td>
                  <td className="r">
                    {s.gross != null ? (
                      <span style={{ color: margBarColor(s.gross) }}>{s.gross.toFixed(1)}%</span>
                    ) : '—'}
                  </td>
                  <td className="r">
                    {s.net != null ? (
                      <span style={{ color: margBarColor(s.net) }}>{s.net.toFixed(1)}%</span>
                    ) : '—'}
                  </td>
                  <td className="r">{s.vol != null ? s.vol.toLocaleString() : '—'}</td>
                  <td className="c">
                    <span className={`verdict-${s.verdict}`}>{s.verdict}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SKU Profitability Bubble Chart */}
      {bubbleSkus.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph">
            <span className="pt">SKU Profitability Matrix</span>
            <span className="pg">X = volume · Y = margin% · bubble size = total contribution</span>
          </div>
          <div className="pb">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {Object.entries(CHANNEL_COLORS).map(([ch, col]) => (
                bubbleSkus.some(s => s.channel.toLowerCase().includes(ch.toLowerCase())) && (
                  <span key={ch} style={{ fontSize: 10, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: col }} />
                    {ch}
                  </span>
                )
              ))}
            </div>
            <div className="chart-h260">
              <Bubble data={{ datasets: bubbleDatasets }} options={bubbleOpts} />
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--mid)' }}>
              Bubble radius proportional to √(margin$ × volume). Hover for detail. Only SKUs with volume &gt; 0 shown.
            </div>
          </div>
        </div>
      )}

      {/* Channel margin breakdown */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph">
            <span className="pt">Chilli Oil — Channel Gross Margins</span>
            {coChannels.length > 0 && <span className="pg" style={{ color: GRN }}>live</span>}
          </div>
          <div className="pb"><ChannelBars data={CO_CHANNELS} /></div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Mayo — Channel Gross Margins</span></div>
          <div className="pb"><ChannelBars data={MAYO_CHANNELS} /></div>
        </div>
      </div>

      {/* COGS composition */}
      <div className="g3" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Chilli Oil COGS</span></div>
          <div className="pb"><CogsList items={CO_COGS} /></div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Mayo COGS</span></div>
          <div className="pb"><CogsList items={MAYO_COGS} /></div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Nando's COGS</span></div>
          <div className="pb"><CogsList items={NANDOS_COGS} /></div>
        </div>
      </div>

      {/* Margin Risk Flags */}
      <div className="panel">
        <div className="ph"><span className="pt">Margin Risk Flags</span></div>
        <div className="pb">
          <div className="flag-row">
            <div className="flag-item red"><span className="flag-icon">⚠</span><span>Mayo Coles: $4.58 sell-in. If COGS increases (eggs, packaging), this goes below 30% gross — unviable territory.</span></div>
            <div className="flag-item red"><span className="flag-icon">⚠</span><span>CEM: No validated sell-in price or margin model. 17,304 units sold with unknown profitability.</span></div>
            <div className="flag-item"><span className="flag-icon" style={{ color: 'var(--mid)' }}>·</span><span>PERi Crackle at 36.8% gross: low margin but contractual. Monitor cost creep — any COGS increase makes this loss-making.</span></div>
            <div className="flag-item"><span className="flag-icon" style={{ color: 'var(--mid)' }}>·</span><span>Nandos PERi Seed at 27.4% gross — lowest in the portfolio. Volume is contractual minimum. Not a scalable margin play.</span></div>
            <div className="flag-item green"><span className="flag-icon">↑</span><span>DTC Jumbo ($45, 92.9% gross) — underscaled. 908 units only. Marketing push here has highest margin leverage.</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
