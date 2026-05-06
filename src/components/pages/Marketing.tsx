'use client'

import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DashboardData, MarketingMonth, MarketingDaily, ShopifyCohort } from '@/types'
import { fmt } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9'

const META_MONTHLY_BUDGET = 22000
const GOOGLE_MONTHLY_BUDGET = 8000

type Period = 'lastmonth' | 'month' | 'ytd'
type Tab = 'paid' | 'ecomm'

function mkDailyLabels(count: number) {
  return Array.from({ length: count }, (_, i) => String(i + 1))
}

function dailyLineOpts(color: string): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const, labels: { color: '#aaa', font: { size: 9 }, boxWidth: 10, padding: 8 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: $${ctx.raw}` } },
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => '$' + v } },
    },
  }
}

function fmtPct(val: number): string {
  return (val * 100).toFixed(1) + '%'
}

export default function Marketing({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<Period>('lastmonth')
  const [tab, setTab] = useState<Tab>('paid')
  const shopifyCohorts: ShopifyCohort[] = data.shopifyCohorts ?? []

  const mktData = data.marketing ?? []
  const dailyData = data.marketingDaily ?? []

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now           = new Date()
  const curMonthAbbr  = MONTH_ABBR[now.getMonth()]
  const prevMonthAbbr = MONTH_ABBR[(now.getMonth() + 11) % 12]

  function monthPrefix(offset: number): string {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const fyStartYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  const ytdLabel    = `YTD Jul ${fyStartYear}–${prevMonthAbbr}`

  const metaDailyRows   = dailyData.filter(d => d.channel === 'Meta').sort((a, b) => a.date.localeCompare(b.date))
  const googleDailyRows = dailyData.filter(d => d.channel === 'Google').sort((a, b) => a.date.localeCompare(b.date))

  function getDailySpendForPeriod(rows: MarketingDaily[], prefix: string): number[] {
    return rows.filter(r => r.date.startsWith(prefix)).map(r => r.spend)
  }

  let selected: any
  if (period === 'month') {
    selected = mktData.find(m => m.mtd) || { month: curMonthAbbr, rev: 0, orders: 0, total_spend: 0, mer: 0, cpa: 0, aov: 0, mtd: true }
  } else if (period === 'lastmonth') {
    selected = mktData.filter(m => !m.mtd).at(-1) || { month: prevMonthAbbr, rev: 0, orders: 0, total_spend: 0, mer: 0, cpa: 0, aov: 0, mtd: false }
  } else {
    const rows = mktData.filter(m => !m.mtd)
    selected = {
      month: ytdLabel,
      rev: rows.reduce((s, r) => s + r.rev, 0),
      orders: rows.reduce((s, r) => s + r.orders, 0),
      spend: rows.reduce((s, r) => s + r.total_spend, 0),
      mer: 0, cpa: 0, aov: 0, mtd: false,
    }
    selected.mer = selected.spend > 0 ? selected.rev / selected.spend : 0
    selected.cpa = selected.orders > 0 ? selected.spend / selected.orders : 0
    selected.aov = selected.orders > 0 ? selected.rev / selected.orders : 0
  }

  const dailyPrefix   = period === 'month' ? monthPrefix(0) : period === 'lastmonth' ? monthPrefix(-1) : monthPrefix(-3)
  const dailyRev      = getDailySpendForPeriod(dailyData, dailyPrefix)
  const dailyMeta     = getDailySpendForPeriod(metaDailyRows, dailyPrefix)
  const dailyGoogle   = getDailySpendForPeriod(googleDailyRows, dailyPrefix)
  const dayLabels     = mkDailyLabels(Math.max(dailyRev.length, dailyMeta.length, dailyGoogle.length))

  function cumulativeSum(arr: number[]): number[] {
    return arr.reduce<number[]>((acc, val, i) => { acc.push((acc[i - 1] ?? 0) + val); return acc }, [])
  }

  const metaCumulative  = cumulativeSum(dailyMeta)
  const googleCumulative = cumulativeSum(dailyGoogle)
  const metaPace   = dailyMeta.map((_, i) => Math.round((META_MONTHLY_BUDGET / 30) * (i + 1)))
  const googlePace = dailyGoogle.map((_, i) => Math.round((GOOGLE_MONTHLY_BUDGET / 30) * (i + 1)))

  const metaDailyChartData = {
    labels: mkDailyLabels(dailyMeta.length),
    datasets: [
      { label: 'Meta Daily Spend', data: dailyMeta, borderColor: BLU, backgroundColor: 'rgba(41,128,185,0.1)', tension: 0.3, fill: true, pointRadius: 1, pointBackgroundColor: BLU },
      { label: 'Cumulative Spend', data: metaCumulative, borderColor: BLU, backgroundColor: 'transparent', tension: 0.3, fill: false, pointRadius: 0, borderWidth: 2 },
      { label: 'Budget pace', data: metaPace, borderColor: '#888', backgroundColor: 'transparent', tension: 0, fill: false, pointRadius: 0, borderDash: [4, 4], borderWidth: 1.5 },
    ],
  }

  const googleDailyChartData = {
    labels: mkDailyLabels(dailyGoogle.length),
    datasets: [
      { label: 'Google Daily Spend', data: dailyGoogle, borderColor: GRN, backgroundColor: 'rgba(39,174,96,0.1)', tension: 0.3, fill: true, pointRadius: 1, pointBackgroundColor: GRN },
      { label: 'Cumulative Spend', data: googleCumulative, borderColor: GRN, backgroundColor: 'transparent', tension: 0.3, fill: false, pointRadius: 0, borderWidth: 2 },
      { label: 'Budget pace', data: googlePace, borderColor: '#888', backgroundColor: 'transparent', tension: 0, fill: false, pointRadius: 0, borderDash: [4, 4], borderWidth: 1.5 },
    ],
  }

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

  const ecommDailyData = {
    labels: dayLabels,
    datasets: [{ label: 'Revenue', data: dailyRev, borderColor: RED, backgroundColor: 'rgba(192,57,43,0.1)', tension: 0.35, fill: true, pointRadius: 1.5, pointBackgroundColor: RED }],
  }

  const metaPeriodRows    = metaDailyRows.filter(r => r.date.startsWith(dailyPrefix))
  const googlePeriodRows  = googleDailyRows.filter(r => r.date.startsWith(dailyPrefix))
  const metaSpend         = metaPeriodRows.reduce((s, r) => s + r.spend, 0)
  const googleSpend       = googlePeriodRows.reduce((s, r) => s + r.spend, 0)
  const metaImpressions   = metaPeriodRows.reduce((s, r) => s + (r.impressions ?? 0), 0)
  const googleImpressions = googlePeriodRows.reduce((s, r) => s + (r.impressions ?? 0), 0)

  const monthData  = period === 'month' ? mktData.find(m => m.mtd) : period === 'lastmonth' ? mktData.filter(m => !m.mtd).at(-1) : mktData[0]
  const metaRoas   = monthData?.meta_roas ?? 2.4
  const googleRoas = monthData?.google_roas ?? 1.9

  const mktSignals = (data.signals ?? []).filter(s => s.signal_type === 'marketing' && !s.archived)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Paid Media</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
      </div>

      {/* Intel */}
      <div className="cmd-block">
        <div className="cmd-block-title">Paid Media Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Mar CPA $26.01 — up from $23.15 Feb. Above $25 threshold. Conv rate 2.67% declining.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Google ROAS Mar 1.62 — below 2.0 threshold. Review campaign structure.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Apr MTD MER 5.05 — best early read of FY26. Watch CPA as spend scales.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Review Google campaign structure — $7,168 spend at 1.62 ROAS is weakest channel this month.</span></div>
        </div>
      </div>

      {/* Anchor tabs */}
      <div style={{ marginBottom: 16 }}>
        <div className="fg">
          <span className="fgl">View</span>
          <button className={`fchip${tab === 'paid' ? ' active' : ''}`} onClick={() => setTab('paid')}>Paid Ads</button>
          <button className={`fchip${tab === 'ecomm' ? ' active' : ''}`} onClick={() => setTab('ecomm')}>eCommerce</button>
        </div>
      </div>

      {/* Period toggle — both tabs */}
      <div style={{ marginBottom: 16 }}>
        <div className="fg">
          <span className="fgl">Period</span>
          {(['month', 'lastmonth', 'ytd'] as Period[]).map(p => (
            <button key={p} className={`fchip${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'month' ? `${curMonthAbbr} MTD` : p === 'lastmonth' ? prevMonthAbbr : ytdLabel}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAID ADS TAB ─────────────────────────────────────────────────── */}
      {tab === 'paid' && (
        <>
          <div className="kpi-row cols-6" style={{ marginBottom: 16 }}>
            <div className="kpi">
              <div className="kpi-lbl">eComm Revenue</div>
              <div className="kpi-val small">{fmt(selected?.rev ?? 0)}</div>
              <div className="kpi-sub">{selected?.month}</div>
            </div>
            <div className="kpi red">
              <div className="kpi-lbl">Total Ad Spend</div>
              <div className="kpi-val small">{fmt(selected?.total_spend ?? selected?.spend ?? 0)}</div>
            </div>
            <div className={`kpi ${(selected?.mer ?? 0) >= 3 ? 'orange' : (selected?.mer ?? 0) >= 2 ? '' : 'red'}`}>
              <div className="kpi-lbl">Blended MER</div>
              <div className="kpi-val small">{(selected?.mer ?? 0).toFixed(2)}×</div>
              <div className="kpi-sub">Target &gt;3.0× <span className={(selected?.mer ?? 0) >= 3 ? 'up' : 'dn'}>{(selected?.mer ?? 0) >= 3 ? 'on target' : 'below'}</span></div>
            </div>
            <div className={`kpi ${(selected?.cpa ?? 0) <= 25 ? 'green' : (selected?.cpa ?? 0) <= 30 ? 'amber' : 'red'}`}>
              <div className="kpi-lbl">Avg CPA</div>
              <div className="kpi-val small">${(selected?.cpa ?? 0).toFixed(2)}</div>
              <div className="kpi-sub">Target ≤$25 <span className={(selected?.cpa ?? 0) <= 25 ? 'up' : 'dn'}>{(selected?.cpa ?? 0) <= 25 ? 'on target' : '+' + ((selected?.cpa ?? 0) - 25).toFixed(2) + ' over'}</span></div>
            </div>
            <div className="kpi blue">
              <div className="kpi-lbl">Avg AOV</div>
              <div className="kpi-val small">${(selected?.aov ?? 0).toFixed(2)}</div>
              <div className="kpi-sub">per order</div>
            </div>
            <div className="kpi purple">
              <div className="kpi-lbl">Orders</div>
              <div className="kpi-val small">{selected?.orders ?? 0}</div>
            </div>
          </div>

          <div className="g2" style={{ marginBottom: 16 }}>
            <div className="panel">
              <div className="ph"><span className="pt">Meta Ads</span><span className="pg">{selected?.month}</span></div>
              <div className="pb">
                <div className="kpi-row cols-4" style={{ marginBottom: 12 }}>
                  <div className="kpi" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Spend</div>
                    <div className="kpi-val small">{fmt(metaSpend)}</div>
                  </div>
                  <div className={`kpi ${metaRoas >= 2 ? 'green' : 'red'}`} style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">ROAS</div>
                    <div className="kpi-val small">{metaRoas.toFixed(2)}×</div>
                    <div className="kpi-sub">Target &gt;2.0×</div>
                  </div>
                  <div className="kpi" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Conv Value</div>
                    <div className="kpi-val small">{fmt(metaSpend * metaRoas)}</div>
                  </div>
                  <div className="kpi blue" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Impressions</div>
                    <div className="kpi-val small">{metaImpressions > 0 ? metaImpressions.toLocaleString() : '—'}</div>
                  </div>
                </div>
                <div className="chart-h140"><Line data={metaDailyChartData} options={dailyLineOpts(BLU)} /></div>
              </div>
            </div>

            <div className="panel">
              <div className="ph"><span className="pt">Google Ads</span><span className="pg">{selected?.month}</span></div>
              <div className="pb">
                <div className="kpi-row cols-4" style={{ marginBottom: 12 }}>
                  <div className="kpi" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Spend</div>
                    <div className="kpi-val small">{fmt(googleSpend)}</div>
                  </div>
                  <div className={`kpi ${googleRoas >= 2 ? 'green' : 'red'}`} style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">ROAS</div>
                    <div className="kpi-val small">{googleRoas.toFixed(2)}×</div>
                    <div className="kpi-sub">Target &gt;2.0×</div>
                  </div>
                  <div className="kpi" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Conv Value</div>
                    <div className="kpi-val small">{fmt(googleSpend * googleRoas)}</div>
                  </div>
                  <div className="kpi green" style={{ padding: '10px 12px' }}>
                    <div className="kpi-lbl">Impressions</div>
                    <div className="kpi-val small">{googleImpressions > 0 ? googleImpressions.toLocaleString() : '—'}</div>
                  </div>
                </div>
                <div className="chart-h140"><Line data={googleDailyChartData} options={dailyLineOpts(GRN)} /></div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="ph"><span className="pt">MER Monthly Trend</span></div>
            <div className="pb">
              <div className="chart-h200"><Line data={trendData} options={trendOpts} /></div>
            </div>
          </div>
        </>
      )}

      {/* ── ECOMMERCE TAB ────────────────────────────────────────────────── */}
      {tab === 'ecomm' && (
        <>
          <div className="kpi-row cols-4" style={{ marginBottom: 16 }}>
            <div className="kpi">
              <div className="kpi-lbl">Revenue</div>
              <div className="kpi-val small">{fmt(selected?.rev ?? 0)}</div>
              <div className="kpi-sub">{selected?.month}</div>
            </div>
            <div className="kpi purple">
              <div className="kpi-lbl">Orders</div>
              <div className="kpi-val small">{selected?.orders ?? 0}</div>
            </div>
            <div className="kpi blue">
              <div className="kpi-lbl">Avg AOV</div>
              <div className="kpi-val small">${(selected?.aov ?? 0).toFixed(2)}</div>
            </div>
            <div className={`kpi ${(selected?.cpa ?? 0) <= 25 ? 'green' : (selected?.cpa ?? 0) <= 30 ? 'amber' : 'red'}`}>
              <div className="kpi-lbl">CPA</div>
              <div className="kpi-val small">${(selected?.cpa ?? 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="ph"><span className="pt">Daily eCommerce Revenue</span><span className="pg">{selected?.month}</span></div>
            <div className="pb">
              <div className="chart-h200"><Line data={ecommDailyData} options={dailyLineOpts(RED)} /></div>
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
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

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="ph">
              <span className="pt">Customer Cohorts</span>
              <span className="pg">FY26 Shopify retention</span>
            </div>
            <div className="pb">
              {shopifyCohorts.length === 0 ? (
                <div style={{ color: '#666', fontSize: 12, padding: '12px 0', textAlign: 'center' }}>
                  Cohort data not yet synced — run <code style={{ color: '#aaa' }}>python scripts/sync_shopify.py</code>
                </div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="r">New Customers</th>
                      <th className="r">30-day Retention</th>
                      <th className="r">90-day Retention</th>
                      <th className="r">Avg LTV</th>
                      <th className="r">Avg Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopifyCohorts.map(c => (
                      <tr key={c.cohort_month}>
                        <td>{c.cohort_month}</td>
                        <td className="r">{c.first_purchase_count}</td>
                        <td className="r">
                          <span className={c.repeat_rate_30d >= 0.2 ? 'up' : c.repeat_rate_30d >= 0.1 ? 'warn' : 'dn'}>
                            {fmtPct(c.repeat_rate_30d)}
                          </span>
                        </td>
                        <td className="r">
                          <span className={c.repeat_rate_90d >= 0.3 ? 'up' : c.repeat_rate_90d >= 0.15 ? 'warn' : 'dn'}>
                            {fmtPct(c.repeat_rate_90d)}
                          </span>
                        </td>
                        <td className="r">{fmt(c.avg_ltv)}</td>
                        <td className="r">{c.avg_orders.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

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
        </>
      )}
    </div>
  )
}
