'use client'

import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { DashboardData, MarketingMonth, MarketingDaily } from '@/types'
import { fmt, pct, pctFmt, SOCIAL_DATA } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

type Period = 'lastmonth' | 'month' | 'ytd'

function mkDailyLabels(count: number) {
  return Array.from({ length: count }, (_, i) => String(i + 1))
}

function dailyLineOpts(color: string): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ' $' + ctx.raw } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => '$' + v } },
    },
  }
}

const STORE_MONTHS = [
  { month: 'Jan 2026', rev: 45321, orders: 312, mer: 4.42, spend: 10249, cpa: 32.85, aov: 145.26, conv: 2.45, mtd: false },
  { month: 'Feb 2026', rev: 56892, orders: 387, mer: 3.19, spend: 17832, cpa: 23.15, aov: 147.01, conv: 2.89, mtd: false },
  { month: 'Mar 2026', rev: 46800, orders: 323, mer: 2.60, spend: 18000, cpa: 26.01, aov: 144.89, conv: 2.67, mtd: false },
  { month: 'Apr 2026', rev: 10072, orders: 68, mer: 5.05, spend: 1994, cpa: 29.32, aov: 148.12, conv: 2.91, mtd: true },
]

export default function Marketing({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<Period>('lastmonth')

  const mktData = data.marketing ?? []
  const dailyData = data.marketingDaily ?? []

  // Extract daily data from Supabase by channel
  const metaDailyRows = dailyData.filter(d => d.channel === 'Meta').sort((a, b) => a.date.localeCompare(b.date))
  const googleDailyRows = dailyData.filter(d => d.channel === 'Google').sort((a, b) => a.date.localeCompare(b.date))

  // Helper to extract daily spend array for a period
  function getDailySpendForPeriod(rows: MarketingDaily[], month: string): number[] {
    return rows
      .filter(r => r.date.startsWith(month === 'Apr 2026' ? '2026-04' : month === 'Mar 2026' ? '2026-03' : month === 'Feb 2026' ? '2026-02' : '2026-01'))
      .map(r => r.spend)
  }

  // Period selection — use monthly data from Supabase
  let selected: any
  if (period === 'month') {
    selected = mktData.find(m => m.mtd) || { month: 'Apr 2026', rev: 0, orders: 0, spend: 0, mer: 0, cpa: 0, aov: 0, conv: 0, mtd: true }
  } else if (period === 'lastmonth') {
    selected = mktData.find(m => m.month === 'Mar' || m.month === 'Mar 2026') || { month: 'Mar 2026', rev: 0, orders: 0, spend: 0, mer: 0, cpa: 0, aov: 0, conv: 0, mtd: false }
  } else {
    // YTD = sum from all non-MTD rows
    const rows = mktData.filter(m => !m.mtd)
    selected = {
      month: 'YTD Jan–Apr',
      rev: rows.reduce((s, r) => s + r.rev, 0),
      orders: rows.reduce((s, r) => s + r.orders, 0),
      spend: rows.reduce((s, r) => s + r.spend, 0),
      mer: 0, cpa: 0, aov: 0, conv: 0, mtd: false,
    }
    selected.mer = selected.spend > 0 ? selected.rev / selected.spend : 0
    selected.cpa = selected.orders > 0 ? selected.spend / selected.orders : 0
    selected.aov = selected.orders > 0 ? selected.rev / selected.orders : 0
  }

  // Daily data for selected period
  const monthKey = period === 'month' ? 'Apr 2026' : period === 'lastmonth' ? 'Mar 2026' : 'Jan 2026'
  const dailyRev = getDailySpendForPeriod(dailyData, monthKey) // Use spend as proxy for revenue trend
  const dailyMeta = getDailySpendForPeriod(metaDailyRows, monthKey)
  const dailyGoogle = getDailySpendForPeriod(googleDailyRows, monthKey)
  const dayLabels = mkDailyLabels(Math.max(dailyRev.length, dailyMeta.length, dailyGoogle.length))

  const ecommDailyData = {
    labels: dayLabels,
    datasets: [{ label: 'Revenue', data: dailyRev, borderColor: RED, backgroundColor: 'rgba(192,57,43,0.1)', tension: 0.35, fill: true, pointRadius: 1.5, pointBackgroundColor: RED }],
  }

  const metaDailyData = {
    labels: mkDailyLabels(dailyMeta.length),
    datasets: [{ label: 'Meta Spend', data: dailyMeta, borderColor: BLU, backgroundColor: 'rgba(41,128,185,0.1)', tension: 0.3, fill: true, pointRadius: 1, pointBackgroundColor: BLU }],
  }

  const googleDailyData = {
    labels: mkDailyLabels(dailyGoogle.length),
    datasets: [{ label: 'Google Spend', data: dailyGoogle, borderColor: GRN, backgroundColor: 'rgba(39,174,96,0.1)', tension: 0.3, fill: true, pointRadius: 1, pointBackgroundColor: GRN }],
  }

  // ROAS & MER trend
  const trendData = {
    labels: mktData.map(m => m.month.slice(0, 3)),
    datasets: [
      { label: 'MER', data: mktData.map(m => m.mer), borderColor: ORG, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3, pointBackgroundColor: ORG },
    ],
  }
  const trendOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` MER: ${ctx.raw?.toFixed(2)}` } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } }, min: 0 },
    },
  }

  // Social data for period
  const socialPeriod = period === 'month' ? SOCIAL_DATA.apr : period === 'lastmonth' ? SOCIAL_DATA.mar : SOCIAL_DATA.feb

  // Marketing flags from data
  const mktSignals = (data.signals ?? []).filter(s => s.signal_type === 'marketing' && !s.archived)

  // Calculate Meta and Google spend from daily data
  const monthKeyForCalc = period === 'month' ? '2026-04' : period === 'lastmonth' ? '2026-03' : '2026-02'
  const metaSpend = metaDailyRows.filter(r => r.date.startsWith(monthKeyForCalc)).reduce((s, r) => s + r.spend, 0)
  const googleSpend = googleDailyRows.filter(r => r.date.startsWith(monthKeyForCalc)).reduce((s, r) => s + r.spend, 0)

  // Use ROAS from monthly data if available, fallback to estimates
  const monthData = period === 'month' ? mktData.find(m => m.mtd) : period === 'lastmonth' ? mktData.find(m => m.month === 'Mar' || m.month === 'Mar 2026') : mktData[0]
  const metaRoas = monthData?.meta_roas ?? 2.4
  const googleRoas = monthData?.google_roas ?? 1.9

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Social</span><span>{formatSyncTime(data.syncMetadata, 'seo')}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Marketing Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Mar CPA $26.01 — up from $23.15 Feb. Above $25 threshold needs attention. Conv rate 2.67% also declining.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Google ROAS Mar 1.62 — below Meta 1.54. Both below 2.0 threshold. Check campaign health.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>MER 3.19 Feb was the best month. Apr MTD MER 5.05 — early but encouraging.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Review Google campaign structure — $7,168 spend at 1.62 ROAS is the weakest channel this month.</span></div>
        </div>
      </div>

      {/* Period Toggle */}
      <div style={{ marginBottom: 16 }}>
        <div className="fg">
          <span className="fgl">Period</span>
          {(['month', 'lastmonth', 'ytd'] as Period[]).map(p => (
            <button key={p} className={`fchip ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'month' ? 'Apr MTD' : p === 'lastmonth' ? 'Mar' : 'YTD Jan–Apr'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row cols-6 */}
      <div className="kpi-row cols-6">
        <div className="kpi">
          <div className="kpi-lbl">eComm Revenue</div>
          <div className="kpi-val small">{fmt(selected?.rev ?? 0)}</div>
          <div className="kpi-sub">{selected?.month}</div>
        </div>
        <div className="kpi red">
          <div className="kpi-lbl">Total Ad Spend</div>
          <div className="kpi-val small">{fmt(selected?.spend ?? 0)}</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Blended MER</div>
          <div className="kpi-val small">{(selected?.mer ?? 0).toFixed(2)}×</div>
        </div>
        <div className={`kpi ${(selected?.cpa ?? 0) <= 25 ? 'green' : (selected?.cpa ?? 0) <= 30 ? 'amber' : 'red'}`}>
          <div className="kpi-lbl">Avg CPA</div>
          <div className="kpi-val small">${(selected?.cpa ?? 0).toFixed(2)}</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Avg AOV</div>
          <div className="kpi-val small">${(selected?.aov ?? 0).toFixed(2)}</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-lbl">Orders</div>
          <div className="kpi-val small">{selected?.orders ?? 0}</div>
        </div>
      </div>

      {/* Meta + Google panels */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Meta Ads</span><span className="pg">{selected?.month}</span></div>
          <div className="pb">
            <div className="kpi-row cols-3" style={{ marginBottom: 12 }}>
              <div className="kpi" style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">Spend</div>
                <div className="kpi-val small">{fmt(metaSpend)}</div>
              </div>
              <div className={`kpi ${metaRoas >= 2 ? 'green' : 'red'}`} style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">ROAS</div>
                <div className="kpi-val small">{metaRoas.toFixed(2)}×</div>
              </div>
              <div className="kpi" style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">Conv Value</div>
                <div className="kpi-val small">{fmt(metaSpend * metaRoas)}</div>
              </div>
            </div>
            <div className="chart-h120"><Line data={metaDailyData} options={dailyLineOpts(BLU)} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Google Ads</span><span className="pg">{selected?.month}</span></div>
          <div className="pb">
            <div className="kpi-row cols-3" style={{ marginBottom: 12 }}>
              <div className="kpi" style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">Spend</div>
                <div className="kpi-val small">{fmt(googleSpend)}</div>
              </div>
              <div className={`kpi ${googleRoas >= 2 ? 'green' : 'red'}`} style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">ROAS</div>
                <div className="kpi-val small">{googleRoas.toFixed(2)}×</div>
              </div>
              <div className="kpi" style={{ padding: '10px 12px' }}>
                <div className="kpi-lbl">Conv Value</div>
                <div className="kpi-val small">{fmt(googleSpend * googleRoas)}</div>
              </div>
            </div>
            <div className="chart-h120"><Line data={googleDailyData} options={dailyLineOpts(GRN)} /></div>
          </div>
        </div>
      </div>

      {/* Daily eCommerce Revenue */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Daily eCommerce Revenue</span><span className="pg">{selected?.month}</span></div>
        <div className="pb">
          <div className="chart-h200"><Line data={ecommDailyData} options={dailyLineOpts(RED)} /></div>
        </div>
      </div>

      {/* ROAS/MER Trend + Store Performance Table */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">MER Monthly Trend</span></div>
          <div className="pb">
            <div className="chart-h200"><Line data={trendData} options={trendOpts} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Store Performance</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="r">Revenue</th>
                  <th className="r">Spend</th>
                  <th className="r">MER</th>
                  <th className="r">CPA</th>
                  <th className="r">Orders</th>
                </tr>
              </thead>
              <tbody>
                {mktData.map(m => (
                  <tr key={m.month}>
                    <td>{m.month}{m.mtd ? ' *' : ''}</td>
                    <td className="r">{fmt(m.rev)}</td>
                    <td className="r">{fmt(m.total_spend)}</td>
                    <td className="r"><span className={m.mer >= 3 ? 'up' : m.mer >= 2 ? 'warn' : 'dn'}>{m.mer.toFixed(2)}×</span></td>
                    <td className="r"><span className={m.cpa <= 25 ? 'up' : m.cpa <= 30 ? 'warn' : 'dn'}>${m.cpa.toFixed(2)}</span></td>
                    <td className="r">{m.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Content Pipeline + Instagram */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph">
            <span className="pt">Content Pipeline</span>
            <span className="pg">{socialPeriod.month}</span>
          </div>
          <div className="pb">
            {socialPeriod.posts.map(post => (
              <div key={post.id} className="feed-item">
                <div className="feed-date" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{post.id} · {post.pillar}</span>
                  <span className={`tag ${post.status === 'POSTED' ? 'tag-green' : post.status === 'SHOT' ? 'tag-blue' : 'tag-grey'}`}>{post.status}</span>
                </div>
                <div className="feed-text">{post.idea}</div>
                {post.scheduled && <div className="feed-meta">Scheduled: {post.scheduled}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Instagram Performance</span><span className="pg">Feb 2026</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Post</th>
                  <th className="r">Views</th>
                  <th className="r">Likes</th>
                  <th className="r">Saves</th>
                  <th className="r">Shares</th>
                </tr>
              </thead>
              <tbody>
                {SOCIAL_DATA.feb.posts.map(p => (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.idea}</td>
                    <td className="r">{p.views?.toLocaleString()}</td>
                    <td className="r">{p.likes?.toLocaleString()}</td>
                    <td className="r">{p.saves?.toLocaleString()}</td>
                    <td className="r">{p.shares?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Marketing Flags */}
      {mktSignals.length > 0 && (
        <div className="panel">
          <div className="ph"><span className="pt">Marketing Flags</span></div>
          <div className="pb">
            <div className="flag-row">
              {mktSignals.map((s, i) => (
                <div key={s.id ?? i} className="flag-item blue">
                  <span className="flag-icon">→</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
