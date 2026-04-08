'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const KEY_PAGES = [
  { page: '/collections/chilli-oil', clicks: 1843, impr: 16200, ctr: 0.9, pos: 4.2, note: 'Critical — CTR broken' },
  { page: '/', clicks: 3210, impr: 28400, ctr: 11.3, pos: 2.1, note: 'Homepage — strong' },
  { page: '/products/chilli-oil-large', clicks: 920, impr: 8100, ctr: 11.4, pos: 3.4, note: 'Product page — OK' },
  { page: '/store-locator', clicks: 441, impr: 2200, ctr: 20.0, pos: 5.1, note: '+102.8% YoY' },
  { page: '/pages/about', clicks: 312, impr: 4100, ctr: 7.6, pos: 6.2, note: '' },
  { page: '/collections/cem', clicks: 18, impr: 1200, ctr: 1.5, pos: 14.3, note: 'Zero organic presence' },
]

// Fallback hardcoded data for initial load
const KEY_QUERIES_DEFAULT = [
  { query: 'umami papi chilli oil', clicks: 1240, impr: 3100, ctr: 40.0, pos: 1.2, yoy: '+32.7%' },
  { query: 'chilli oil australia', clicks: 287, impr: 18400, ctr: 1.6, pos: 8.4, yoy: '-8.2%' },
  { query: 'umami papi', clicks: 892, impr: 2400, ctr: 37.2, pos: 1.4, yoy: '+12.1%' },
  { query: 'store locator', clicks: 441, impr: 2200, ctr: 20.0, pos: 5.1, yoy: '+102.8%' },
  { query: 'best chilli oil', clicks: 94, impr: 7800, ctr: 1.2, pos: 11.2, yoy: '-48.0%' },
  { query: 'umami sauce buy', clicks: 42, impr: 3100, ctr: 1.4, pos: 9.8, yoy: '-7.0%' },
]

const YOY_DATA = {
  labels: ['Clicks', 'Impressions', 'Purchases'],
  fy26: [4210, 68400, 75],
  fy25: [4590, 74200, 71],
}

export default function SEO({ data }: { data: DashboardData }) {
  // Build KEY_QUERIES from seoSnapshots data
  const seoSnapshots = data.seoSnapshots ?? []
  const KEY_QUERIES = seoSnapshots.length > 0
    ? seoSnapshots.map(s => ({
        query: s.keyword,
        clicks: s.traffic ?? 0,
        impr: s.impressions ?? 0,
        ctr: s.ctr ?? 0,
        pos: s.ranking ?? 0,
        yoy: '+0%', // YoY would need historical data, defaulting to neutral
      }))
    : KEY_QUERIES_DEFAULT

  const yoyPct = YOY_DATA.fy26.map((v, i) => ((v - YOY_DATA.fy25[i]) / YOY_DATA.fy25[i] * 100))

  const barData = {
    labels: YOY_DATA.labels,
    datasets: [
      { label: 'FY26', data: YOY_DATA.fy26, backgroundColor: [RLT, RLT, GRN], borderRadius: 3 },
      { label: 'FY25', data: YOY_DATA.fy25, backgroundColor: ['#444', '#444', '#444'], borderRadius: 3 },
    ],
  }
  const barOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 10, padding: 8 } }, tooltip: {} },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">SEO Data</span><span>{DATA_UPDATED.seo}</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Google Search Console</span><span>Rolling 3 months</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">SEO Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>collections/chilli-oil: 16,200 impressions, 0.9% CTR — broken meta title/description is actively destroying conversion. This is the highest-traffic collection page.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Organic traffic -7% to -48% YoY across key commercial queries. "best chilli oil" down 48%.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>CEM (Chilli Egg Mayo) has zero meaningful organic presence — 18 clicks, pos 14.3. Not indexed properly.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Branded search mixed — "umami papi chilli oil" +32.7% but head terms declining.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>75 purchases +5.6% YoY despite -8.2% click decline — conversion quality improving.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>"umami papi chilli oil" +32.7% — brand awareness growing.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Store locator +102.8% YoY — Coles distribution driving offline search intent.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Assign collections/chilli-oil meta title + description rewrite to OP Digital. Due this week.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Do not resource recipe content — fix product pages first.</span></div>
        </div>
      </div>

      {/* Organic Traffic Status + Top Opportunity */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Organic Traffic Status</span><span className="pg">YoY comparison</span></div>
          <div className="pb">
            <div className="kpi-row cols-2" style={{ marginBottom: 14 }}>
              <div className="kpi red">
                <div className="kpi-lbl">Organic Clicks</div>
                <div className="kpi-val small">4,210</div>
                <div className="kpi-sub"><span className="dn">-8.2%</span> vs prior year</div>
              </div>
              <div className="kpi green">
                <div className="kpi-lbl">Purchases</div>
                <div className="kpi-val small">75</div>
                <div className="kpi-sub"><span className="up">+5.6%</span> YoY</div>
              </div>
            </div>
            <div className="chart-h160"><Bar data={barData} options={barOpts} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Top Commercial Opportunity</span></div>
          <div className="pb">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Primary: /collections/chilli-oil</div>
              <div className="kpi-row cols-3" style={{ marginBottom: 0 }}>
                <div className="kpi red" style={{ padding: '10px 12px' }}>
                  <div className="kpi-lbl">Impressions</div>
                  <div className="kpi-val small">16,200</div>
                </div>
                <div className="kpi red" style={{ padding: '10px 12px' }}>
                  <div className="kpi-lbl">CTR</div>
                  <div className="kpi-val small">0.9%</div>
                  <div className="kpi-sub">Benchmark: ~10%</div>
                </div>
                <div className="kpi" style={{ padding: '10px 12px' }}>
                  <div className="kpi-lbl">Avg Position</div>
                  <div className="kpi-val small">4.2</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--creme)', lineHeight: 1.6 }}>
                At 10% CTR this page would deliver ~1,600 clicks/month vs current 147. Fix is a meta title + description rewrite — 2 hours of work. Assign to OP Digital this week.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--grey3)', paddingTop: 10, marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Secondary: CEM indexing</div>
              <div style={{ fontSize: 12, color: 'var(--creme)', lineHeight: 1.6 }}>
                18 clicks, pos 14.3. Product exists, page exists — likely missing meta or schema markup. Audit + fix is a 1-hour task.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Pages + Key Queries */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Key Pages</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="r">Clicks</th>
                  <th className="r">CTR</th>
                  <th className="r">Pos</th>
                </tr>
              </thead>
              <tbody>
                {KEY_PAGES.map(p => (
                  <tr key={p.page}>
                    <td style={{ fontSize: 10, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.page}
                      {p.note && <div style={{ fontSize: 9, color: p.note.includes('Critical') ? RLT : p.note.includes('OK') ? GRN : 'var(--mid)' }}>{p.note}</div>}
                    </td>
                    <td className="r">{p.clicks.toLocaleString()}</td>
                    <td className="r"><span className={p.ctr >= 8 ? 'up' : p.ctr >= 3 ? 'warn' : 'dn'}>{p.ctr.toFixed(1)}%</span></td>
                    <td className="r">{p.pos.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Key Queries</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Query</th>
                  <th className="r">Clicks</th>
                  <th className="r">CTR</th>
                  <th className="r">YoY</th>
                </tr>
              </thead>
              <tbody>
                {KEY_QUERIES.map(q => (
                  <tr key={q.query}>
                    <td style={{ fontSize: 11 }}>{q.query}</td>
                    <td className="r">{q.clicks.toLocaleString()}</td>
                    <td className="r">{q.ctr.toFixed(1)}%</td>
                    <td className="r"><span className={q.yoy.startsWith('+') ? 'up' : 'dn'}>{q.yoy}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Content Gaps + Data Gaps */}
      <div className="g2">
        <div className="panel">
          <div className="ph"><span className="pt">Content Gaps</span></div>
          <div className="pb">
            <div className="flag-row">
              <div className="flag-item red"><span className="flag-icon">⚠</span><span>Product collection pages have no meta descriptions — all rely on default Shopify templates.</span></div>
              <div className="flag-item red"><span className="flag-icon">⚠</span><span>CEM has no dedicated SEO landing page. No targeted content for "chilli egg mayo" queries.</span></div>
              <div className="flag-item red"><span className="flag-icon">⚠</span><span>No schema markup (Product, BreadcrumbList, Organization) on key pages.</span></div>
              <div className="flag-item blue"><span className="flag-icon">→</span><span>Priority order: (1) Fix chilli-oil collection meta. (2) Fix CEM page. (3) Add schema. (4) Blog/recipe last.</span></div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Data Gaps</span></div>
          <div className="pb">
            <div className="flag-row">
              <div className="flag-item"><span className="flag-icon" style={{ color: 'var(--mid)' }}>·</span><span>Google Search Console data: 3-month rolling window only. No historical trend beyond 90 days.</span></div>
              <div className="flag-item"><span className="flag-icon" style={{ color: 'var(--mid)' }}>·</span><span>No keyword ranking tracker set up — position data is aggregate, not per-keyword trend.</span></div>
              <div className="flag-item"><span className="flag-icon" style={{ color: 'var(--mid)' }}>·</span><span>Organic vs paid attribution in Shopify analytics not split. Conversion data mixed.</span></div>
              <div className="flag-item blue"><span className="flag-icon">→</span><span>Set up Ahrefs or SEMrush rank tracking for top 20 target queries. Low cost, high signal.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
