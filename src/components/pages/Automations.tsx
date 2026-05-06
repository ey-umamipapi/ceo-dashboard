'use client'

import { useState, useEffect, useCallback } from 'react'

interface Job {
  id: number
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  requested_by: string
  requested_at: string
  started_at: string | null
  completed_at: string | null
  output: string | null
  error: string | null
}

interface KojiStatus {
  last_seen: string | null
}

const AUTOMATIONS = [
  {
    id: 'invoices',
    label: 'Invoice Register',
    desc: 'Scan all inboxes, process new invoices, flag duplicates and exceptions.',
    icon: '📄',
    category: 'Finance',
  },
  {
    id: 'retcon-sales',
    label: 'Retcon Sales',
    desc: 'Run the monthly retcon sales report for Joe.',
    icon: '📊',
    category: 'Finance',
  },
  {
    id: '3pl-report',
    label: '3PL Report',
    desc: 'Pull the monthly 3PL dispatch and inventory report for Jason.',
    icon: '📦',
    category: 'Operations',
  },
  {
    id: 'sync-dashboard',
    label: 'Refresh HubPapi',
    desc: 'Sync MasterPapi + ecommerce data and redeploy to hub.umamipapi.com.au.',
    icon: '🔄',
    category: 'System',
  },
]

const STATUS_COLORS: Record<string, string> = {
  pending:   '#E67E22',
  running:   '#2980B9',
  completed: '#27AE60',
  failed:    '#C0392B',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function KojiPill({ status }: { status: KojiStatus | null }) {
  const isOnline = status?.last_seen
    ? Date.now() - new Date(status.last_seen).getTime() < 60000
    : false

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--grey)',
      border: `1px solid ${isOnline ? '#27AE60' : 'var(--grey3)'}`,
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 11,
      fontFamily: "'VisbyRound', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: isOnline ? '#27AE60' : 'var(--mid)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isOnline ? '#27AE60' : '#555',
        boxShadow: isOnline ? '0 0 6px #27AE6088' : 'none',
        flexShrink: 0,
      }} />
      Koji {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}

function AutomationCard({ automation, onTrigger, latestJob }: {
  automation: typeof AUTOMATIONS[number]
  onTrigger: (id: string) => void
  latestJob: Job | undefined
}) {
  const [confirming, setConfirming] = useState(false)
  const isRunning = latestJob?.status === 'pending' || latestJob?.status === 'running'

  function handleClick() {
    if (confirming) {
      onTrigger(automation.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  return (
    <div style={{
      background: 'var(--grey)',
      border: '1px solid var(--grey3)',
      borderRadius: 10,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{automation.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--creme)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>{automation.label}</div>
          <div style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.5 }}>{automation.desc}</div>
        </div>
      </div>

      {latestJob && (
        <div style={{
          fontSize: 11,
          color: STATUS_COLORS[latestJob.status] ?? 'var(--mid)',
          fontFamily: "'VisbyRound', sans-serif",
          letterSpacing: '0.06em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: STATUS_COLORS[latestJob.status],
            flexShrink: 0,
          }} />
          {latestJob.status.toUpperCase()} · {timeAgo(latestJob.requested_at)}
          {latestJob.output && latestJob.status === 'completed' && (
            <span style={{ color: 'var(--mid)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, marginLeft: 4 }}>
              — {latestJob.output.slice(0, 80)}{latestJob.output.length > 80 ? '…' : ''}
            </span>
          )}
          {latestJob.error && (
            <span style={{ color: '#e8a090', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, marginLeft: 4 }}>
              — {latestJob.error.slice(0, 80)}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleClick}
          disabled={isRunning}
          style={{
            background: confirming ? '#C0392B' : isRunning ? 'var(--grey3)' : 'transparent',
            color: confirming ? '#fff' : isRunning ? 'var(--mid)' : '#C0392B',
            border: `1px solid ${confirming ? '#C0392B' : isRunning ? 'var(--grey3)' : '#C0392B'}`,
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 11,
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isRunning ? (latestJob?.status === 'running' ? 'Running…' : 'Queued…') : confirming ? 'Confirm — Run Now' : 'Run'}
        </button>
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: 'transparent',
              color: 'var(--mid)',
              border: '1px solid var(--grey3)',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >Cancel</button>
        )}
      </div>
    </div>
  )
}

export default function Automations() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [kojiStatus, setKojiStatus] = useState<KojiStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLog, setShowLog] = useState(false)

  const refresh = useCallback(() => {
    fetch('/api/run')
      .then(r => r.json())
      .then(d => {
        setJobs(d.jobs ?? [])
        setKojiStatus(d.kojiStatus ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const iv = setInterval(refresh, 5000)
    return () => clearInterval(iv)
  }, [refresh])

  async function trigger(jobType: string) {
    await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobType }),
    })
    refresh()
  }

  function latestJobForType(type: string): Job | undefined {
    return jobs.find(j => j.job_type === type)
  }

  const categories = AUTOMATIONS.map(a => a.category).filter((c, i, arr) => arr.indexOf(c) === i)

  const labelStyle: React.CSSProperties = {
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--creme)',
    marginBottom: 12,
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={labelStyle}>Automations</div>
        <KojiPill status={kojiStatus} />
      </div>

      {loading && <div style={{ color: 'var(--mid)', fontSize: 13 }}>Loading…</div>}

      {!loading && categories.map(cat => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--mid)',
            marginBottom: 10,
          }}>{cat}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
            {AUTOMATIONS.filter(a => a.category === cat).map(a => (
              <AutomationCard
                key={a.id}
                automation={a}
                onTrigger={trigger}
                latestJob={latestJobForType(a.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Run log toggle */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowLog(v => !v)}
          style={{
            background: 'none', border: 'none', color: 'var(--mid)', cursor: 'pointer',
            fontSize: 11, fontFamily: "'VisbyRound', sans-serif",
            letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 0',
          }}
        >
          {showLog ? '▾' : '▸'} Run History ({jobs.length})
        </button>

        {showLog && jobs.length > 0 && (
          <div style={{ marginTop: 10, background: 'var(--grey)', border: '1px solid var(--grey3)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grey3)' }}>
                  <th style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>Job</th>
                  <th style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>Status</th>
                  <th style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>When</th>
                  <th style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>Output</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--grey3)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--creme)', fontFamily: "'VisbyRound', sans-serif", fontWeight: 600 }}>
                      {AUTOMATIONS.find(a => a.id === job.job_type)?.label ?? job.job_type}
                    </td>
                    <td style={{ padding: '8px 14px' }}>
                      <span style={{ color: STATUS_COLORS[job.status] ?? 'var(--mid)', fontFamily: "'VisbyRound', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', color: 'var(--mid)' }}>{timeAgo(job.requested_at)}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--mid)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.output ?? job.error ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
