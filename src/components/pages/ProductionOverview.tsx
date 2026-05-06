'use client'

import { DashboardData } from '@/types'

function formatSyncTime(syncMetadata: { source: string; last_sync_at: string }[] | undefined, source: string): string {
  if (!syncMetadata?.length) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta?.last_sync_at) return 'Not synced'
  return new Date(meta.last_sync_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const GRN = '#27AE60', ORG = '#E67E22'

const FALLBACK_INVENTORY = [
  { sku: 'OG Large',          available: 4210,  status: 'ok' },
  { sku: 'ES Large',          available: 152,   status: 'critical' },
  { sku: 'ES Jumbo',          available: 70,    status: 'critical' },
  { sku: 'OG Jumbo',          available: 55,    status: 'critical' },
  { sku: 'Chilli Egg Mayo',   available: 17185, status: 'watch' },
  { sku: 'Hot Honey',         available: 2100,  status: 'ok' },
  { sku: 'PERi Crackle 1KG',  available: 890,   status: 'ok' },
]

export default function ProductionOverview({ data }: { data: DashboardData }) {
  const prodMonthly   = data.prodMonthly ?? []
  const prodRuns      = data.prodRuns ?? []
  const prodEfficiency= data.prodEfficiency ?? []
  const prodSchedule  = data.prodSchedule ?? []

  const inventoryItems = data.inventorySnapshot?.length
    ? data.inventorySnapshot.map(s => ({ sku: s.sku, available: s.available, status: s.status.toLowerCase() }))
    : FALLBACK_INVENTORY

  function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const today    = new Date()
  const todayStr = localDateStr(today)
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay() + 1)
  const weekEnd   = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)
  const weekSchedule = prodSchedule.filter(r => r.run_date >= localDateStr(weekStart) && r.run_date <= localDateStr(weekEnd))

  const latestProd = [...prodMonthly].reverse().find(p => (p.uph ?? 0) > 0)
  const uphVal     = latestProd?.uph ?? 0
  const latestRun  = prodRuns[0]
  const latestTph  = latestRun?.tins_per_hour ?? 0
  const totalTinsYtd = prodEfficiency.reduce((s, e) => s + (e.total_tins ?? 0), 0)
  const latestEff    = [...prodEfficiency].reverse().find(e => (e.total_tins ?? 0) > 0)

  return (
    <div className="page">
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

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
          <div className="kpi-lbl">Staff (Latest Run)</div>
          <div className="kpi-val">{latestRun?.staff ?? '—'}</div>
          <div className="kpi-sub">{latestRun ? new Date(latestRun.run_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}</div>
        </div>
      </div>

      {/* This Week's Schedule */}
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
                <tr><th>Day</th><th>Date</th><th>SKUs Planned</th><th className="r">Staff</th><th className="r">Hours</th></tr>
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

      {/* Inventory Snapshot */}
      <div className="panel">
        <div className="ph"><span className="pt">Inventory Available</span><span className="pg">Current snapshot</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr><th>SKU</th><th className="r">Jars Available</th><th className="c">Status</th></tr>
            </thead>
            <tbody>
              {inventoryItems.map(item => (
                <tr key={item.sku}>
                  <td>{item.sku}</td>
                  <td className="r">{item.available.toLocaleString()}</td>
                  <td className="c">
                    {item.status === 'critical' && <span className="tag tag-red">Critical</span>}
                    {item.status === 'watch'    && <span className="tag tag-orange">Watch</span>}
                    {item.status === 'ok'       && <span className="tag tag-green">OK</span>}
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
