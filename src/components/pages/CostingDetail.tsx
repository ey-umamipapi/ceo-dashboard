'use client'

import { DashboardData, MarginSku, CostingCogs, CostingIngredient, CostingOverhead } from '@/types'

interface Props {
  data: DashboardData
}

const RED = '#C0392B'
const GRN = '#27AE60'
const ORG = '#E67E22'
const GRY = '#555'

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return n.toFixed(decimals)
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${(n * 100).toFixed(1)}%`
}

function marginColor(pct: number | null | undefined): string {
  if (pct == null) return GRY
  if (pct >= 0.5) return GRN
  if (pct >= 0.3) return ORG
  return RED
}

function groupByProduct(skus: MarginSku[]): Map<string, MarginSku[]> {
  const map = new Map<string, MarginSku[]>()
  for (const sku of skus) {
    const key = sku.source_file ?? sku.product
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(sku)
  }
  return map
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

function skuDisplayName(sourceFile: string | null | undefined): string {
  if (!sourceFile) return 'Unknown SKU'
  return sourceFile
    .replace(/^MarginPapi - /, '')
    .replace(/\s*\(.*?\)\s*/, '')
    .replace(/\.xlsx$/, '')
    .trim()
}

function CogsBreakdown({ sku_name, cogsData, ingredients, overhead }: {
  sku_name: string
  cogsData: CostingCogs[]
  ingredients: CostingIngredient[]
  overhead: CostingOverhead | undefined
}) {
  if (!cogsData.length) return null

  // Show only variants with actual production (total_units > 0)
  const active = cogsData.filter(c => (c.total_units ?? 0) > 0)
  const all = active.length > 0 ? active : cogsData.slice(0, 4)

  const ingr = ingredients.filter(i => i.sku_name === sku_name && (i.unit_cost ?? 0) > 0)

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--grey2)', paddingTop: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 10 }}>COGS Breakdown by Variant</div>

      {/* OH assumptions */}
      {overhead && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            overhead.hourly_rate   != null ? `Labour $${overhead.hourly_rate}/hr` : null,
            overhead.super_pct     != null ? `Super ${(overhead.super_pct * 100).toFixed(0)}%` : null,
            overhead.annual_rent   != null ? `Rent $${overhead.annual_rent?.toLocaleString()}/yr` : null,
          ].filter(Boolean).map(txt => (
            <span key={txt} style={{ fontSize: 11, color: '#666', background: 'var(--grey1)', padding: '2px 8px', borderRadius: 4 }}>{txt}</span>
          ))}
        </div>
      )}

      {/* COGS table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--grey2)' }}>
            <th style={{ textAlign: 'left', color: GRY, padding: '4px 8px 6px 0', fontWeight: 500 }}>Variant</th>
            <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>Ingred.</th>
            <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>Pkg</th>
            <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>OH</th>
            <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>Total COGS</th>
            <th style={{ textAlign: 'right', color: GRY, padding: '4px 0 6px 8px', fontWeight: 500 }}>Units/mo</th>
          </tr>
        </thead>
        <tbody>
          {all.map(c => (
            <tr key={c.product_variant} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{ padding: '6px 8px 6px 0', color: '#ccc' }}>{c.product_variant}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>${fmt(c.ingredients_cogs, 3)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>${fmt(c.packaging_cogs, 3)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>${fmt(c.overheads_cogs, 3)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--fg)', fontWeight: 600 }}>${fmt(c.total_cogs, 3)}</td>
              <td style={{ padding: '6px 0 6px 8px', textAlign: 'right', color: '#666' }}>{c.total_units?.toLocaleString() ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top ingredients */}
      {ingr.length > 0 && (
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', marginBottom: 6 }}>
            Key Ingredients ({ingr.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ingr.slice(0, 8).map(i => (
              <div key={i.component} style={{ fontSize: 11, color: '#666', background: 'var(--grey1)', padding: '2px 8px', borderRadius: 4 }}>
                {i.component}
                {i.unit_cost != null && <span style={{ color: '#444', marginLeft: 4 }}>${fmt(i.unit_cost, 3)}/unit</span>}
              </div>
            ))}
            {ingr.length > 8 && <div style={{ fontSize: 11, color: '#444', padding: '2px 8px' }}>+{ingr.length - 8} more</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CostingDetail({ data }: Props) {
  const skus = data.marginSkus ?? []
  const costingCogs = data.costingCogs ?? []
  const costingIngredients = data.costingIngredients ?? []
  const costingOverheads = data.costingOverheads ?? []

  // Group by source file (one card per MarginPapi file = one SKU)
  const grouped = groupByProduct(skus)

  // Sort groups: files with data_issue last
  const sortedGroups = Array.from(grouped.entries()).sort(([, aRows], [, bRows]) => {
    const aIssue = aRows.some((r: MarginSku) => r.data_issue)
    const bIssue = bRows.some((r: MarginSku) => r.data_issue)
    if (aIssue && !bIssue) return 1
    if (!aIssue && bIssue) return -1
    return 0
  })

  if (skus.length === 0) {
    return (
      <div className="page">
        <div className="panel">
          <div className="ph"><span className="pt">Costing Engine</span></div>
          <div className="pb">
            <p style={{ color: GRY, fontSize: 13 }}>No costing data loaded. Run <code>sync_masterpapi.py</code> to populate.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">M3 Costing Engine</span>
          <span className="pg">{sortedGroups.length} active SKUs · MarginPapi Apr 2026</span>
        </div>
        <div className="pb">
          <p style={{ color: GRY, fontSize: 12, margin: 0 }}>
            Live margin data synced from MarginPapi files. Reviewed date = Richard&apos;s sign-off (Setup!F17) — shows file modified date until Richard enters a review date.
          </p>
        </div>
      </div>

      {sortedGroups.map(([fileKey, rows]) => {
        const sample = rows[0]
        const hasIssue = rows.some((r: MarginSku) => r.data_issue)
        const issueNote = rows.find((r: MarginSku) => r.data_issue_note)?.data_issue_note
        const skuName = skuDisplayName(sample.source_file)
        const lastReviewed = formatDate(sample.last_reviewed_at)
        const fileModified = formatDate(sample.file_modified_at)
        const sourceFile = sample.source_file ?? '—'

        const skuCogs = costingCogs.filter(c => c.sku_name === skuName)
        const skuOverhead = costingOverheads.find(o => o.sku_name === skuName)

        // Sort channels by sort_order then name
        const channels = [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

        // Best and worst margin channels
        const validPcts = channels.filter(c => c.margin_pct != null)
        const bestCh = validPcts.length > 0
          ? validPcts.reduce((a, b) => (a.margin_pct! > b.margin_pct! ? a : b))
          : null
        const worstCh = validPcts.length > 0
          ? validPcts.reduce((a, b) => (a.margin_pct! < b.margin_pct! ? a : b))
          : null

        return (
          <div key={fileKey} className="panel" style={{ marginBottom: 16 }}>
            {/* SKU header */}
            <div className="ph" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <span className="pt">{skuName}</span>
                {hasIssue && (
                  <span style={{
                    background: '#7a1c0a',
                    color: '#f4b8a8',
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 4,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}>
                    ⚠ DATA ISSUE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: GRY, display: 'flex', gap: 16 }}>
                <span>Reviewed: <strong style={{ color: '#aaa' }}>{lastReviewed}</strong></span>
                <span>File modified: <strong style={{ color: '#aaa' }}>{fileModified}</strong></span>
                <span>Source: <strong style={{ color: '#aaa' }}>{sourceFile}</strong></span>
              </div>
            </div>

            <div className="pb">
              {/* Data issue banner */}
              {hasIssue && issueNote && (
                <div style={{
                  background: 'rgba(192,57,43,0.12)',
                  border: '1px solid rgba(192,57,43,0.3)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  marginBottom: 14,
                  fontSize: 12,
                  color: '#f4b8a8',
                }}>
                  {issueNote}
                </div>
              )}

              {/* Summary row: best/worst channel */}
              {bestCh && worstCh && bestCh.channel !== worstCh.channel && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: 'rgba(39,174,96,0.08)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(39,174,96,0.15)' }}>
                    <div style={{ fontSize: 10, color: GRY, marginBottom: 2 }}>Best channel</div>
                    <div style={{ fontSize: 13, color: GRN, fontWeight: 600 }}>{bestCh.channel}</div>
                    <div style={{ fontSize: 12, color: GRN }}>{fmtPct(bestCh.margin_pct)} · ${fmt(bestCh.margin_dollars)}</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(192,57,43,0.08)', borderRadius: 6, padding: '8px 12px', border: '1px solid rgba(192,57,43,0.15)' }}>
                    <div style={{ fontSize: 10, color: GRY, marginBottom: 2 }}>Worst channel</div>
                    <div style={{ fontSize: 13, color: RED, fontWeight: 600 }}>{worstCh.channel}</div>
                    <div style={{ fontSize: 12, color: RED }}>{fmtPct(worstCh.margin_pct)} · ${fmt(worstCh.margin_dollars)}</div>
                  </div>
                </div>
              )}

              {/* Channel table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <th style={{ textAlign: 'left', color: GRY, padding: '4px 8px 6px 0', fontWeight: 500 }}>Channel</th>
                    <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>Sell $</th>
                    <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>COGS $</th>
                    <th style={{ textAlign: 'right', color: GRY, padding: '4px 8px 6px', fontWeight: 500 }}>Margin $</th>
                    <th style={{ textAlign: 'right', color: GRY, padding: '4px 0 6px 8px', fontWeight: 500 }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch, i) => (
                    <tr
                      key={`${ch.channel}-${i}`}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding: '6px 8px 6px 0', color: '#ccc' }}>{ch.channel}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>${fmt(ch.sell_price)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#aaa' }}>${fmt(ch.cogs)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: marginColor(ch.margin_pct) }}>
                        ${fmt(ch.margin_dollars)}
                      </td>
                      <td style={{ padding: '6px 0 6px 8px', textAlign: 'right' }}>
                        <span style={{
                          color: marginColor(ch.margin_pct),
                          fontWeight: 600,
                          fontSize: 12,
                        }}>
                          {fmtPct(ch.margin_pct)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <CogsBreakdown
                sku_name={skuName}
                cogsData={skuCogs}
                ingredients={costingIngredients}
                overhead={skuOverhead}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
