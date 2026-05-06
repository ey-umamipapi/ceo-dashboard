'use client'

import { useState } from 'react'
import { SOCIAL_DATA } from '@/lib/utils'
import type { DashboardData } from '@/types'

const RED = '#C0392B', RLT = '#E74C3C', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const PLATFORM_STATS = {
  instagram: { followers: 28400, followersGrowth: '+1.2K', engagementRate: 4.8, reach: 142000, impressions: 380000 },
  tiktok:    { followers: 11200, followersGrowth: '+840',  engagementRate: 6.2, reach: 88000,  impressions: 210000 },
}

const PILLARS = [
  { name: 'Candid Q&A',   count: 6, color: BLU,  note: 'Highest avg views' },
  { name: 'Founder-Led',  count: 5, color: ORG,  note: 'Best saves & shares' },
  { name: 'Memes',        count: 2, color: PRP,  note: 'High reach, low save' },
  { name: 'Education',    count: 1, color: GRN,  note: '' },
  { name: 'Community',    count: 2, color: RLT,  note: 'In progress' },
  { name: 'Promo/Collabs',count: 3, color: '#888', note: '' },
]

type SocialMonth = 'feb' | 'mar' | 'apr'
const MONTHS: SocialMonth[] = ['feb', 'mar', 'apr']
const MONTH_LABELS: Record<SocialMonth, string> = { feb: 'Feb', mar: 'Mar', apr: 'Apr' }

function pillarColor(pillar: string): string {
  const p = PILLARS.find(x => pillar.startsWith(x.name.split('/')[0]))
  return p?.color ?? '#555'
}

function StatusTag({ status }: { status: string }) {
  const cls = status === 'POSTED' ? 'tag-green' : status === 'SHOT' ? 'tag-blue' : 'tag-grey'
  return <span className={`tag ${cls}`}>{status}</span>
}

export default function Socials({ data }: { data: DashboardData }) {
  const [month, setMonth] = useState<SocialMonth>('apr')
  const period = SOCIAL_DATA[month]

  const allPosts = [
    ...SOCIAL_DATA.feb.posts,
    ...SOCIAL_DATA.mar.posts,
    ...SOCIAL_DATA.apr.posts,
  ]
  const postsWithMetrics = allPosts.filter((p: any) => p.views != null) as any[]

  const totalViews  = postsWithMetrics.reduce((s: number, p: any) => s + (p.views ?? 0), 0)
  const totalLikes  = postsWithMetrics.reduce((s: number, p: any) => s + (p.likes ?? 0), 0)
  const totalSaves  = postsWithMetrics.reduce((s: number, p: any) => s + (p.saves ?? 0), 0)
  const totalShares = postsWithMetrics.reduce((s: number, p: any) => s + (p.shares ?? 0), 0)
  const avgEngRate  = postsWithMetrics.length > 0
    ? postsWithMetrics.reduce((s: number, p: any) => s + ((p.likes + p.saves + p.shares + p.comments) / p.views * 100), 0) / postsWithMetrics.length
    : 0

  const topPosts = [...postsWithMetrics].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 6)

  const ig = PLATFORM_STATS.instagram
  const tt = PLATFORM_STATS.tiktok

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Instagram</span><span>Apr 2026</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">TikTok</span><span>Manual</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Content Tracker</span><span>Aaron's Sheet</span></div>
      </div>

      {/* Intel block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Social Intelligence</div>
        <div className="flag-row">
          <div className="flag-item green"><span className="flag-icon">↑</span><span>UMPI-04 "Best startup advice" Feb — 33.8K views, 895 saves, 612 shares. Best performing post FY26.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Founder-Led pillar drives 3× more saves than Memes. Prioritise Ethan on-camera content.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Apr posting cadence behind — only 2 posted as of MTD. Pipeline heavy on IDEATED, light on SHOT.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Gordon Ramsay retake (UMPI-04 Mar) still IDEATED — was planned 31 Mar. Chase this week.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Community pillar underrepresented — 0 posted. Customer Story #1 &amp; #2 stuck at SHOT + IDEATED.</span></div>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph">
            <span className="pt">Instagram</span>
            <span className="pg" style={{ color: PRP }}>@umamipapi</span>
          </div>
          <div className="pb">
            <div className="kpi-row cols-3" style={{ marginBottom: 12 }}>
              <div className="kpi purple">
                <div className="kpi-lbl">Followers</div>
                <div className="kpi-val small">{ig.followers.toLocaleString()}</div>
                <div className="kpi-sub"><span className="up">{ig.followersGrowth}</span> this month</div>
              </div>
              <div className="kpi green">
                <div className="kpi-lbl">Eng. Rate</div>
                <div className="kpi-val small">{ig.engagementRate}%</div>
                <div className="kpi-sub">Benchmark: ~3%</div>
              </div>
              <div className="kpi blue">
                <div className="kpi-lbl">Reach MTD</div>
                <div className="kpi-val small">{(ig.reach / 1000).toFixed(0)}K</div>
              </div>
            </div>
            <div className="kpi-row cols-3">
              <div className="kpi">
                <div className="kpi-lbl">Total Views</div>
                <div className="kpi-val small">{(totalViews / 1000).toFixed(1)}K</div>
                <div className="kpi-sub">FY26 YTD</div>
              </div>
              <div className="kpi">
                <div className="kpi-lbl">Total Saves</div>
                <div className="kpi-val small">{totalSaves.toLocaleString()}</div>
              </div>
              <div className="kpi">
                <div className="kpi-lbl">Total Shares</div>
                <div className="kpi-val small">{totalShares.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="ph">
            <span className="pt">TikTok</span>
            <span className="pg" style={{ color: '#69C9D0' }}>@umamipapi</span>
          </div>
          <div className="pb">
            <div className="kpi-row cols-3" style={{ marginBottom: 12 }}>
              <div className="kpi" style={{ borderColor: 'rgba(105,201,208,0.3)' }}>
                <div className="kpi-lbl">Followers</div>
                <div className="kpi-val small">{tt.followers.toLocaleString()}</div>
                <div className="kpi-sub"><span className="up">{tt.followersGrowth}</span> this month</div>
              </div>
              <div className="kpi green">
                <div className="kpi-lbl">Eng. Rate</div>
                <div className="kpi-val small">{tt.engagementRate}%</div>
                <div className="kpi-sub">Benchmark: ~5%</div>
              </div>
              <div className="kpi blue">
                <div className="kpi-lbl">Reach MTD</div>
                <div className="kpi-val small">{(tt.reach / 1000).toFixed(0)}K</div>
              </div>
            </div>
            <div style={{ background: 'var(--grey3)', borderRadius: 6, padding: '10px 14px', fontSize: 11, color: 'var(--mid)', lineHeight: 1.7 }}>
              TikTok data is manually updated. Connect TikTok Business Center API for automated sync.
              <div style={{ marginTop: 6, color: BLU, cursor: 'pointer', fontSize: 10 }}>↗ Open TikTok Analytics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Pipeline + Top Posts */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph">
            <span className="pt">Content Pipeline</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {MONTHS.map(m => (
                <button key={m} className={`fchip${month === m ? ' active' : ''}`} style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => setMonth(m)}>
                  {MONTH_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
          <div className="pb">
            {period.posts.map((post: any) => (
              <div key={post.id} className="feed-item">
                <div className="feed-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: pillarColor(post.pillar), display: 'inline-block', flexShrink: 0 }} />
                    {post.id} · {post.pillar}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {post.scheduled && <span style={{ fontSize: 10, color: 'var(--mid)' }}>{post.scheduled}</span>}
                    <StatusTag status={post.status} />
                  </div>
                </div>
                <div className="feed-text">{post.idea}</div>
                {post.views && (
                  <div className="feed-meta" style={{ display: 'flex', gap: 14 }}>
                    <span>👁 {post.views.toLocaleString()}</span>
                    <span>♥ {post.likes?.toLocaleString()}</span>
                    <span>🔖 {post.saves?.toLocaleString()}</span>
                    <span>↗ {post.shares?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="ph"><span className="pt">Top Posts FY26</span><span className="pg">by views</span></div>
          <div className="pb">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Post</th>
                  <th className="r">Views</th>
                  <th className="r">Likes</th>
                  <th className="r">Saves</th>
                  <th className="r">Shares</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((p: any, i: number) => (
                  <tr key={`${p.id}-${i}`}>
                    <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pillarColor(p.pillar), display: 'inline-block', flexShrink: 0 }} />
                        {p.idea}
                      </div>
                    </td>
                    <td className="r">{p.views.toLocaleString()}</td>
                    <td className="r">{p.likes?.toLocaleString() ?? '—'}</td>
                    <td className="r">{p.saves?.toLocaleString() ?? '—'}</td>
                    <td className="r">{p.shares?.toLocaleString() ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Aaron's Content Tracker */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Content Tracker</span>
          <a
            href="https://docs.google.com/spreadsheets/d/1u8oxxLLc8Whddi5CySGGs2jMZ1OvoN6gyP2o8uB1hbk/edit?gid=1830854498#gid=1830854498"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#2980B9', textDecoration: 'none' }}
          >
            ↗ Open in Sheets
          </a>
        </div>
        <div className="pb" style={{ padding: 0, overflow: 'hidden', borderRadius: '0 0 8px 8px' }}>
          <iframe
            src="https://docs.google.com/spreadsheets/d/1u8oxxLLc8Whddi5CySGGs2jMZ1OvoN6gyP2o8uB1hbk/htmlview?gid=1830854498"
            width="100%"
            height="520"
            style={{ border: 0, display: 'block' }}
          />
        </div>
      </div>

      {/* Pillar Breakdown + Cadence */}
      <div className="g2">
        <div className="panel">
          <div className="ph"><span className="pt">Content Pillar Breakdown</span><span className="pg">FY26 YTD</span></div>
          <div className="pb">
            {PILLARS.map(pillar => {
              const pillarPosts = allPosts.filter((p: any) => p.pillar.startsWith(pillar.name.split('/')[0]))
              const posted = pillarPosts.filter((p: any) => p.status === 'POSTED').length
              const total  = pillarPosts.length || pillar.count
              const pct    = Math.round((posted / total) * 100)
              return (
                <div key={pillar.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--creme)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: pillar.color, display: 'inline-block' }} />
                      {pillar.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--mid)' }}>{posted}/{total} posted{pillar.note ? ` · ${pillar.note}` : ''}</span>
                  </div>
                  <div style={{ background: 'var(--grey3)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: pillar.color, width: `${pct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel">
          <div className="ph"><span className="pt">Posting Cadence</span><span className="pg">FY26</span></div>
          <div className="pb">
            <div className="kpi-row cols-3" style={{ marginBottom: 14 }}>
              <div className="kpi green">
                <div className="kpi-lbl">Feb Posts</div>
                <div className="kpi-val small">4</div>
                <div className="kpi-sub">4 posted</div>
              </div>
              <div className="kpi orange">
                <div className="kpi-lbl">Mar Posts</div>
                <div className="kpi-val small">8</div>
                <div className="kpi-sub">6 posted</div>
              </div>
              <div className="kpi red">
                <div className="kpi-lbl">Apr Posts</div>
                <div className="kpi-val small">8</div>
                <div className="kpi-sub">2 posted MTD</div>
              </div>
            </div>
            <div className="flag-row">
              <div className="flag-item green"><span className="flag-icon">↑</span><span>Feb: 100% execution rate. All 4 posts delivered on schedule.</span></div>
              <div className="flag-item green"><span className="flag-icon">↑</span><span>Mar: 6/8 posted — 75% rate. Gordon Ramsay and Reality TV still outstanding.</span></div>
              <div className="flag-item red"><span className="flag-icon">⚠</span><span>Apr: 2/8 — pipeline congestion. Community &amp; Q&A content blocked on filming.</span></div>
              <div className="flag-item blue"><span className="flag-icon">→</span><span>Target: 2 posts/week minimum. Currently running at ~1/week in Apr.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
