'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { DashboardData } from '@/types'

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

const INVENTORY = [
  { sku: 'OG Large', available: 4210, status: 'ok' },
  { sku: 'ES Large', available: 152, status: 'critical' },
  { sku: 'ES Jumbo', available: 70, status: 'critical' },
  { sku: 'OG Jumbo', available: 55, status: 'critical' },
  { sku: 'Chilli Egg Mayo', available: 17185, status: 'watch' },
  { sku: 'Hot Honey', available: 2100, status: 'ok' },
  { sku: 'PERi Crackle 1KG', available: 890, status: 'ok' },
]

export default function Operations({ data }: { data: DashboardData }) {
  const prodMonthly = data.prodMonthly ?? []

  // Inventory: prefer live data from Supabase, fall back to hardcoded
  const inventoryItems = data.inventorySnapshot?.length
    ? data.inventorySnapshot.map(s => ({ sku: s.sku, available: s.available, status: s.status.toLowerCase() }))
    : INVENTORY
  const prodRuns = data.prodRuns ?? []
  const prodEfficiency = data.prodEfficiency ?? []
  const prodSchedule = data.prodSchedule ?? []

  // This week Mon–Fri schedule — use local date string to avoid UTC offset issues
  const today = new Date()
  function localDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const todayStr = localDateStr(today)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1) // Mon
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // Sun
  const weekSchedule = prodSchedule.filter(r => r.run_date >= localDateStr(weekStart) && r.run_date <= localDateStr(weekEnd))

  const latestProd = [...prodMonthly].reverse().find(p => (p.uph ?? 0) > 0)
  const uphVal = latestProd?.uph ?? 0

  // Units Jan-Mar
  const janMarUnits = prodMonthly
    .filter(p => ['Jan', 'Feb', 'Mar'].some(m => p.month?.startsWith(m)))
    .reduce((s, p) => s + (p.units ?? 0), 0)

  // Production days
  const totalDays = prodMonthly.reduce((s, p) => s + (p.days ?? 0), 0)

  // Latest run tins/hr
  const latestRun = prodRuns[0]
  const latestTph = latestRun?.tins_per_hour ?? 0

  // UPH chart
  const uphMonths = prodMonthly.filter(p => (p.uph ?? 0) > 0)
  const uphData = {
    labels: uphMonths.map(p => p.month?.slice(0, 3) ?? ''),
    datasets: [
      {
        label: 'UPH',
        data: uphMonths.map(p => p.uph),
        backgroundColor: uphMonths.map(p => (p.uph ?? 0) >= 190 ? GRN : ORG),
        borderRadius: 3,
      },
    ],
  }

  const UPH_BENCHMARK = 190
  const uphOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` UPH: ${ctx.raw?.toFixed(1)}` } },
      annotation: undefined,
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: {
        grid: { color: DL },
        ticks: { color: '#666', font: { size: 10 } },
        min: 140,
        suggestedMax: 220,
      },
    },
  }

  // T2-2: Tins/Hour trend (last 30 runs, ascending)
  const tphRuns = [...prodRuns].sort((a, b) => a.run_date.localeCompare(b.run_date)).slice(-30)
  const tphLabels = tphRuns.map(r => {
    const d = new Date(r.run_date)
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  })
  const tphValues = tphRuns.map(r => r.tins_per_hour)
  const tphData = {
    labels: tphLabels,
    datasets: [
      {
        label: 'Tins/Hr',
        data: tphValues,
        borderColor: ORG,
        backgroundColor: ORG + '20',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: tphValues.map(v => v >= 150 ? GRN : ORG),
      },
      {
        label: 'Benchmark',
        data: tphRuns.map(() => 150),
        borderColor: '#555',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  }
  const tphOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 10 } } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}` } },
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
      y: {
        grid: { color: DL },
        ticks: { color: '#666', font: { size: 10 } },
        min: 80,
        suggestedMax: 200,
      },
    },
  }

  // Monthly tins by channel (from Production Summary via prod_efficiency)
  const tinsData = {
    labels: prodEfficiency.map(e => e.month),
    datasets: [
      { label: 'Coles',   data: prodEfficiency.map(e => e.coles_tins ?? 0),   backgroundColor: RED + 'cc',  borderRadius: 2, stack: 'ch' },
      { label: 'Distrbn', data: prodEfficiency.map(e => e.distrbn_tins ?? 0), backgroundColor: BLU + 'cc',  borderRadius: 2, stack: 'ch' },
      { label: 'Nandos',  data: prodEfficiency.map(e => e.nandos_tins ?? 0),  backgroundColor: PRP + 'cc',  borderRadius: 2, stack: 'ch' },
      { label: 'Direct',  data: prodEfficiency.map(e => e.direct_tins ?? 0),  backgroundColor: GRN + 'cc',  borderRadius: 2, stack: 'ch' },
      { label: 'Wsale',   data: prodEfficiency.map(e => e.wsale_tins ?? 0),   backgroundColor: ORG + 'cc',  borderRadius: 2, stack: 'ch' },
      { label: 'Fserv',   data: prodEfficiency.map(e => e.fserv_tins ?? 0),   backgroundColor: '#888' + 'cc', borderRadius: 2, stack: 'ch' },
    ],
  }
  const tinsOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toLocaleString()}` } },
    },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: any) => v.toLocaleString() } },
    },
  }

  // YTD tins total and last month
  const totalTinsYtd = prodEfficiency.reduce((s, e) => s + (e.total_tins ?? 0), 0)
  const latestEff = [...prodEfficiency].reverse().find(e => (e.total_tins ?? 0) > 0)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{formatSyncTime(data.syncMetadata, 'financial')}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Operations Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Forklift operators unlicensed since Jan 2025 — WHS liability. Not closed. Each production day this runs is unmitigated liability.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>ES Large: 152 jars available. ES Jumbo: 70 jars. OG Jumbo: 55 jars. Three SKUs at critically low levels.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Jan UPH 201.3 — above 190 benchmark. Wk03 hit 200.8.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Resolve forklift licence issue this week — assign to MT with EOW deadline.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Confirm ES Large + Jumbo restock timeline from Mark by EOW.</span></div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className={`kpi ${uphVal >= 190 ? 'green' : 'orange'}`}>
          <div className="kpi-lbl">Latest UPH</div>
          <div className="kpi-val">{uphVal > 0 ? uphVal.toFixed(1) : '—'}</div>
          <div className="kpi-sub">{latestProd?.month ?? '—'} · benchmark 190</div>
        </div>
        <div className={`kpi ${latestTph >= 150 ? 'green' : latestTph > 0 ? 'orange' : ''}`}>
          <div className="kpi-lbl">Latest Run Tins/Hr</div>
          <div className="kpi-val">{latestTph > 0 ? latestTph.toFixed(1) : '—'}</div>
          <div className="kpi-sub">{latestRun ? new Date(latestRun.run_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Total Tins YTD</div>
          <div className="kpi-val">{totalTinsYtd > 0 ? totalTinsYtd.toLocaleString() : '—'}</div>
          <div className="kpi-sub">{latestEff?.month ?? '—'} latest month</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Units Jan–Mar</div>
          <div className="kpi-val">{janMarUnits.toLocaleString()}</div>
          <div className="kpi-sub">3-month total</div>
        </div>
      </div>

      {/* UPH Chart + Diagnosis */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">UPH Monthly</span><span className="pg">190 benchmark</span></div>
          <div className="pb">
            <div className="chart-h200">
              <Bar data={uphData} options={uphOpts} />
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--mid)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#F39C12', verticalAlign: 'middle' }} />
              Benchmark: 190 UPH
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Issue Pattern Diagnosis</span></div>
          <div className="pb">
            <div style={{ fontSize: 12, color: 'var(--creme)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>Structural UPH drag:</strong> WHS unlicensed operators create stop-start risk. Any injury event = production halt.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>SKU complexity:</strong> Running 5 SKUs on a single line increases changeover time. Larger runs (OG Large) drive higher UPH naturally.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>Staffing floor:</strong> 5.3 avg staff on floor — at or below optimal. Any absence = UPH impact.</p>
              <p><strong style={{ color: '#F39C12' }}>Priority:</strong> Close forklift licence. Lock ES/Jumbo restock. Protect Mar→Apr production continuity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* T2-2: Tins/Hour Trend */}
      {tphRuns.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph">
            <span className="pt">Tins/Hour Trend</span>
            <span className="pg">Last {tphRuns.length} runs · benchmark 150</span>
          </div>
          <div className="pb">
            <div className="chart-h200">
              <Line data={tphData} options={tphOpts} />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Tins by Channel */}
      {prodEfficiency.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph">
            <span className="pt">Monthly Production Tins by Channel</span>
            <span className="pg">Source: Production Summary</span>
          </div>
          <div className="pb">
            <div className="chart-h240">
              <Bar data={tinsData} options={tinsOpts} />
            </div>
            <div style={{ marginTop: 8 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="r">Total</th>
                    <th className="r">Coles</th>
                    <th className="r">Distrbn</th>
                    <th className="r">Nandos</th>
                    <th className="r">Direct</th>
                    <th className="r">Wsale</th>
                  </tr>
                </thead>
                <tbody>
                  {prodEfficiency.map(e => (
                    <tr key={e.month}>
                      <td>{e.month}</td>
                      <td className="r" style={{ fontWeight: 600 }}>{(e.total_tins ?? 0).toLocaleString()}</td>
                      <td className="r">{(e.coles_tins ?? 0).toLocaleString()}</td>
                      <td className="r">{(e.distrbn_tins ?? 0).toLocaleString()}</td>
                      <td className="r">{(e.nandos_tins ?? 0).toLocaleString()}</td>
                      <td className="r">{(e.direct_tins ?? 0).toLocaleString()}</td>
                      <td className="r">{(e.wsale_tins ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Production Run Log */}
      {prodRuns.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Production Run Log</span><span className="pg">Most recent first</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="r">Staff</th>
                  <th className="r">Hours</th>
                  <th>SKUs Produced</th>
                  <th className="r">Total Tins</th>
                  <th className="r">Tins/Hr</th>
                </tr>
              </thead>
              <tbody>
                {prodRuns.slice(0, 20).map(r => {
                  const skus = [
                    r.sku1 && r.sku1_tins ? `${r.sku1} ×${r.sku1_tins}` : null,
                    r.sku2 && r.sku2_tins ? `${r.sku2} ×${r.sku2_tins}` : null,
                    r.sku3 && r.sku3_tins ? `${r.sku3} ×${r.sku3_tins}` : null,
                    r.sku4 && r.sku4_tins ? `${r.sku4} ×${r.sku4_tins}` : null,
                  ].filter(Boolean).join(', ')
                  const tph = r.tins_per_hour
                  return (
                    <tr key={r.run_date}>
                      <td>{new Date(r.run_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td className="r">{r.staff}</td>
                      <td className="r">{r.hours_worked.toFixed(1)}</td>
                      <td style={{ fontSize: 11 }}>{skus || '—'}</td>
                      <td className="r">{r.total_tins.toLocaleString()}</td>
                      <td className="r">
                        <span style={{ color: tph >= 150 ? GRN : tph > 0 ? ORG : 'var(--mid)' }}>
                          {tph > 0 ? tph.toFixed(1) : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Production Summary Table */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Production Summary</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">Units</th>
                <th className="r">Hours</th>
                <th className="r">Days</th>
                <th className="r">Staff</th>
                <th className="r">UPH</th>
              </tr>
            </thead>
            <tbody>
              {prodMonthly.map(p => (
                <tr key={p.month}>
                  <td>{p.month}</td>
                  <td className="r">{(p.units ?? 0).toLocaleString()}</td>
                  <td className="r">{p.hours ?? '—'}</td>
                  <td className="r">{p.days ?? '—'}</td>
                  <td className="r">{p.staff ?? '—'}</td>
                  <td className="r">
                    <span className={(p.uph ?? 0) >= 190 ? 'up' : (p.uph ?? 0) > 0 ? 'warn' : ''}>
                      {(p.uph ?? 0) > 0 ? (p.uph ?? 0).toFixed(1) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* This Week's Production Schedule */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">This Week's Production Schedule</span>
          <span className="pg">
            {weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – {weekEnd.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="pb">
          {weekSchedule.length === 0 ? (
            <div style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>No schedule data — run sync to populate from MasterPapi.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>SKUs Planned</th>
                  <th className="r">Staff</th>
                  <th className="r">Hours</th>
                </tr>
              </thead>
              <tbody>
                {weekSchedule.map(row => {
                  const isToday = row.run_date === todayStr
                  const skus = [row.sku1, row.sku2, row.sku3, row.sku4].filter(Boolean)
                  const dateObj = new Date(row.run_date + 'T00:00:00')
                  return (
                    <tr key={row.run_date} style={isToday ? { background: 'rgba(39,174,96,0.07)' } : {}}>
                      <td style={{ fontWeight: isToday ? 700 : 400, color: isToday ? GRN : 'var(--creme)' }}>
                        {row.day_name}{isToday ? ' ← today' : ''}
                      </td>
                      <td style={{ color: '#666', fontSize: 11 }}>{dateObj.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</td>
                      <td>{skus.join(', ')}</td>
                      <td className="r">{row.staff ?? '—'}</td>
                      <td className="r">{row.hours ? row.hours + 'h' : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="panel">
        <div className="ph"><span className="pt">Inventory Available</span><span className="pg">Current</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>SKU</th>
                <th className="r">Jars Available</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map(item => (
                <tr key={item.sku}>
                  <td>{item.sku}</td>
                  <td className="r">{item.available.toLocaleString()}</td>
                  <td className="c">
                    {item.status === 'critical' && <span className="tag tag-red">Critical</span>}
                    {item.status === 'watch' && <span className="tag tag-orange">Watch</span>}
                    {item.status === 'ok' && <span className="tag tag-green">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
