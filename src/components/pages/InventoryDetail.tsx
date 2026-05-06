'use client'

import { useState, useCallback } from 'react'
import type { DashboardData, InventoryBatch, DailyMetric } from '@/types'

const PRODUCT_TYPES = [
  { value: 'OG_LRG',  label: 'OG Large',       prefix: 'OG-LRG' },
  { value: 'ES_LRG',  label: 'ES Large',        prefix: 'ES-LRG' },
  { value: 'OG_JBO',  label: 'OG Jumbo',        prefix: 'OG-JBO' },
  { value: 'ES_JBO',  label: 'ES Jumbo',        prefix: 'ES-JBO' },
  { value: 'CEM',     label: 'Chilli Egg Mayo',  prefix: 'CEM' },
  { value: 'OG_OTH',  label: 'OG Other',        prefix: 'OG-OTH' },
  { value: 'ES_OTH',  label: 'ES Other',        prefix: 'ES-OTH' },
  { value: 'OTH',     label: 'Other / Merch',   prefix: 'OTH' },
]

const PRODUCT_LABELS: Record<string, string> = Object.fromEntries(
  PRODUCT_TYPES.map(p => [p.value, p.label])
)

const PRODUCT_ORDER = ['OG_LRG','ES_LRG','CEM','OG_JBO','ES_JBO','OG_OTH','ES_OTH','OTH']

const SHELF_LIFE_MONTHS = 18

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatBatchDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}.${month}.${year}`
}

function generateBatchCode(productType: string, productionDate: string): string {
  const cfg = PRODUCT_TYPES.find(p => p.value === productType)
  if (!cfg || !productionDate) return ''
  const prodDate = new Date(productionDate)
  const expiryDate = addMonths(prodDate, SHELF_LIFE_MONTHS)
  return `${cfg.prefix}-${formatBatchDate(expiryDate)}`
}

function getExpiryDate(productionDate: string): string {
  if (!productionDate) return ''
  const d = addMonths(new Date(productionDate), SHELF_LIFE_MONTHS)
  return d.toISOString().split('T')[0]
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const ms = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(ms / 86400000)
}

function expiryColor(days: number | null): string {
  if (days === null) return '#555'
  if (days < 30)  return '#C0392B'
  if (days < 90)  return '#E67E22'
  if (days < 180) return '#F1C40F'
  return '#27AE60'
}

function BatchCard({ batch, onDelete }: { batch: InventoryBatch; onDelete: (code: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const days = daysUntil(batch.expiry_date)
  const color = expiryColor(days)

  async function handleDelete() {
    if (!confirm(`Remove batch ${batch.batch_code}?`)) return
    setDeleting(true)
    await fetch('/api/batches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_code: batch.batch_code }),
    })
    onDelete(batch.batch_code)
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--grey2)',
      borderRadius: 7,
      padding: '9px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--fg)', letterSpacing: '0.04em', flex: 1 }}>
        {batch.batch_code}
      </div>
      {batch.expiry_date && (
        <div style={{ fontSize: 11, color, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {days !== null && days > 0 ? `${days}d` : 'expired'}
          <span style={{ marginLeft: 6, color: '#444', fontWeight: 400 }}>
            {batch.expiry_date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1')}
          </span>
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Remove batch"
        style={{
          background: 'none',
          border: 'none',
          color: '#333',
          cursor: 'pointer',
          fontSize: 14,
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}

function AddBatchForm({ onAdded }: { onAdded: (batch: InventoryBatch) => void }) {
  const today = new Date().toISOString().split('T')[0]
  const [productType, setProductType] = useState('OG_LRG')
  const [productionDate, setProductionDate] = useState(today)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const batchCode = generateBatchCode(productType, productionDate)
  const expiryDate = getExpiryDate(productionDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!batchCode) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_code: batchCode, product_type: productType, expiry_date: expiryDate }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Failed to add batch')
    } else {
      setSuccess(`Added: ${batchCode}`)
      onAdded(json.batch)
      // Reset date to today but keep product type
      setProductionDate(today)
    }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    background: '#141414',
    border: '1px solid #252525',
    borderRadius: 6,
    padding: '9px 12px',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'VisbyRound', 'VisbyRound', sans-serif",
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#555',
    marginBottom: 6,
  }

  return (
    <div style={{
      background: '#121212',
      border: '1px solid #222',
      borderRadius: 10,
      padding: '20px 22px',
      marginBottom: 32,
    }}>
      <div style={{
        fontFamily: "'VisbyRound', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#fff',
        marginBottom: 18,
      }}>
        Add New Batch
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Product type */}
          <div style={{ flex: '0 0 180px' }}>
            <label style={labelStyle}>Product</label>
            <select
              value={productType}
              onChange={e => setProductType(e.target.value)}
              style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
            >
              {PRODUCT_TYPES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Production date */}
          <div style={{ flex: '0 0 160px' }}>
            <label style={labelStyle}>Production Date</label>
            <input
              type="date"
              value={productionDate}
              onChange={e => setProductionDate(e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>

          {/* Preview */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Batch Code (auto)</label>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 6,
              padding: '9px 12px',
              fontFamily: 'monospace',
              fontSize: 13,
              color: batchCode ? '#C0392B' : '#333',
              letterSpacing: '0.06em',
            }}>
              {batchCode || '—'}
            </div>
          </div>

          {/* Expiry preview */}
          <div style={{ flex: '0 0 120px' }}>
            <label style={labelStyle}>Best Before</label>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 6,
              padding: '9px 12px',
              fontSize: 12,
              color: '#555',
            }}>
              {expiryDate ? expiryDate.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1') : '—'}
            </div>
          </div>

          {/* Submit */}
          <div>
            <label style={{ ...labelStyle, opacity: 0 }}>Submit</label>
            <button
              type="submit"
              disabled={saving || !batchCode}
              style={{
                background: saving || !batchCode ? '#1a1a1a' : '#C0392B',
                color: saving || !batchCode ? '#333' : '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '9px 20px',
                fontFamily: "'VisbyRound', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: saving || !batchCode ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Adding…' : 'Add Batch'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#e8a090', fontFamily: "'VisbyRound', sans-serif" }}>
            ⚠ {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#27AE60', fontFamily: "'VisbyRound', sans-serif" }}>
            ✓ {success}
          </div>
        )}
      </form>
    </div>
  )
}

function DailyMetricsTable({ metrics }: { metrics: DailyMetric[] }) {
  const active = metrics.filter(m => (m.tins_produced ?? 0) > 0).slice(0, 30)
  if (!active.length) {
    return <div style={{ color: '#555', fontSize: 13 }}>No production data — run sync to load from MasterPapi.</div>
  }
  const maxTins = Math.max(...active.map(m => m.tins_produced ?? 0))
  const totalTins = active.reduce((s, m) => s + (m.tins_produced ?? 0), 0)
  const avgTins = Math.round(totalTins / active.length)

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total tins (last 30 prod days)', val: totalTins.toLocaleString() },
          { label: 'Avg per prod day', val: avgTins.toLocaleString() },
          { label: 'Best day', val: maxTins.toLocaleString() },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--grey2)', borderRadius: 8, padding: '12px 18px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>{val}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'VisbyRound', sans-serif", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: '#444', fontSize: 10, fontFamily: "'VisbyRound', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {['Date','Week','Tins Prod','Filled O/N','Filled Day','Jars O/N','Jars Day'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'right', borderBottom: '1px solid var(--grey2)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map(m => {
              const tins = m.tins_produced ?? 0
              return (
                <tr key={m.metric_date} style={{ borderBottom: '1px solid #161616' }}>
                  <td style={{ padding: '7px 10px', color: 'var(--mid)', textAlign: 'right', whiteSpace: 'nowrap', fontSize: 11 }}>
                    {m.metric_date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2')}
                  </td>
                  <td style={{ padding: '7px 10px', color: '#333', textAlign: 'right', fontSize: 10 }}>{m.week_label ?? ''}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div style={{ width: 50, height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${maxTins > 0 ? (tins / maxTins) * 100 : 0}%`, height: '100%', background: '#C0392B', borderRadius: 2 }} />
                      </div>
                      <span style={{ color: 'var(--fg)', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{tins.toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#555' }}>{m.tins_filled_overnight?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#555' }}>{m.tins_filled_day?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#555' }}>{m.jars_filled_overnight?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', color: '#555' }}>{m.jars_filled_day?.toLocaleString() ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: '#C0392B', bg: 'rgba(192,57,43,0.12)', label: 'Critical' },
  watch:    { color: '#E67E22', bg: 'rgba(230,126,34,0.10)', label: 'Watch' },
  ok:       { color: '#27AE60', bg: 'rgba(39,174,96,0.08)',  label: 'OK' },
}

const REORDER_POINTS: Record<string, number> = {
  'OG Large': 2000, 'ES Large': 500, 'Chilli Egg Mayo': 3000,
  'Hot Honey': 800, 'PERi Crackle 1KG': 400, 'ES Jumbo': 200, 'OG Jumbo': 200,
}

function SkuStockHealth({ items }: { items: { sku: string; available: number; status: string }[] }) {
  if (!items.length) return null
  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="ph">
        <span className="pt">SKU Stock Levels</span>
        <span className="pg">Current snapshot</span>
      </div>
      <div className="pb" style={{ padding: '0' }}>
        <table className="tbl" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th className="r">Available</th>
              <th className="r">Reorder Point</th>
              <th className="r">Days Supply</th>
              <th className="c">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.ok
              const reorder = REORDER_POINTS[item.sku]
              const belowReorder = reorder != null && item.available < reorder
              const daysSupply = reorder != null ? Math.round((item.available / reorder) * 30) : null
              return (
                <tr key={item.sku} style={{ background: belowReorder ? cfg.bg : undefined }}>
                  <td style={{ fontWeight: 600 }}>{item.sku}</td>
                  <td className="r" style={{ color: belowReorder ? cfg.color : 'var(--creme)', fontWeight: belowReorder ? 700 : 400 }}>
                    {item.available.toLocaleString()}
                  </td>
                  <td className="r" style={{ color: '#555', fontSize: 11 }}>{reorder != null ? reorder.toLocaleString() : '—'}</td>
                  <td className="r">
                    {daysSupply != null ? (
                      <span style={{ color: daysSupply < 14 ? '#C0392B' : daysSupply < 30 ? '#E67E22' : '#27AE60', fontWeight: 700 }}>
                        {daysSupply}d
                      </span>
                    ) : '—'}
                  </td>
                  <td className="c">
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: cfg.bg, color: cfg.color,
                      fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{cfg.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function InventoryDetail({ data }: { data: DashboardData }) {
  const [batches, setBatches] = useState<InventoryBatch[]>(data.inventoryBatches ?? [])
  const metrics = data.dailyMetrics ?? []

  const inventoryItems = data.inventorySnapshot?.length
    ? data.inventorySnapshot.map(s => ({ sku: s.sku, available: s.available, status: s.status.toLowerCase() }))
    : []

  const handleAdded = useCallback((batch: InventoryBatch) => {
    setBatches(prev => [batch, ...prev])
  }, [])

  const handleDeleted = useCallback((code: string) => {
    setBatches(prev => prev.filter(b => b.batch_code !== code))
  }, [])

  const grouped = PRODUCT_ORDER.map(pt => ({
    productType: pt,
    batches: batches
      .filter(b => b.product_type === pt)
      .sort((a, b) => {
        const da = daysUntil(a.expiry_date) ?? 9999
        const db = daysUntil(b.expiry_date) ?? 9999
        return da - db
      }),
  })).filter(g => g.batches.length > 0)

  const expiringSoon = batches.filter(b => {
    const d = daysUntil(b.expiry_date)
    return d !== null && d < 90
  }).length

  const criticalCount = inventoryItems.filter(i => i.status === 'critical').length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* SKU Stock Health — top of page */}
      <SkuStockHealth items={inventoryItems} />

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { label: 'Active batches', val: batches.length, warn: false },
          { label: 'Expiring < 90 days', val: expiringSoon, warn: expiringSoon > 0 },
          { label: 'SKUs critical', val: criticalCount, warn: criticalCount > 0 },
        ].map(({ label, val, warn }) => (
          <div key={label} style={{
            background: 'var(--grey)',
            border: `1px solid ${warn && val > 0 ? 'rgba(192,57,43,0.4)' : 'var(--grey3)'}`,
            borderRadius: 8,
            padding: '10px 18px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: warn && val > 0 ? '#C0392B' : 'var(--creme)', letterSpacing: '-0.02em' }}>{val}</div>
            <div style={{ fontSize: 10, color: 'var(--mid)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'VisbyRound', sans-serif", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginLeft: 8 }}>
          {[['< 30d','#C0392B'],['< 90d','#E67E22'],['< 180d','#F1C40F'],['180d+','#27AE60']].map(([lbl,col]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--mid)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }} />
              {lbl}
            </div>
          ))}
        </div>
      </div>

      {/* Batch groups */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="ph">
          <span className="pt">Active Batches</span>
          <span className="pg">{batches.length} total · {expiringSoon} expiring &lt;90d</span>
        </div>
        <div className="pb">
          {batches.length === 0 ? (
            <div style={{ color: 'var(--mid)', fontSize: 13 }}>No batches — add one below or run sync.</div>
          ) : (
            <div style={{ columns: '2 320px', columnGap: 20 }}>
              {grouped.map(g => (
                <div key={g.productType} style={{ breakInside: 'avoid', marginBottom: 20 }}>
                  <div style={{
                    fontFamily: "'VisbyRound', sans-serif", fontWeight: 600, fontSize: 10,
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: 8,
                  }}>
                    {PRODUCT_LABELS[g.productType] ?? g.productType} ({g.batches.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {g.batches.map(b => (
                      <BatchCard key={b.batch_code} batch={b} onDelete={handleDeleted} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add batch form */}
      <AddBatchForm onAdded={handleAdded} />

      {/* Daily metrics */}
      <div className="panel">
        <div className="ph">
          <span className="pt">Daily Production Metrics</span>
          <span className="pg">Last 30 production days</span>
        </div>
        <div className="pb">
          <DailyMetricsTable metrics={metrics} />
        </div>
      </div>
    </div>
  )
}
