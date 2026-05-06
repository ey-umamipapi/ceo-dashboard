'use client'

import { DashboardData } from '@/types'
import { MARK_KPIS, PERF_LOG } from '@/lib/utils'

const FY26_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

// Factory staff hours per month — sourced from Employee Schedule FY26_LIVE.xlsx (weekday + Saturday)
const FACTORY_SCHEDULE: { name: string; hrs: Record<string, number>; total: number }[] = [
  { name: 'Kritsana',     total: 1162.0, hrs: { Jul:44.8, Aug:124.5, Sep:109.5, Oct:125.2, Nov:105.0, Dec:169.7, Jan:90.2, Feb:142.8, Mar:74.8, Apr:138.0, May:37.5 } },
  { name: 'Wilson',       total: 1470.5, hrs: { Jul:66.5, Aug:192.8, Sep:131.0, Oct:127.8, Nov:142.0, Dec:177.7, Jan:90.0, Feb:143.2, Mar:226.2, Apr:137.5, May:35.8 } },
  { name: 'Eduard',       total: 1406.0, hrs: { Jul:29.0, Aug:216.8, Sep:139.2, Oct:100.2, Nov:139.0, Dec:175.5, Jan:80.2, Feb:141.2, Mar:220.2, Apr:134.7, May:30.0 } },
  { name: 'Sorrapong',    total:  866.0, hrs: { Jul:74.8, Aug:212.0, Sep:140.0, Oct:134.5, Nov:150.2, Dec:154.5 } },
  { name: 'Jonathan',     total:  691.2, hrs: { Dec:138.5, Jan:76.0, Feb:135.2, Mar:228.2, Apr:75.5, May:37.8 } },
  { name: 'Lal Ma Ngaih', total:  300.7, hrs: { Aug:175.5, Sep:125.2 } },
  { name: 'Thanaphon',    total:  376.7, hrs: { Aug:153.5, Sep:140.0, Oct:83.2 } },
  { name: 'Patrick',      total:  461.4, hrs: { Dec:87.2, Jan:90.2, Feb:142.8, Mar:141.2 } },
  { name: 'Ciro',         total:  350.2, hrs: { Mar:166.2, Apr:146.2, May:37.8 } },
  { name: 'Leangheng',    total:  484.8, hrs: { Jul:38.0, Aug:128.0, Sep:81.8, Oct:43.5, Nov:68.5, Dec:110.7, Jan:14.3 } },
  { name: 'Jackson',      total:  119.0, hrs: { Dec:53.0, Jan:35.2, Feb:30.8 } },
  { name: 'Diego',        total:  112.5, hrs: { Apr:97.5, May:15.0 } },
]

function hrsColor(h: number): { bg: string; color: string } {
  if (h === 0) return { bg: 'transparent', color: '#333' }
  if (h >= 110) return { bg: 'rgba(39,174,96,0.15)', color: '#27AE60' }
  if (h >= 50)  return { bg: 'rgba(41,128,185,0.15)', color: '#2980B9' }
  return { bg: 'rgba(230,126,34,0.15)', color: '#E67E22' }
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

      {/* FY26 Factory Staff Schedule */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Factory Staff Schedule</span>
          <span className="pg">FY26 · hours worked (weekday + Saturday)</span>
        </div>
        <div className="pb" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--row-sep)' }}>
                <th style={{ textAlign: 'left', padding: '6px 14px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, width: 120 }}>Staff</th>
                {FY26_MONTHS.map(mo => (
                  <th key={mo} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, width: 52 }}>{mo}</th>
                ))}
                <th style={{ textAlign: 'right', padding: '6px 14px', fontSize: 11, color: 'var(--mid)', fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {FACTORY_SCHEDULE.map(person => (
                <tr key={person.name} style={{ borderBottom: '1px solid var(--row-sep)' }}>
                  <td style={{ padding: '5px 14px', fontWeight: 600, fontSize: 12, color: 'var(--creme)', whiteSpace: 'nowrap' }}>{person.name}</td>
                  {FY26_MONTHS.map(mo => {
                    const h = person.hrs[mo] ?? 0
                    const { bg, color } = hrsColor(h)
                    return (
                      <td key={mo} style={{ textAlign: 'center', padding: '4px 3px' }}>
                        {h > 0 ? (
                          <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 4px', borderRadius: 3, background: bg, color, display: 'inline-block', minWidth: 34 }}>
                            {h % 1 === 0 ? h : h.toFixed(0)}h
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: '#333' }}>—</div>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'right', padding: '5px 14px', fontSize: 11, fontWeight: 600, color: 'var(--mid)', whiteSpace: 'nowrap' }}>{person.total.toFixed(0)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '8px 14px 10px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: '110h+ (full-time equiv)', bg: 'rgba(39,174,96,0.15)', color: '#27AE60' },
            { label: '50–109h (regular casual)', bg: 'rgba(41,128,185,0.15)', color: '#2980B9' },
            { label: '<50h (light month)',       bg: 'rgba(230,126,34,0.15)', color: '#E67E22' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, border: `1px solid ${l.color}40` }} />
              <span style={{ fontSize: 10, color: '#666' }}>{l.label}</span>
            </div>
          ))}
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
