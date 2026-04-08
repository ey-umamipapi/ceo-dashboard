'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { fmt, DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const MARGIN_DATA = [
  { month: 'Jul 2025', rev: 180925, gp: 94714, nop: 53112, gpm: 52.3, nopm: 29.4 },
  { month: 'Aug 2025', rev: 135678, gp: 72814, nop: 41200, gpm: 53.7, nopm: 30.4 },
  { month: 'Sep 2025', rev: 156234, gp: 80344, nop: 43812, gpm: 51.4, nopm: 28.0 },
  { month: 'Oct 2025', rev: 201456, gp: 56246, nop: null, gpm: 27.9, nopm: -17.1 },
  { month: 'Nov 2025', rev: 193210, gp: 98537, nop: 67625, gpm: 51.0, nopm: 35.0 },
]

const AP_CATEGORIES_STATIC = [
  { name: 'COGS / Ingredients', amount: 87420 },
  { name: 'Agency Fees', amount: 52000 },
  { name: 'Retcon Commission', amount: 31500 },
  { name: 'Freight & Logistics', amount: 18700 },
  { name: 'Packaging', amount: 14200 },
  { name: 'Other', amount: 9800 },
]

const AR_CUSTOMERS = [
  { customer: 'Coles', balance: 220000, overdue: 0 },
  { customer: 'Nando\'s', balance: 145000, overdue: 0 },
  { customer: 'Distribution', balance: 82000, overdue: 10426 },
  { customer: 'Other', balance: 48000, overdue: 0 },
]

const BANK_ACCOUNTS = [
  { account: 'ANZ Operating', balance: 512000 },
  { account: 'ANZ Savings', balance: 165000 },
  { account: 'Outstanding Cheques', balance: -101000 },
]

export default function FinancialControl({ data }: { data: DashboardData }) {
  const apCategories = data.apCategories?.length ? data.apCategories : AP_CATEGORIES_STATIC
  const largeTxns = data.largeTxns ?? []
  const anomalies = data.anomalies ?? []

  // Margin trend line chart
  const marginLabels = MARGIN_DATA.map(m => m.month.slice(0, 3))
  const lineData = {
    labels: marginLabels,
    datasets: [
      { label: 'GPM %', data: MARGIN_DATA.map(m => m.gpm), borderColor: GRN, backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, pointBackgroundColor: GRN },
      { label: 'NOPM %', data: MARGIN_DATA.map(m => m.nopm), borderColor: BLU, backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, pointBackgroundColor: BLU, borderDash: [4, 3] },
    ],
  }
  const lineOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}%` } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 }, callback: (v: number) => `${v}%` } },
    },
  }

  // AP doughnut
  const apTotal = apCategories.reduce((s, c) => s + c.amount, 0)
  const donutData = {
    labels: apCategories.map(c => c.name),
    datasets: [{ data: apCategories.map(c => c.amount), backgroundColor: [RED, ORG, BLU, PRP, GRN, '#555'], borderWidth: 0 }],
  }
  const donutOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
  }

  const grossAR = AR_CUSTOMERS.reduce((s, c) => s + c.balance, 0)
  const overdueAR = AR_CUSTOMERS.reduce((s, c) => s + c.overdue, 0)
  const grossBank = BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{DATA_UPDATED.financial}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Financial Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Dec 2025–Mar 2026 GP/NOP not extracted — 4 months of margin blind. Financial model is operating on Nov 2025 data.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Oct 2025: GPM 27.9%, NOPM -17.1%. Coles-heavy mix likely driver — needs confirmation.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Net liquidity $576K. Bank $677K gross. Strong cash position.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Extract Dec 2025–Mar 2026 P&L from Xero. Priority task.</span></div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className="kpi green">
          <div className="kpi-lbl">GP Margin (Nov avg)</div>
          <div className="kpi-val">51.0%</div>
          <div className="kpi-sub">Nov 2025 — latest clean data</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Net Op Margin (Nov)</div>
          <div className="kpi-val">35.0%</div>
          <div className="kpi-sub">Nov 2025 actuals</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Largest AP Category</div>
          <div className="kpi-val small">COGS</div>
          <div className="kpi-sub">{fmt(apCategories[0]?.amount ?? 87420)} outstanding</div>
        </div>
      </div>

      {/* Margin Trend + AP Donut */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Margin Trend</span><span className="pg">Jul–Nov 2025</span></div>
          <div className="pb">
            <div className="chart-h200"><Line data={lineData} options={lineOpts} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">AP by Category</span></div>
          <div className="pb">
            <div className="chart-h200"><Doughnut data={donutData} options={donutOpts} /></div>
          </div>
        </div>
      </div>

      {/* GP/NOP Monthly Actuals */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">GP / NOP Monthly Actuals</span><span className="pg">Jul–Nov 2025</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">Revenue</th>
                <th className="r">Gross Profit</th>
                <th className="r">GPM %</th>
                <th className="r">Net Op Profit</th>
                <th className="r">NOPM %</th>
              </tr>
            </thead>
            <tbody>
              {MARGIN_DATA.map(m => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td className="r">{fmt(m.rev)}</td>
                  <td className="r">{fmt(m.gp)}</td>
                  <td className="r"><span className={m.gpm >= 45 ? 'up' : m.gpm >= 30 ? 'warn' : 'dn'}>{m.gpm.toFixed(1)}%</span></td>
                  <td className="r">{m.nop != null ? fmt(m.nop) : '—'}</td>
                  <td className="r"><span className={(m.nopm ?? 0) >= 25 ? 'up' : (m.nopm ?? 0) >= 0 ? 'warn' : 'dn'}>{m.nopm != null ? m.nopm.toFixed(1) + '%' : '—'}</span></td>
                </tr>
              ))}
              <tr style={{ background: 'rgba(192,57,43,0.07)' }}>
                <td colSpan={6} style={{ color: RLT, fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                  ⚠ Dec 2025 – Mar 2026: GP/NOP data not yet extracted from Xero. Financial model has a 4-month gap.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AP by Category Table + Finance Notes */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">AP by Category</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="r">Amount</th>
                  <th className="r">% of AP</th>
                </tr>
              </thead>
              <tbody>
                {apCategories.map(c => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td className="r">{fmt(c.amount)}</td>
                    <td className="r">{apTotal > 0 ? (c.amount / apTotal * 100).toFixed(1) : '0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Finance Notes</span></div>
          <div className="pb">
            <div style={{ fontSize: 12, color: 'var(--creme)', lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--white)' }}>Oct GPM dip to 27.9%:</strong> Likely driven by Coles-heavy sales mix and lower volume diluting fixed COGS. Validate against Xero actuals.</p>
              <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--white)' }}>Agency fees:</strong> Liaise + OP Digital combined ~$104K YTD. Review vs output monthly.</p>
              <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--white)' }}>Retcon:</strong> Commission-based. $63K YTD against Nando's + Coles volume. Check invoice timing.</p>
              <p><strong style={{ color: '#F39C12' }}>Action:</strong> Full P&L extraction Dec–Mar is the single highest-priority financial task.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash & Working Capital */}
      <div className="slbl">Cash &amp; Working Capital</div>
      <div className="kpi-row cols-3">
        <div className="kpi green">
          <div className="kpi-lbl">Net Liquidity</div>
          <div className="kpi-val">$576K</div>
          <div className="kpi-sub">After known commitments</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Gross AR</div>
          <div className="kpi-val">{fmt(grossAR)}</div>
          <div className="kpi-sub">Total accounts receivable</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Overdue AR</div>
          <div className="kpi-val">{fmt(overdueAR)}</div>
          <div className="kpi-sub">Outstanding &gt;30 days</div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Bank Position</span></div>
          <div className="pb">
            <table className="tbl">
              <thead><tr><th>Account</th><th className="r">Balance</th></tr></thead>
              <tbody>
                {BANK_ACCOUNTS.map(a => (
                  <tr key={a.account}>
                    <td>{a.account}</td>
                    <td className="r" style={{ color: a.balance < 0 ? RLT : 'var(--creme)' }}>{fmt(Math.abs(a.balance))}{a.balance < 0 ? ' (cr)' : ''}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--grey3)' }}>
                  <td><strong>Net</strong></td>
                  <td className="r"><strong style={{ color: 'var(--white)' }}>{fmt(grossBank)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">AR by Customer</span></div>
          <div className="pb">
            <table className="tbl">
              <thead><tr><th>Customer</th><th className="r">Balance</th><th className="r">Overdue</th></tr></thead>
              <tbody>
                {AR_CUSTOMERS.map(c => (
                  <tr key={c.customer}>
                    <td>{c.customer}</td>
                    <td className="r">{fmt(c.balance)}</td>
                    <td className="r"><span className={c.overdue > 0 ? 'dn' : 'up'}>{c.overdue > 0 ? fmt(c.overdue) : '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Large Transactions */}
      {largeTxns.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Large Transactions</span></div>
          <div className="pb">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Vendor</th><th>Category</th><th className="r">Amount</th></tr></thead>
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

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="panel">
          <div className="ph"><span className="pt">Anomaly Flags</span></div>
          <div className="pb">
            <div className="flag-row">
              {anomalies.map((a, i) => (
                <div key={a.id ?? i} className={`flag-item ${a.flag === 'HIGH' ? 'red' : a.flag === 'WATCH' ? '' : 'green'}`}>
                  <span className="flag-icon">{a.flag === 'HIGH' ? '⚠' : a.flag === 'WATCH' ? '→' : '↑'}</span>
                  <span><strong>{a.category}</strong> — current {fmt(a.current_val)} vs avg {fmt(a.average)} ({a.ratio?.toFixed(2)}×)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
