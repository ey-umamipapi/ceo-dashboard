'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { PROD_PROD, DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const SKU_COLORS: Record<string, string> = {
  'OG Large': RED,
  'ES Large': BLU,
  'Chilli Egg Mayo': ORG,
  'Hot Honey': '#F39C12',
  'PERi Crackle 1KG': PRP,
}

const PROD_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

interface Props {
  data: DashboardData
  filterSkus: string[]
}

export default function ProductionDetail({ data, filterSkus }: Props) {
  const prodWeekly = data.prodWeekly ?? []
  const prodMonthly = data.prodMonthly ?? []
  const prodSku = data.prodSku ?? []

  // Filter SKU data
  const filteredSkus = filterSkus.length > 0
    ? PROD_PROD.filter(p => filterSkus.includes(p.p))
    : PROD_PROD

  // Weekly efficiency chart: Units/10, UPH, Staff×10
  const weeklyLabels = prodWeekly.map(w => w.week_label)
  const effChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Units ÷10',
        data: prodWeekly.map(w => Math.round((w.units ?? 0) / 10)),
        borderColor: RED,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: RED,
      },
      {
        label: 'UPH',
        data: prodWeekly.map(w => w.uph ?? 0),
        borderColor: GRN,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: GRN,
      },
      {
        label: 'Staff ×10',
        data: prodWeekly.map(w => (w.staff ?? 0) * 10),
        borderColor: BLU,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: BLU,
        borderDash: [3, 2],
      },
    ],
  }

  const effOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 10, padding: 8 } },
      tooltip: {},
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
    },
  }

  // SKU Mix donut (from prodSku or PROD_PROD totals)
  const skuTotals = filteredSkus.map(p => ({
    label: p.p,
    total: p.ytd,
    color: SKU_COLORS[p.p] ?? '#888',
  }))
  const grandTotal = skuTotals.reduce((s, p) => s + p.total, 0)

  const donutData = {
    labels: skuTotals.map(s => s.label),
    datasets: [{
      data: skuTotals.map(s => s.total),
      backgroundColor: skuTotals.map(s => s.color),
      borderWidth: 0,
    }],
  }
  const donutOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw?.toLocaleString()}` } },
    },
  }

  // SKU by Month stacked bar
  const skuByMonthData = {
    labels: PROD_MONTHS,
    datasets: filteredSkus.map(p => ({
      label: p.p,
      data: PROD_MONTHS.map(mo => (p as any)[mo] ?? 0),
      backgroundColor: SKU_COLORS[p.p] ?? '#888',
      stack: 'sku',
      borderRadius: 2,
    })),
  }

  const skuByMonthOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 9, padding: 6 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw?.toLocaleString()}` } },
    },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
      </div>

      {/* Weekly Efficiency Chart */}
      {prodWeekly.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph">
            <span className="pt">Weekly Efficiency</span>
            <span className="pg">Units ÷10 / UPH / Staff ×10</span>
          </div>
          <div className="pb">
            <div className="chart-h240"><Line data={effChartData} options={effOpts} /></div>
          </div>
        </div>
      )}

      {/* g-1-2: SKU Mix + SKU by Month */}
      <div className="g-1-2">
        <div className="panel">
          <div className="ph"><span className="pt">SKU Mix</span><span className="pg">YTD {grandTotal.toLocaleString()} units</span></div>
          <div className="pb">
            <div className="chart-h200"><Doughnut data={donutData} options={donutOpts} /></div>
            <div style={{ marginTop: 10 }}>
              {skuTotals.map(s => (
                <div key={s.label} className="cat-row">
                  <span className="cat-name">{s.label}</span>
                  <div className="cat-bg">
                    <div className="cat-fill" style={{ width: `${grandTotal > 0 ? (s.total / grandTotal * 100) : 0}%`, background: s.color }} />
                  </div>
                  <span className="cat-n">{grandTotal > 0 ? (s.total / grandTotal * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">SKU by Month</span></div>
          <div className="pb">
            <div className="chart-h300"><Bar data={skuByMonthData} options={skuByMonthOpts} /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
