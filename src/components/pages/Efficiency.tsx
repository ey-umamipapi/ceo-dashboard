'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { PROD_PROD } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

function formatSyncTime(syncMetadata: { source: string; last_sync_at: string }[] | undefined, source: string): string {
  if (!syncMetadata?.length) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta?.last_sync_at) return 'Not synced'
  return new Date(meta.last_sync_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DL  = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const SKU_COLORS: Record<string, string> = {
  'OG Large':         RED,
  'ES Large':         BLU,
  'Chilli Egg Mayo':  ORG,
  'Hot Honey':        '#F39C12',
  'PERi Crackle 1KG': PRP,
}

const PROD_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']

export default function Efficiency({ data }: { data: DashboardData }) {
  const prodMonthly   = data.prodMonthly ?? []
  const prodWeekly    = data.prodWeekly ?? []
  const prodRuns      = data.prodRuns ?? []
  const prodEfficiency= data.prodEfficiency ?? []
  const prodSku       = data.prodSku ?? []

  // ── UPH Monthly ──────────────────────────────────────────────────────────
  const uphMonths = prodMonthly.filter(p => (p.uph ?? 0) > 0)
  const uphData: any = {
    labels: uphMonths.map(p => p.month?.slice(0,3) ?? ''),
    datasets: [
      {
        label: 'UPH',
        data: uphMonths.map(p => p.uph),
        backgroundColor: uphMonths.map(p => (p.uph ?? 0) >= 190 ? GRN : ORG),
        borderRadius: 3,
        order: 2,
      },
      {
        label: 'Target 190',
        data: uphMonths.map(() => 190),
        type: 'line' as const,
        borderColor: '#555',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        order: 1,
      },
    ],
  }
  const uphOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}` } },
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } }, min: 140, suggestedMax: 220 },
    },
  }

  // ── Tins/Hr Trend (last 30 runs) ─────────────────────────────────────────
  const tphRuns = [...prodRuns].sort((a,b) => a.run_date.localeCompare(b.run_date)).slice(-30)
  const tphValues = tphRuns.map(r => r.tins_per_hour)
  const tphData = {
    labels: tphRuns.map(r => new Date(r.run_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Tins/Hr',
        data: tphValues,
        borderColor: ORG, backgroundColor: ORG + '20',
        tension: 0.3, fill: true, pointRadius: 3,
        pointBackgroundColor: tphValues.map(v => v >= 150 ? GRN : ORG),
      },
      { label: 'Benchmark', data: tphRuns.map(() => 150), borderColor: '#555', borderDash: [4,4], pointRadius: 0, fill: false, tension: 0 },
    ],
  }
  const tphOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 10 } } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)}` } },
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } }, min: 80, suggestedMax: 200 },
    },
  }

  // ── Monthly Tins by Channel ───────────────────────────────────────────────
  const tinsData = {
    labels: prodEfficiency.map(e => e.month),
    datasets: [
      { label: 'Coles',   data: prodEfficiency.map(e => e.coles_tins   ?? 0), backgroundColor: RED + 'cc', borderRadius: 2, stack: 'ch' },
      { label: 'Distrbn', data: prodEfficiency.map(e => e.distrbn_tins ?? 0), backgroundColor: BLU + 'cc', borderRadius: 2, stack: 'ch' },
      { label: 'Nandos',  data: prodEfficiency.map(e => e.nandos_tins  ?? 0), backgroundColor: PRP + 'cc', borderRadius: 2, stack: 'ch' },
      { label: 'Direct',  data: prodEfficiency.map(e => e.direct_tins  ?? 0), backgroundColor: GRN + 'cc', borderRadius: 2, stack: 'ch' },
      { label: 'Wsale',   data: prodEfficiency.map(e => e.wsale_tins   ?? 0), backgroundColor: ORG + 'cc', borderRadius: 2, stack: 'ch' },
      { label: 'Fserv',   data: prodEfficiency.map(e => e.fserv_tins   ?? 0), backgroundColor: '#888cc',   borderRadius: 2, stack: 'ch' },
    ],
  }
  const tinsOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toLocaleString()}` } },
    },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: any) => v.toLocaleString() } },
    },
  }

  // ── Weekly Efficiency ─────────────────────────────────────────────────────
  const effChartData = {
    labels: prodWeekly.map(w => w.week_label),
    datasets: [
      { label: 'Units ÷10', data: prodWeekly.map(w => Math.round((w.units ?? 0) / 10)), borderColor: RED, backgroundColor: 'transparent', tension: 0.3, pointRadius: 2, pointBackgroundColor: RED },
      { label: 'UPH',       data: prodWeekly.map(w => w.uph ?? 0),                      borderColor: GRN, backgroundColor: 'transparent', tension: 0.3, pointRadius: 2, pointBackgroundColor: GRN },
      { label: 'Staff ×10', data: prodWeekly.map(w => (w.staff ?? 0) * 10),             borderColor: BLU, backgroundColor: 'transparent', tension: 0.3, pointRadius: 2, pointBackgroundColor: BLU, borderDash: [3,2] },
    ],
  }
  const effOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 10, padding: 8 } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
    },
  }

  // ── SKU Mix ───────────────────────────────────────────────────────────────
  const skuTotals = prodSku.length > 0
    ? prodSku.map(s => ({ label: s.sku, total: s.units ?? 0, color: SKU_COLORS[s.sku] ?? '#888' }))
    : PROD_PROD.map(p => ({ label: p.p, total: p.ytd, color: SKU_COLORS[p.p] ?? '#888' }))
  const grandTotal = skuTotals.reduce((s, p) => s + p.total, 0)
  const donutData = {
    labels: skuTotals.map(s => s.label),
    datasets: [{ data: skuTotals.map(s => s.total), backgroundColor: skuTotals.map(s => s.color), borderWidth: 0 }],
  }
  const donutOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw?.toLocaleString()}` } } },
  }

  // ── SKU by Month ──────────────────────────────────────────────────────────
  const skuByMonthData = {
    labels: PROD_MONTHS,
    datasets: PROD_PROD.map(p => ({
      label: p.p,
      data: PROD_MONTHS.map(mo => (p as any)[mo] ?? 0),
      backgroundColor: SKU_COLORS[p.p] ?? '#888',
      stack: 'sku', borderRadius: 2,
    })),
  }
  const skuByMonthOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toLocaleString()}` } } },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
    },
  }

  return (
    <div className="page">
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* UPH Monthly + Diagnosis */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">UPH Monthly</span><span className="pg">190 benchmark</span></div>
          <div className="pb">
            <div className="chart-h200"><Bar data={uphData} options={uphOpts} /></div>
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
              <p style={{ marginBottom: 10 }}><strong>Structural UPH drag:</strong> WHS unlicensed operators create stop-start risk. Any injury event = production halt.</p>
              <p style={{ marginBottom: 10 }}><strong>SKU complexity:</strong> Running 5 SKUs on a single line increases changeover time. Larger runs (OG Large) drive higher UPH naturally.</p>
              <p style={{ marginBottom: 10 }}><strong>Staffing floor:</strong> 5.3 avg staff on floor — at or below optimal. Any absence = UPH impact.</p>
              <p><strong style={{ color: '#F39C12' }}>Priority:</strong> Close forklift licence. Lock ES/Jumbo restock. Protect Mar→Apr production continuity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tins/Hr Trend */}
      {tphRuns.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Tins/Hour Trend</span><span className="pg">Last {tphRuns.length} runs · benchmark 150</span></div>
          <div className="pb"><div className="chart-h200"><Line data={tphData} options={tphOpts} /></div></div>
        </div>
      )}

      {/* Weekly Efficiency */}
      {prodWeekly.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Weekly Efficiency</span><span className="pg">Units ÷10 / UPH / Staff ×10</span></div>
          <div className="pb"><div className="chart-h240"><Line data={effChartData} options={effOpts} /></div></div>
        </div>
      )}

      {/* Monthly Tins by Channel */}
      {prodEfficiency.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Monthly Production Tins by Channel</span><span className="pg">Source: Production Summary</span></div>
          <div className="pb">
            <div className="chart-h240"><Bar data={tinsData} options={tinsOpts} /></div>
            <div style={{ marginTop: 8 }}>
              <table className="tbl">
                <thead><tr><th>Month</th><th className="r">Total</th><th className="r">Coles</th><th className="r">Distrbn</th><th className="r">Nandos</th><th className="r">Direct</th><th className="r">Wsale</th></tr></thead>
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

      {/* SKU Mix + SKU by Month */}
      <div className="g-1-2">
        <div className="panel">
          <div className="ph"><span className="pt">SKU Mix</span><span className="pg">{prodSku.length > 0 ? 'Live' : 'Static'} · {grandTotal.toLocaleString()} units</span></div>
          <div className="pb">
            <div className="chart-h200"><Doughnut data={donutData} options={donutOpts} /></div>
            <div style={{ marginTop: 10 }}>
              {skuTotals.map(s => (
                <div key={s.label} className="cat-row">
                  <span className="cat-name">{s.label}</span>
                  <div className="cat-bg"><div className="cat-fill" style={{ width: `${grandTotal > 0 ? (s.total/grandTotal*100) : 0}%`, background: s.color }} /></div>
                  <span className="cat-n">{grandTotal > 0 ? (s.total/grandTotal*100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">SKU by Month</span><span className="pg">Static data</span></div>
          <div className="pb"><div className="chart-h300"><Bar data={skuByMonthData} options={skuByMonthOpts} /></div></div>
        </div>
      </div>
    </div>
  )
}
