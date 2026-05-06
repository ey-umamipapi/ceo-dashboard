'use client'

import { DashboardData, ProductionMonth } from '@/types'
import { MARK_KPIS, PERF_LOG } from '@/lib/utils'

const FY26_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

type ScheduleStatus = 'active' | 'part' | 'leave' | 'agency' | '—'

const STATUS_STYLE: Record<ScheduleStatus, { bg: string; color: string; label: string }> = {
  active:  { bg: 'rgba(39,174,96,0.18)',   color: '#27AE60', label: 'Active'  },
  part:    { bg: 'rgba(41,128,185,0.18)',   color: '#2980B9', label: 'Part'    },
  leave:   { bg: 'rgba(100,100,100,0.18)', color: '#777',    label: 'Leave'   },
  agency:  { bg: 'rgba(142,68,173,0.18)',  color: '#8E44AD', label: 'Active'  },
  '—':     { bg: 'transparent',            color: '#444',    label: '—'       },
}

const SCHEDULE: { name: string; role: string; months: Record<string, ScheduleStatus>; note?: string }[] = [
  {
    name: 'Ethan', role: 'CEO / Founder',
    months: { Jul:'active',Aug:'active',Sep:'active',Oct:'active',Nov:'active',Dec:'leave',Jan:'active',Feb:'active',Mar:'active',Apr:'active',May:'active',Jun:'active' },
    note: 'Dec: annual leave',
  },
  {
    name: 'Mark', role: 'Head of Ops',
    months: { Jul:'active',Aug:'active',Sep:'active',Oct:'active',Nov:'active',Dec:'leave',Jan:'active',Feb:'active',Mar:'active',Apr:'active',May:'active',Jun:'active' },
    note: 'Dec: annual leave',
  },
  {
    name: 'Richard', role: 'Finance / Costing',
    months: { Jul:'part',Aug:'part',Sep:'part',Oct:'active',Nov:'active',Dec:'leave',Jan:'active',Feb:'part',Mar:'active',Apr:'part',May:'part',Jun:'part' },
    note: 'Part-time engagement',
  },
  {
    name: 'OP Digital', role: 'Marketing Agency',
    months: { Jul:'agency',Aug:'agency',Sep:'agency',Oct:'agency',Nov:'agency',Dec:'leave',Jan:'agency',Feb:'agency',Mar:'agency',Apr:'agency',May:'agency',Jun:'agency' },
    note: 'Dec: agency shutdown',
  },
]

function ScheduleCell({ status }: { status: ScheduleStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <td style={{ textAlign: 'center', padding: '5px 4px' }}>
      <div style={{
        display: 'inline-block', fontSize: 9, fontWeight: 700,
        padding: '2px 6px', borderRadius: 3,
        background: s.bg, color: s.color,
        fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.04em',
        minWidth: 36,
      }}>{s.label}</div>
    </td>
  )
}

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PeopleTeam({ data }: { data: DashboardData }) {
  const issues = data.issues ?? []
  const signals = data.signals ?? []

  const pendingIssues = issues.filter(i => i.resolved === 'PENDING')
  const mtIssues = pendingIssues.filter(i => i.ownership === 'MT' || i.ownership?.includes('Mark'))
  const delegations = signals.filter(s => s.signal_type === 'delegation' && !s.archived)

  // Live KPI data from prodMonthly — latest month by sort_order
  const prodMonthly = data.prodMonthly ?? []
  const latestProdMonth = [...prodMonthly].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).at(-1)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* Team Roster */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Team Roster</span><span className="pg">May 2026</span></div>
        <div className="pb" style={{ padding: 0 }}>
          <table className="tbl" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Focus</th>
                <th className="c">Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ethan',  role: 'CEO / Founder',         focus: 'Strategy, sales, commercial, finance',           type: 'Full-time' },
                { name: 'Mark',   role: 'Head of Operations',    focus: 'Production, warehouse, dispatch, procurement',   type: 'Full-time' },
                { name: 'Richard',role: 'Finance & Costing',     focus: 'Margin modelling, COGS, cost reviews',            type: 'Part-time' },
                { name: 'OP Digital', role: 'Marketing Agency',  focus: 'Brand, paid media, EDM, PR, website',            type: 'Agency' },
              ].map(m => (
                <tr key={m.name}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ fontSize: 12 }}>{m.role}</td>
                  <td style={{ fontSize: 11, color: 'var(--mid)' }}>{m.focus}</td>
                  <td className="c">
                    <span className={`tag ${m.type === 'Full-time' ? 'tag-green' : m.type === 'Part-time' ? 'tag-blue' : 'tag-grey'}`}>{m.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FY26 Employee Schedule */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Employee Schedule</span><span className="pg">FY26 · Jul 2025 – Jun 2026</span></div>
        <div className="pb" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--row-sep)' }}>
                <th style={{ textAlign: 'left', padding: '6px 14px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, width: 130 }}>Person</th>
                {FY26_MONTHS.map(mo => (
                  <th key={mo} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 11, color: 'var(--mid)', fontWeight: 500 }}>{mo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map(person => (
                <tr key={person.name} style={{ borderBottom: '1px solid var(--row-sep)' }}>
                  <td style={{ padding: '5px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--creme)' }}>{person.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--mid)' }}>{person.role}</div>
                  </td>
                  {FY26_MONTHS.map(mo => (
                    <ScheduleCell key={mo} status={person.months[mo] ?? '—'} />
                  ))}
                </tr>
              ))}
              {/* Production floor row from live data */}
              {prodMonthly.length > 0 && (() => {
                const byMonth: Record<string, ProductionMonth> = {}
                for (const m of prodMonthly) {
                  const mo = m.month?.slice(0, 3)
                  if (mo) byMonth[mo] = m
                }
                return (
                  <tr style={{ borderBottom: '1px solid var(--row-sep)', background: 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '5px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--creme)' }}>Prod Floor</div>
                      <div style={{ fontSize: 10, color: 'var(--mid)' }}>Avg headcount</div>
                    </td>
                    {FY26_MONTHS.map(mo => {
                      const m = byMonth[mo]
                      return (
                        <td key={mo} style={{ textAlign: 'center', padding: '5px 4px' }}>
                          {m ? (
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--creme)' }}>{m.staff}</div>
                          ) : (
                            <div style={{ fontSize: 11, color: '#444' }}>—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })()}
              {/* Prod days row */}
              {prodMonthly.length > 0 && (() => {
                const byMonth: Record<string, ProductionMonth> = {}
                for (const m of prodMonthly) {
                  const mo = m.month?.slice(0, 3)
                  if (mo) byMonth[mo] = m
                }
                return (
                  <tr>
                    <td style={{ padding: '5px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--creme)' }}>Prod Days</div>
                      <div style={{ fontSize: 10, color: 'var(--mid)' }}>Runs logged</div>
                    </td>
                    {FY26_MONTHS.map(mo => {
                      const m = byMonth[mo]
                      return (
                        <td key={mo} style={{ textAlign: 'center', padding: '5px 4px' }}>
                          <div style={{ fontSize: 11, color: m ? 'var(--mid)' : '#444' }}>{m ? m.days : '—'}</div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })()}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div style={{ padding: '8px 14px 10px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(Object.entries(STATUS_STYLE) as [ScheduleStatus, typeof STATUS_STYLE[ScheduleStatus]][])
            .filter(([k]) => k !== '—')
            .map(([key, s]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: s.bg, border: `1px solid ${s.color}40` }} />
                <span style={{ fontSize: 10, color: '#666' }}>{key === 'agency' ? 'Agency active' : s.label}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className="kpi">
          <div className="kpi-lbl">Avg Staff on Floor</div>
          <div className="kpi-val">{latestProdMonth?.staff ?? '—'}</div>
          <div className="kpi-sub">Production days</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Prod Hours Latest Month</div>
          <div className="kpi-val">{latestProdMonth?.hours ? `${Math.round(latestProdMonth.hours)}h` : '—'}</div>
          <div className="kpi-sub">{latestProdMonth?.month ?? '—'}</div>
        </div>
        <div className={`kpi ${mtIssues.length > 3 ? 'red' : mtIssues.length > 1 ? 'orange' : 'green'}`}>
          <div className="kpi-lbl">Mark's Open Issues</div>
          <div className="kpi-val">{mtIssues.length}</div>
          <div className="kpi-sub">PENDING, owned by MT</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-lbl">CEO→Mark Tasks</div>
          <div className="kpi-val">{delegations.length}</div>
          <div className="kpi-sub">Active delegations</div>
        </div>
      </div>

      {/* Main g2 */}
      <div className="g2">
        {/* Mark's Open Issues */}
        <div className="panel">
          <div className="ph">
            <span className="pt">Mark's Open Issues</span>
            <span className="pg">{mtIssues.length} pending</span>
          </div>
          <div className="pb min-h-[120px]">
            {mtIssues.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>No open issues.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Issue</th>
                    <th>Category</th>
                    <th className="c">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mtIssues.map((issue, i) => (
                    <tr key={issue.id ?? i}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{issue.date}</td>
                      <td style={{ fontSize: 11 }}>{issue.issue}</td>
                      <td>
                        <span className="tag tag-grey">{issue.category}</span>
                      </td>
                      <td className="c">
                        <span className="tag tag-orange">PENDING</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {mtIssues.length === 0 && pendingIssues.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="slbl">Other Pending Issues</div>
                <table className="tbl">
                  <thead>
                    <tr><th>Date</th><th>Issue</th><th>Owner</th></tr>
                  </thead>
                  <tbody>
                    {pendingIssues.map((issue, i) => (
                      <tr key={issue.id ?? i}>
                        <td style={{ fontSize: 11 }}>{issue.date}</td>
                        <td style={{ fontSize: 11 }}>{issue.issue}</td>
                        <td style={{ fontSize: 11 }}>{issue.ownership}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pendingIssues.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--mid)', padding: '8px 0' }}>No pending issues logged.</div>
            )}
          </div>
        </div>

        {/* What I Need from Mark */}
        <div className="panel">
          <div className="ph">
            <span className="pt">What I Need from Mark This Week</span>
            <span className="pg">{delegations.length} open</span>
          </div>
          <div className="pb min-h-[120px]">
            {delegations.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>No active delegations.</div>
            ) : (
              delegations.map((s, i) => (
                <div key={s.id ?? i} className="feed-item">
                  <div className="feed-date">{s.date}</div>
                  <div className="feed-text">{s.text}</div>
                </div>
              ))
            )}

            {/* Performance Log */}
            <div className="slbl" style={{ marginTop: 16 }}>Performance Log</div>
            {PERF_LOG.map((entry, i) => (
              <div key={i} className="feed-item">
                <div className="feed-date">{entry.d} · {entry.e}</div>
                <div className="feed-text">{entry.i}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mark's KPI Tracker */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Mark's Weekly KPI Completion</span><span className="pg">FY26</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Week</th>
                <th className="c">Calendar Updated</th>
                <th className="c">Mon KPIs</th>
                <th className="c">Fri KPIs</th>
              </tr>
            </thead>
            <tbody>
              {MARK_KPIS.map(row => (
                <tr key={row.wk}>
                  <td>{row.wk}</td>
                  <td className="c">
                    <span className={`tag ${row.cal === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.cal}</span>
                  </td>
                  <td className="c">
                    <span className={`tag ${row.mon === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.mon}</span>
                  </td>
                  <td className="c">
                    <span className={`tag ${row.fri === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.fri}</span>
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
