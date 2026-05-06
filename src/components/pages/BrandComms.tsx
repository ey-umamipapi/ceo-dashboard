'use client'

const RED = '#C0392B', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const STATUS_COLORS: Record<string, string> = {
  live:       GRN,
  'in-review': ORG,
  planned:    BLU,
  draft:      '#555',
  complete:   '#444',
}

const CAMPAIGNS = [
  { name: 'Chadstone Collab Launch',       type: 'Event / PR',    status: 'live',       owner: 'OP Digital',  due: 'May 2026',  channel: 'PR + Social' },
  { name: 'UmamiPapi × Remedy EDM',        type: 'EDM',           status: 'complete',   owner: 'OP Digital',  due: 'Apr 2026',  channel: 'Email' },
  { name: 'Sauce Season Campaign',         type: 'Paid + Social', status: 'in-review',  owner: 'OP Digital',  due: 'Jun 2026',  channel: 'Meta + EDM' },
  { name: 'Website Chilli Oil Page Revamp',type: 'Web',           status: 'in-review',  owner: 'OP Digital',  due: 'May 2026',  channel: 'Website' },
  { name: 'Nandos QSR Stocking PR',        type: 'PR',            status: 'planned',    owner: 'OP Digital',  due: 'Jun 2026',  channel: 'PR' },
  { name: 'June EDM — New Product Tease',  type: 'EDM',           status: 'planned',    owner: 'OP Digital',  due: 'Jun 2026',  channel: 'Email' },
  { name: 'Winter Warmer Gift Set Bundle', type: 'Product / Web', status: 'draft',      owner: 'Internal',    due: 'Jul 2026',  channel: 'DTC + Social' },
]

const EMAIL_CAMPAIGNS = [
  { name: 'UmamiPapi × Remedy April Fools', sent: 'Apr 2026', subscribers: 4820, openRate: 38.2, ctr: 4.1, unsub: 0.3 },
  { name: 'March Product Spotlight',        sent: 'Mar 2026', subscribers: 4780, openRate: 34.6, ctr: 3.2, unsub: 0.2 },
  { name: 'Feb Welcome Flow Update',        sent: 'Feb 2026', subscribers: 4650, openRate: 41.0, ctr: 5.8, unsub: 0.4 },
]

const PRESS = [
  { pub: 'Good Food',         date: 'Mar 2026', title: 'The Best Chilli Oils of 2026',      sentiment: 'positive', link: '#' },
  { pub: 'Time Out Melbourne',date: 'Feb 2026', title: 'UmamiPapi lands in Chadstone',      sentiment: 'positive', link: '#' },
  { pub: 'Broadsheet',        date: 'Jan 2026', title: 'Condiment Brands Making Noise',     sentiment: 'positive', link: '#' },
]

function StatusTag({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#555'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      background: color + '22', color,
      fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>{status.replace('-', ' ')}</span>
  )
}

export default function BrandComms() {
  const live      = CAMPAIGNS.filter(c => c.status === 'live').length
  const inReview  = CAMPAIGNS.filter(c => c.status === 'in-review').length
  const planned   = CAMPAIGNS.filter(c => c.status === 'planned' || c.status === 'draft').length
  const completed = CAMPAIGNS.filter(c => c.status === 'complete').length

  const avgOpenRate = EMAIL_CAMPAIGNS.reduce((s, c) => s + c.openRate, 0) / EMAIL_CAMPAIGNS.length
  const avgCtr      = EMAIL_CAMPAIGNS.reduce((s, c) => s + c.ctr, 0) / EMAIL_CAMPAIGNS.length

  return (
    <div className="page">
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">OP Digital</span><span>Monday.com</span></div>
        <div className="dsb-item"><span style={{ fontSize: 11, color: 'var(--mid)' }}>Website · PR · EDM</span></div>
        <div className="dsb-item" style={{ marginLeft: 'auto' }}>
          <a
            href="https://view.monday.com/18398734008-74c38747c9a62e681f7eab1afaf05dc9?r=use1&is_sharable_link=true"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: BLU, textDecoration: 'none' }}
          >↗ Open Monday board</a>
        </div>
      </div>

      {/* Campaign Status KPIs */}
      <div className="kpi-row cols-4" style={{ marginBottom: 16 }}>
        <div className="kpi green">
          <div className="kpi-lbl">Live Now</div>
          <div className="kpi-val">{live}</div>
          <div className="kpi-sub">campaigns active</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">In Review</div>
          <div className="kpi-val">{inReview}</div>
          <div className="kpi-sub">awaiting approval</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Planned</div>
          <div className="kpi-val">{planned}</div>
          <div className="kpi-sub">upcoming</div>
        </div>
        <div className="kpi">
          <div className="kpi-lbl">Completed</div>
          <div className="kpi-val">{completed}</div>
          <div className="kpi-sub">this quarter</div>
        </div>
      </div>

      {/* Campaign Pipeline */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Campaign Pipeline</span>
          <span className="pg">FY26 Q3–Q4</span>
        </div>
        <div className="pb" style={{ padding: 0 }}>
          <table className="tbl" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Owner</th>
                <th className="c">Due</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map(c => (
                <tr key={c.name} style={{ opacity: c.status === 'complete' ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--mid)', fontSize: 11 }}>{c.type}</td>
                  <td style={{ color: 'var(--mid)', fontSize: 11 }}>{c.channel}</td>
                  <td style={{ color: 'var(--mid)', fontSize: 11 }}>{c.owner}</td>
                  <td className="c" style={{ fontSize: 11, color: 'var(--mid)' }}>{c.due}</td>
                  <td className="c"><StatusTag status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 16 }}>
        {/* EDM Performance */}
        <div className="panel">
          <div className="ph">
            <span className="pt">EDM Performance</span>
            <span className="pg">Avg open {avgOpenRate.toFixed(1)}% · CTR {avgCtr.toFixed(1)}%</span>
          </div>
          <div className="pb">
            <div className="kpi-row cols-2" style={{ marginBottom: 14 }}>
              <div className={`kpi ${avgOpenRate >= 30 ? 'green' : 'orange'}`} style={{ padding: '10px 14px' }}>
                <div className="kpi-lbl">Avg Open Rate</div>
                <div className="kpi-val small">{avgOpenRate.toFixed(1)}%</div>
                <div className="kpi-sub">Target &gt;30% <span className={avgOpenRate >= 30 ? 'up' : 'dn'}>{avgOpenRate >= 30 ? 'on target' : 'below'}</span></div>
              </div>
              <div className={`kpi ${avgCtr >= 3 ? 'green' : 'orange'}`} style={{ padding: '10px 14px' }}>
                <div className="kpi-lbl">Avg CTR</div>
                <div className="kpi-val small">{avgCtr.toFixed(1)}%</div>
                <div className="kpi-sub">Target &gt;3% <span className={avgCtr >= 3 ? 'up' : 'dn'}>{avgCtr >= 3 ? 'on target' : 'below'}</span></div>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th className="r">Sent</th>
                  <th className="r">Open %</th>
                  <th className="r">CTR %</th>
                </tr>
              </thead>
              <tbody>
                {EMAIL_CAMPAIGNS.map(e => (
                  <tr key={e.name}>
                    <td style={{ fontSize: 12 }}>{e.name}</td>
                    <td className="r" style={{ color: 'var(--mid)', fontSize: 11 }}>{e.sent}</td>
                    <td className="r">
                      <span className={e.openRate >= 30 ? 'up' : 'dn'}>{e.openRate.toFixed(1)}%</span>
                    </td>
                    <td className="r">
                      <span className={e.ctr >= 3 ? 'up' : 'dn'}>{e.ctr.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Press Mentions */}
        <div className="panel">
          <div className="ph"><span className="pt">Press Mentions</span><span className="pg">FY26</span></div>
          <div className="pb">
            {PRESS.map(p => (
              <div key={p.title} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 0', borderBottom: '1px solid var(--row-sep)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--creme)', flex: 1 }}>{p.title}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                    background: p.sentiment === 'positive' ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.15)',
                    color: p.sentiment === 'positive' ? GRN : RED,
                    fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{p.sentiment}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--mid)' }}>{p.pub} · {p.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
