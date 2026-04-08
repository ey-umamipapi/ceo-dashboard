'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { fmt, DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const BURN_DATA = [
  { month: 'Oct', cogs: 179551, opex: 48000 },
  { month: 'Nov', cogs: 84802, opex: 58000 },
  { month: 'Dec', cogs: 75000, opex: 52000 },
  { month: 'Jan', cogs: 130000, opex: 97000 },
  { month: 'Feb', cogs: 85000, opex: 97000 },
  { month: 'Mar', cogs: 55000, opex: 56000 },
]

const AGENCY_FEES = [
  { agency: 'Liaise Marketing', type: 'Retainer', monthly: 8500, ytd: 51000, status: 'active' },
  { agency: 'OP Digital', type: 'Retainer', monthly: 5000, ytd: 30000, status: 'active' },
  { agency: 'Ranged', type: 'Project', monthly: null, ytd: 14200, status: 'active' },
  { agency: 'AY Creations', type: 'Ad Hoc', monthly: null, ytd: 8800, status: 'active' },
]

const RETCON_INVOICES = [
  { invoice: 'RC-001', period: 'Jul–Sep 2025', amount: 14200, status: 'Paid' },
  { invoice: 'RC-002', period: 'Oct–Nov 2025', amount: 18400, status: 'Paid' },
  { invoice: 'RC-003', period: 'Dec 2025–Jan 2026', amount: 16800, status: 'Paid' },
  { invoice: 'RC-004', period: 'Feb–Mar 2026', amount: 13800, status: 'Pending' },
]

const peakBurn = Math.max(...BURN_DATA.map(b => b.cogs + b.opex))
const agencyYtd = AGENCY_FEES.reduce((s, a) => s + a.ytd, 0)
const retconYtd = RETCON_INVOICES.reduce((s, r) => s + r.amount, 0)

export default function SpendControl({ data }: { data: DashboardData }) {
  const largeTxns = data.largeTxns ?? []
  const anomalies = data.anomalies ?? []

  // Horizontal bar chart (COGS vs OpEx)
  const burnChartData = {
    labels: BURN_DATA.map(b => b.month),
    datasets: [
      { label: 'COGS', data: BURN_DATA.map(b => b.cogs), backgroundColor: ORG, stack: 'burn', borderRadius: 2 },
      { label: 'OpEx', data: BURN_DATA.map(b => b.opex), backgroundColor: BLU, stack: 'burn', borderRadius: 2 },
    ],
  }

  const burnOpts: any = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 10, padding: 8 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
    },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => fmt(v) } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{DATA_UPDATED.financial}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className="kpi red">
          <div className="kpi-lbl">Peak Monthly Burn</div>
          <div className="kpi-val">{fmt(peakBurn)}</div>
          <div className="kpi-sub">Oct 2025 (COGS-heavy month)</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Agency Fees YTD</div>
          <div className="kpi-val">{fmt(agencyYtd)}</div>
          <div className="kpi-sub">Liaise + OP Digital + others</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Retcon YTD</div>
          <div className="kpi-val">{fmt(retconYtd)}</div>
          <div className="kpi-sub">Commission invoices</div>
        </div>
      </div>

      {/* Monthly Burn Rate */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Monthly Burn Rate</span>
          <span className="pg">Oct 2025 – Mar 2026</span>
        </div>
        <div className="pb">
          <div className="kpi-row cols-3" style={{ marginBottom: 14 }}>
            {BURN_DATA.slice(-3).map(b => (
              <div key={b.month} className="kpi" style={{ padding: '12px 14px' }}>
                <div className="kpi-lbl">{b.month} Total</div>
                <div className="kpi-val small">{fmt(b.cogs + b.opex)}</div>
                <div className="kpi-sub">COGS {fmt(b.cogs)} / OpEx {fmt(b.opex)}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 220, position: 'relative' }}>
            <Bar data={burnChartData} options={burnOpts} />
          </div>
        </div>
      </div>

      {/* Agency Fee Tracker */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Agency Fee Tracker</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Type</th>
                <th className="r">Monthly</th>
                <th className="r">YTD Total</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {AGENCY_FEES.map(a => (
                <tr key={a.agency}>
                  <td>{a.agency}</td>
                  <td>{a.type}</td>
                  <td className="r">{a.monthly ? fmt(a.monthly) : '—'}</td>
                  <td className="r">{fmt(a.ytd)}</td>
                  <td className="c"><span className="tag tag-green">{a.status}</span></td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--grey3)' }}>
                <td colSpan={3}><strong>Total</strong></td>
                <td className="r"><strong style={{ color: 'var(--white)' }}>{fmt(agencyYtd)}</strong></td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Retcon Commission Tracker */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Retcon Commission Tracker</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th className="r">Amount</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {RETCON_INVOICES.map(r => (
                <tr key={r.invoice}>
                  <td>{r.invoice}</td>
                  <td>{r.period}</td>
                  <td className="r">{fmt(r.amount)}</td>
                  <td className="c">
                    <span className={`tag ${r.status === 'Paid' ? 'tag-green' : 'tag-orange'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--grey3)' }}>
                <td colSpan={2}><strong>Total</strong></td>
                <td className="r"><strong style={{ color: 'var(--white)' }}>{fmt(retconYtd)}</strong></td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Large Transaction Alerts */}
      {largeTxns.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Large Transaction Alerts</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Vendor</th><th>Category</th><th className="r">Amount</th></tr>
              </thead>
              <tbody>
                {largeTxns.map((t, i) => (
                  <tr key={t.id ?? i}>
                    <td>{t.date}</td>
                    <td>{t.vendor}</td>
                    <td>{t.category}</td>
                    <td className="r">{fmt(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anomaly Flags */}
      {anomalies.length > 0 && (
        <div className="panel">
          <div className="ph"><span className="pt">Anomaly Flags</span></div>
          <div className="pb">
            <div className="flag-row">
              {anomalies.map((a, i) => (
                <div key={a.id ?? i} className={`flag-item ${a.flag === 'HIGH' ? 'red' : ''}`}>
                  <span className="flag-icon">{a.flag === 'HIGH' ? '⚠' : '→'}</span>
                  <span><strong>{a.category}</strong> — {fmt(a.current_val)} vs avg {fmt(a.average)} ({a.ratio?.toFixed(2)}×)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
