'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { DashboardData, PlMonth, XeroExecSummary, XeroArInvoice } from '@/types'
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


export default function FinancialControl({ data }: { data: DashboardData }) {
  const apCategories = data.apCategories?.length ? data.apCategories : AP_CATEGORIES_STATIC
  const dedupedCategories = apCategories.filter(
    (c, i, arr) => arr.findIndex(x => x.name === c.name) === i
  )
  const largeTxns = data.largeTxns ?? []
  const anomalies = data.anomalies ?? []

  // Use live plMonthly data if available, fall back to hardcoded MARGIN_DATA
  const livePL: PlMonth[] = data.plMonthly ?? []
  const marginSource = livePL.length > 0 ? livePL : MARGIN_DATA.map(m => ({
    id: 0, month: m.month.slice(0, 3), fiscal_year: 'fy26',
    revenue: m.rev, cogs: 0, gross_profit: m.gp, gpm: m.gpm,
    opex: 0, net_op_profit: m.nop ?? 0, nopm: m.nopm ?? 0, sort_order: 0,
  }))

  const latestPL = marginSource[marginSource.length - 1]
  const latestMonthLabel = latestPL?.month ?? 'Nov'

  // Exec summary (cash/working capital)
  const execData: XeroExecSummary[] = data.xeroExecSummary ?? []
  const latestExec = execData[execData.length - 1]
  const cashChartData = {
    labels: execData.map(r => r.month),
    datasets: [
      { label: 'Cash', data: execData.map(r => r.cash), borderColor: GRN, backgroundColor: 'rgba(39,174,96,0.08)', fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: GRN },
      { label: 'Working Capital', data: execData.map(r => r.working_capital), borderColor: BLU, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3, pointBackgroundColor: BLU, borderDash: [4, 3] },
    ],
  }
  const cashChartOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 }, callback: (v: number) => `$${(v/1000).toFixed(0)}K` } },
    },
  }

  // Margin trend line chart
  const marginLabels = marginSource.map(m => m.month.slice(0, 3))
  const lineData = {
    labels: marginLabels,
    datasets: [
      { label: 'GPM %', data: marginSource.map(m => m.gpm), borderColor: GRN, backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, pointBackgroundColor: GRN },
      { label: 'NOPM %', data: marginSource.map(m => m.nopm), borderColor: BLU, backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, pointBackgroundColor: BLU, borderDash: [4, 3] },
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
  const apTotal = dedupedCategories.reduce((s, c) => s + c.amount, 0)
  const donutData = {
    labels: dedupedCategories.map(c => c.name),
    datasets: [{ data: dedupedCategories.map(c => c.amount), backgroundColor: [RED, ORG, BLU, PRP, GRN, '#555'], borderWidth: 0 }],
  }
  const donutOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
  }

  // Live AR invoices from Xero
  const arInvoices: XeroArInvoice[] = data.xeroArInvoices ?? []
  const overdueTotal = arInvoices.reduce((s, r) => s + r.amount_due, 0)
  const overdueCount = arInvoices.length

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{formatSyncTime(data.syncMetadata, 'financial')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Financial Intelligence</div>
        <div className="flag-row">
          {livePL.length === 0 && (
            <div className="flag-item red"><span className="flag-icon">⚠</span><span>Dec 2025–Mar 2026 GP/NOP not extracted — 4 months of margin blind. Financial model is operating on Nov 2025 data.</span></div>
          )}
          {livePL.length === 0 && (
            <div className="flag-item blue"><span className="flag-icon">→</span><span>Extract Dec 2025–Mar 2026 P&L from Xero. Run <code>python scripts/sync_xero.py</code>.</span></div>
          )}
          {livePL.length > 0 && (
            <div className="flag-item green"><span className="flag-icon">↑</span><span>Live P&L data loaded from Xero — {livePL.length} months synced up to {latestMonthLabel}.</span></div>
          )}
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Oct 2025: GPM 27.9%, NOPM -17.1%. Coles-heavy mix likely driver — needs confirmation.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Cash {latestExec ? fmt(latestExec.cash ?? 0) : '$954K'} · Working capital {latestExec ? fmt(latestExec.working_capital ?? 0) : '$155K'} · Strong position.</span></div>
          {overdueTotal > 0 && (
            <div className="flag-item red"><span className="flag-icon">⚠</span><span>AR overdue: {fmt(overdueTotal)} across {overdueCount} invoices — all Coles. 53 days max. Chase immediately.</span></div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className={`kpi ${(latestPL?.gpm ?? 51) >= 50 ? 'orange' : 'red'}`}>
          <div className="kpi-lbl">GP Margin ({latestMonthLabel})</div>
          <div className="kpi-val">{latestPL ? latestPL.gpm.toFixed(1) + '%' : '51.0%'}</div>
          <div className="kpi-sub">
            Target &gt;50%
            <span className={(latestPL?.gpm ?? 51) >= 50 ? 'up' : 'dn'} style={{ marginLeft: 5 }}>
              {((latestPL?.gpm ?? 51) - 50).toFixed(1)}pp {(latestPL?.gpm ?? 51) >= 50 ? 'above' : 'below'}
            </span>
          </div>
        </div>
        <div className={`kpi ${(latestPL?.nopm ?? 35) >= 25 ? 'orange' : (latestPL?.nopm ?? 35) >= 15 ? '' : 'red'}`}>
          <div className="kpi-lbl">Net Op Margin ({latestMonthLabel})</div>
          <div className="kpi-val">{latestPL ? latestPL.nopm.toFixed(1) + '%' : '35.0%'}</div>
          <div className="kpi-sub">
            Target &gt;25%
            <span className={(latestPL?.nopm ?? 35) >= 25 ? 'up' : 'dn'} style={{ marginLeft: 5 }}>
              {((latestPL?.nopm ?? 35) - 25).toFixed(1)}pp {(latestPL?.nopm ?? 35) >= 25 ? 'above' : 'below'}
            </span>
          </div>
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
          <div className="ph"><span className="pt">Margin Trend</span><span className="pg">{marginSource.length > 0 ? `${marginSource[0].month}–${marginSource[marginSource.length - 1].month}` : 'Jul–Nov 2025'}</span></div>
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
        <div className="ph">
          <span className="pt">GP / NOP Monthly Actuals</span>
          <span className="pg">{marginSource.length > 0 ? `${marginSource[0].month}–${marginSource[marginSource.length - 1].month}` : 'Jul–Nov 2025'}</span>
        </div>
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
              {marginSource.map(m => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td className="r">{fmt(m.revenue)}</td>
                  <td className="r">{fmt(m.gross_profit)}</td>
                  <td className="r"><span className={m.gpm >= 45 ? 'up' : m.gpm >= 30 ? 'warn' : 'dn'}>{m.gpm.toFixed(1)}%</span></td>
                  <td className="r">{m.net_op_profit != null ? fmt(m.net_op_profit) : '—'}</td>
                  <td className="r"><span className={(m.nopm ?? 0) >= 25 ? 'up' : (m.nopm ?? 0) >= 0 ? 'warn' : 'dn'}>{m.nopm != null ? m.nopm.toFixed(1) + '%' : '—'}</span></td>
                </tr>
              ))}
              {livePL.length === 0 && (
                <tr style={{ background: 'rgba(192,57,43,0.07)' }}>
                  <td colSpan={6} style={{ color: RLT, fontSize: 11, fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                    ⚠ Dec 2025 – Mar 2026: GP/NOP data not yet extracted from Xero. Run sync_xero.py to fill this gap.
                  </td>
                </tr>
              )}
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
                {dedupedCategories.map(c => (
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
          <div className="kpi-lbl">Cash {latestExec ? `(${latestExec.month})` : ''}</div>
          <div className="kpi-val">{latestExec?.cash != null ? `$${(latestExec.cash / 1000).toFixed(0)}K` : '$576K'}</div>
          <div className="kpi-sub">{latestExec ? 'live from Xero' : 'Static — run sync_xero.py'}</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Receivables {latestExec ? `(${latestExec.month})` : ''}</div>
          <div className="kpi-val">{latestExec?.receivables != null ? fmt(latestExec.receivables) : '—'}</div>
          <div className="kpi-sub">{latestExec ? 'live from Xero' : 'Not yet synced'}</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Working Capital {latestExec ? `(${latestExec.month})` : ''}</div>
          <div className="kpi-val">{latestExec?.working_capital != null ? `$${(latestExec.working_capital / 1000).toFixed(0)}K` : '—'}</div>
          <div className="kpi-sub">{latestExec ? 'live from Xero' : 'Not yet synced'}</div>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph">
            <span className="pt">Cash &amp; Working Capital Trend</span>
            {execData.length > 0 && <span className="pg">{execData[0].month}–{execData[execData.length - 1].month}</span>}
          </div>
          <div className="pb">
            {execData.length > 0 ? (
              <div className="chart-h200"><Line data={cashChartData} options={cashChartOpts} /></div>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12 }}>
                No cash data — run <code style={{ marginLeft: 4 }}>python scripts/sync_xero.py</code>
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="ph">
            <span className="pt">Overdue Invoices</span>
            {arInvoices.length > 0 && (
              <span className="pg" style={{ color: RLT }}>{fmt(overdueTotal)} overdue</span>
            )}
          </div>
          <div className="pb">
            {arInvoices.length === 0 ? (
              <div style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>No overdue invoices — run sync to populate.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th className="r">Amount</th>
                    <th className="r">Days OD</th>
                    <th className="r">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {arInvoices.map(inv => (
                    <tr key={inv.invoice_id}>
                      <td style={{ fontSize: 11, color: '#888' }}>{inv.invoice_number}</td>
                      <td>{inv.contact_name}</td>
                      <td className="r">{fmt(inv.amount_due)}</td>
                      <td className="r">
                        <span className={inv.days_overdue > 30 ? 'dn' : 'warn'}>{inv.days_overdue}d</span>
                      </td>
                      <td className="r" style={{ fontSize: 11, color: '#888' }}>{inv.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
