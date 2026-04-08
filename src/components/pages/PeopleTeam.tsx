'use client'

import { DashboardData } from '@/types'
import { MARK_KPIS, PERF_LOG } from '@/lib/utils'

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

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className="kpi">
          <div className="kpi-lbl">Avg Staff on Floor</div>
          <div className="kpi-val">5.3</div>
          <div className="kpi-sub">Production days</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Prod Hours Latest Month</div>
          <div className="kpi-val">113h</div>
          <div className="kpi-sub">Jan 2026</div>
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
          <div className="pb">
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
          <div className="pb">
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
