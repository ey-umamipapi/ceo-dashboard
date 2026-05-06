'use client'

import { useState, useEffect } from 'react'
import type { WeeklyPulseEntry, WeeklyPulseContent } from '@/types'

const SECTIONS = [
  { key: 'bigRock',       label: '🪨 Big Rock',           prompt: 'What is the single priority you\'re building toward right now?' },
  { key: 'bigRockStatus', label: 'Status',                 prompt: 'Where is the Big Rock at this week?' },
  { key: 'progress',      label: '📈 Progress This Week',  prompt: 'What did you actually move forward — even if it felt small?' },
  { key: 'leverage',      label: '01 — Leverage',          prompt: 'What specifically created the most value this week?' },
  { key: 'drag',          label: '02 — Drag',              prompt: 'Where did you get pulled below your level?' },
  { key: 'alignment',     label: '03 — Alignment',         prompt: 'Is the Big Rock still the right priority? Yes / No / Needs adjustment — and why.' },
  { key: 'adjustment',    label: '04 — One Adjustment',    prompt: 'One decision. Not a vague intention. Not a list.' },
]

const DEPTH_SECTIONS = [
  { key: 'avoidance', label: '05 — Avoidance', prompt: 'What decision are you avoiding? The thing you\'ve been \'thinking about\' too long.' },
  { key: 'people',    label: '06 — People',    prompt: 'Who are you underleveraging or avoiding right now — and why?' },
  { key: 'constraint',label: '07 — Constraint',prompt: 'What would you stop doing if you had to cut one thing?' },
]

function SectionBlock({ label, value }: { label: string; value: string }) {
  if (!value) return null
  const isAdjustment = label.includes('Adjustment')
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "'VisbyRound', sans-serif",
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: isAdjustment ? '#C0392B' : 'var(--mid)',
        marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 13,
        color: 'var(--creme)',
        lineHeight: 1.6,
        background: isAdjustment ? 'rgba(192,57,43,0.08)' : 'transparent',
        borderLeft: isAdjustment ? '2px solid #C0392B' : 'none',
        padding: isAdjustment ? '8px 12px' : '0',
        borderRadius: isAdjustment ? 4 : 0,
      }}>
        {value}
      </div>
    </div>
  )
}

function PulseCard({ entry, isOpen, onToggle }: {
  entry: WeeklyPulseEntry
  isOpen: boolean
  onToggle: () => void
}) {
  const [content, setContent] = useState<WeeklyPulseContent | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && !content) {
      setLoading(true)
      fetch(`/api/notion?id=${entry.id}`)
        .then(r => r.json())
        .then(d => { setContent(d.sections); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [isOpen, entry.id, content])

  const notionUrl = `https://www.notion.so/${entry.id.replace(/-/g, '')}`

  return (
    <div style={{
      background: 'var(--grey)',
      border: '1px solid var(--grey3)',
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 18,
          lineHeight: 1,
          opacity: 0.6,
          flexShrink: 0,
          transform: isOpen ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.15s',
          display: 'inline-block',
          color: 'var(--mid)',
        }}>▶</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--creme)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>{entry.title}</div>
        </div>
        <a
          href={notionUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 10,
            fontFamily: "'VisbyRound', sans-serif",
            color: 'var(--mid)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid var(--grey3)',
            borderRadius: 4,
            padding: '3px 8px',
            flexShrink: 0,
          }}
        >
          Notion ↗
        </a>
      </button>

      {isOpen && (
        <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--grey3)' }}>
          {loading && (
            <div style={{ padding: '20px 0', color: 'var(--mid)', fontSize: 13 }}>Loading…</div>
          )}
          {content && !loading && (
            <div style={{ paddingTop: 16 }}>
              {SECTIONS.map(s => (
                <SectionBlock key={s.key} label={s.label} value={(content as unknown as Record<string, string>)[s.key] ?? ''} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NewPulseForm({ onSaved }: { onSaved: (entry: WeeklyPulseEntry) => void }) {
  const today = new Date()
  const defaultTitle = today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const [fields, setFields] = useState<Record<string, string>>({
    title: defaultTitle,
    bigRock: '', bigRockStatus: '', progress: '',
    leverage: '', drag: '', alignment: '', adjustment: '',
    avoidance: '', people: '', constraint: '',
  })
  const [depthOpen, setDepthOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, val: string) {
    setFields(prev => ({ ...prev, [key]: val }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      onSaved({ id: data.id, title: fields.title, created_time: new Date().toISOString(), last_edited_time: new Date().toISOString() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  const ta: React.CSSProperties = {
    width: '100%',
    background: 'var(--input-bg)',
    border: '1px solid var(--grey3)',
    borderRadius: 6,
    padding: '10px 12px',
    color: 'var(--creme)',
    fontSize: 13,
    fontFamily: "'VisbyRound', sans-serif",
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 80,
  }

  const labelSt: React.CSSProperties = {
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--mid)',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelSt}>Week</label>
        <input
          value={fields.title}
          onChange={e => set('title', e.target.value)}
          required
          style={{ ...ta, minHeight: 'unset', height: 40 }}
        />
      </div>

      {SECTIONS.filter(s => s.key !== 'title').map(s => (
        <div key={s.key} style={{ marginBottom: 16 }}>
          <label style={{
            ...labelSt,
            color: s.key === 'adjustment' ? '#C0392B' : 'var(--mid)',
          }}>{s.label}</label>
          <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 6, fontStyle: 'italic' }}>{s.prompt}</div>
          <textarea
            value={fields[s.key] ?? ''}
            onChange={e => set(s.key, e.target.value)}
            style={ta}
            rows={s.key === 'bigRock' || s.key === 'progress' ? 3 : 2}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => setDepthOpen(v => !v)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--mid)',
          cursor: 'pointer',
          fontSize: 11,
          fontFamily: "'VisbyRound', sans-serif",
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '4px 0',
          marginBottom: depthOpen ? 12 : 24,
        }}
      >
        {depthOpen ? '▾' : '▸'} Depth Mode (optional — monthly)
      </button>

      {depthOpen && (
        <div style={{ marginBottom: 24 }}>
          {DEPTH_SECTIONS.map(s => (
            <div key={s.key} style={{ marginBottom: 16 }}>
              <label style={labelSt}>{s.label}</label>
              <div style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 6, fontStyle: 'italic' }}>{s.prompt}</div>
              <textarea value={fields[s.key] ?? ''} onChange={e => set(s.key, e.target.value)} style={ta} rows={2} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(192,57,43,0.1)',
          border: '1px solid rgba(192,57,43,0.25)',
          borderRadius: 6,
          padding: '9px 12px',
          marginBottom: 14,
          fontSize: 12,
          color: '#e8a090',
        }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? 'var(--grey3)' : '#C0392B',
            color: saving ? 'var(--mid)' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 24px',
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving to Notion…' : 'Save to Notion'}
        </button>
      </div>
    </form>
  )
}

export default function WeeklyPulse() {
  const [entries, setEntries] = useState<WeeklyPulseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/notion')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setEntries(d.pages ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [])

  function handleSaved(entry: WeeklyPulseEntry) {
    setEntries(prev => [entry, ...prev])
    setShowForm(false)
    setOpenId(entry.id)
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'VisbyRound', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--creme)',
    marginBottom: 18,
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={labelStyle}>CEO Weekly Pulse</div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: showForm ? 'var(--grey3)' : '#C0392B',
            color: showForm ? 'var(--mid)' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontFamily: "'VisbyRound', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ New Pulse'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--grey)',
          border: '1px solid var(--grey3)',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>New Weekly Entry</div>
          <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 16 }}>
            Saves directly to your Notion CEO Weekly Pulse — takes 5–10 minutes.
          </div>
          <NewPulseForm onSaved={handleSaved} />
        </div>
      )}

      {loading && <div style={{ color: 'var(--mid)', fontSize: 13 }}>Loading entries…</div>}
      {error && <div style={{ color: '#e8a090', fontSize: 12 }}>Error: {error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div style={{ color: 'var(--mid)', fontSize: 13 }}>No entries yet. Create your first Weekly Pulse above.</div>
      )}

      {entries.map(entry => (
        <PulseCard
          key={entry.id}
          entry={entry}
          isOpen={openId === entry.id}
          onToggle={() => setOpenId(prev => prev === entry.id ? null : entry.id)}
        />
      ))}
    </div>
  )
}
