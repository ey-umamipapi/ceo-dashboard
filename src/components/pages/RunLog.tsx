'use client'

import { DashboardData } from '@/types'

function formatSyncTime(syncMetadata: { source: string; last_sync_at: string }[] | undefined, source: string): string {
  if (!syncMetadata?.length) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta?.last_sync_at) return 'Not synced'
  return new Date(meta.last_sync_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const GRN = '#27AE60', ORG = '#E67E22'

export default function RunLog({ data }: { data: DashboardData }) {
  const prodRuns    = data.prodRuns ?? []
  const prodMonthly = data.prodMonthly ?? []

  return (
    <div className="page">
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* Production Run Log */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Production Run Log</span>
          <span className="pg">Most recent first · {prodRuns.length} runs</span>
        </div>
        <div className="pb">
          {prodRuns.length === 0 ? (
            <div style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>No run data — run sync to populate from MasterPapi.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="r">Staff</th>
                  <th className="r">Hours</th>
                  <th>SKUs Produced</th>
                  <th className="r">Total Tins</th>
                  <th className="r">Tins/Hr</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {prodRuns.map(r => {
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
                      <td style={{ fontSize: 11, color: 'var(--mid)' }}>{r.comments ?? ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Monthly Production Summary */}
      <div className="panel">
        <div className="ph"><span className="pt">Monthly Production Summary</span></div>
        <div className="pb">
          {prodMonthly.length === 0 ? (
            <div style={{ color: '#555', fontSize: 12, padding: '8px 0' }}>No data — run sync to populate.</div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
