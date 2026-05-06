'use client'

import { useState, useEffect, useRef } from 'react'
import type { TaskDepartment, TaskPriority } from '@/types'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  defaultDepartment?: TaskDepartment
  defaultLinkedType?: string
  defaultLinkedId?: string
  defaultLinkedLabel?: string
}

const DEPTS: { value: TaskDepartment; label: string }[] = [
  { value: 'all',        label: 'All Teams' },
  { value: 'ceo',        label: 'CEO' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'marketing',  label: 'Marketing' },
  { value: 'finance',    label: 'Finance' },
  { value: 'people',     label: 'People' },
  { value: 'ops',        label: 'Operations' },
]

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#555', medium: '#E67E22', high: '#E74C3C', urgent: '#C0392B',
}

export default function CreateTaskModal({
  open, onClose, onCreated,
  defaultDepartment = 'all',
  defaultLinkedType, defaultLinkedId, defaultLinkedLabel,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [department, setDepartment] = useState<TaskDepartment>(defaultDepartment)
  const [assigneeName, setAssigneeName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Reset form when opened with new defaults
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDepartment(defaultDepartment)
      setAssigneeName('')
      setDueDate('')
      setError(null)
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [open, defaultDepartment])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, priority, department,
          assignee_name: assigneeName || null,
          due_date: dueDate || null,
          linked_type: defaultLinkedType ?? null,
          linked_id: defaultLinkedId ?? null,
          linked_label: defaultLinkedLabel ?? null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--grey3)',
    borderRadius: 7, padding: '10px 13px', color: 'var(--creme)', fontSize: 13,
    fontFamily: "'VisbyRound', sans-serif", fontWeight: 700,
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700, fontFamily: "'VisbyRound', sans-serif",
    color: 'var(--mid)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6,
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 1000, backdropFilter: 'blur(2px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--grey2)', border: '1px solid var(--grey3)',
        borderRadius: 14, padding: '28px 28px 24px',
        zIndex: 1001, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:translate(-50%,-48%) scale(0.96); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{
            fontFamily: "'BarlowCondensed', sans-serif", fontStyle: 'italic', fontWeight: 700,
            fontSize: 20, color: 'var(--creme)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            New Task
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--mid)',
            fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        {/* Context link badge */}
        {defaultLinkedLabel && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(41,128,185,0.1)', border: '1px solid rgba(41,128,185,0.25)',
            borderRadius: 6, padding: '4px 10px', fontSize: 11,
            color: '#5DADE2', fontWeight: 700, marginBottom: 18,
            fontFamily: "'VisbyRound', sans-serif",
          }}>
            ⬡ Linked: {defaultLinkedLabel}
          </div>
        )}

        <form onSubmit={submit}>
          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Task title *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#C0392B' }}
              onBlur={e => { e.target.style.borderColor = 'var(--grey3)' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add context, links, acceptance criteria…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              onFocus={e => { e.target.style.borderColor = '#C0392B' }}
              onBlur={e => { e.target.style.borderColor = 'var(--grey3)' }}
            />
          </div>

          {/* Priority + Department row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 5, fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                    border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'var(--grey3)'}`,
                    background: priority === p ? PRIORITY_COLORS[p] + '22' : 'transparent',
                    color: priority === p ? PRIORITY_COLORS[p] : 'var(--mid)',
                    fontFamily: "'VisbyRound', sans-serif",
                  }}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Team</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as TaskDepartment)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {DEPTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignee + Due date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
            <div>
              <label style={labelStyle}>Assign to</label>
              <input
                value={assigneeName}
                onChange={e => setAssigneeName(e.target.value)}
                placeholder="Name"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C0392B' }}
                onBlur={e => { e.target.style.borderColor = 'var(--grey3)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => { e.target.style.borderColor = '#C0392B' }}
                onBlur={e => { e.target.style.borderColor = 'var(--grey3)' }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.25)',
              borderRadius: 6, padding: '8px 12px', marginBottom: 14,
              fontSize: 12, color: '#e8a090', fontFamily: "'VisbyRound', sans-serif",
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              background: 'transparent', border: '1px solid var(--grey3)',
              color: 'var(--mid)', borderRadius: 7, padding: '9px 18px',
              fontSize: 12, cursor: 'pointer', fontFamily: "'VisbyRound', sans-serif", fontWeight: 700,
            }}>Cancel</button>
            <button type="submit" disabled={saving || !title.trim()} style={{
              background: saving || !title.trim() ? 'var(--grey3)' : '#C0392B',
              color: saving || !title.trim() ? 'var(--mid)' : '#fff',
              border: 'none', borderRadius: 7, padding: '9px 22px',
              fontFamily: "'BarlowCondensed', sans-serif", fontStyle: 'italic', fontWeight: 700,
              fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: saving || !title.trim() ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
