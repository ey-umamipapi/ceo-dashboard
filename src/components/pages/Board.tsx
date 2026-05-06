'use client'

import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import type { Task, TaskStatus, TaskDepartment, Role } from '@/types'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo',        label: 'To Do',       color: '#555' },
  { id: 'in-progress', label: 'In Progress',  color: '#2980B9' },
  { id: 'review',      label: 'Review',       color: '#E67E22' },
  { id: 'done',        label: 'Done',         color: '#27AE60' },
  { id: 'blocked',     label: 'Blocked',      color: '#C0392B' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: '#555', medium: '#E67E22', high: '#E74C3C', urgent: '#C0392B',
}

const DEPT_LABELS: Record<string, string> = {
  all: 'All Teams', ceo: 'CEO', commercial: 'Commercial',
  marketing: 'Marketing', finance: 'Finance', people: 'People', ops: 'Operations',
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function DueLabel({ date }: { date: string }) {
  const d = daysUntil(date)
  const color = d < 0 ? '#E74C3C' : d <= 2 ? '#E67E22' : '#555'
  const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `${d}d`
  return <span style={{ fontSize: 10, color, fontWeight: 700 }}>{label}</span>
}

function TaskCard({ task, index, onStatusChange, onDelete }: {
  task: Task
  index: number
  onStatusChange: (id: number, status: TaskStatus) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            background: snapshot.isDragging ? 'var(--grey2)' : 'var(--grey)',
            border: `1px solid ${snapshot.isDragging ? 'var(--mid)' : 'var(--grey3)'}`,
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 8,
            cursor: 'grab',
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
            transform: snapshot.isDragging ? 'rotate(1.5deg)' : 'none',
            transition: snapshot.isDragging ? 'none' : 'border-color 0.15s, box-shadow 0.15s',
            userSelect: 'none',
            ...provided.draggableProps.style,
          }}
          onClick={() => setExpanded(v => !v)}
        >
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5,
              background: PRIORITY_COLORS[task.priority],
            }} />
            <div style={{ flex: 1, fontSize: 13, color: 'var(--creme)', lineHeight: 1.4, fontWeight: 700 }}>
              {task.title}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingLeft: 14 }}>
            {task.linked_label && (
              <span style={{
                fontSize: 10, color: '#2980B9', background: 'rgba(41,128,185,0.1)',
                border: '1px solid rgba(41,128,185,0.2)', borderRadius: 4, padding: '1px 6px',
              }}>
                ⬡ {task.linked_label}
              </span>
            )}
            {task.assignee_name && (
              <span style={{ fontSize: 10, color: 'var(--mid)' }}>→ {task.assignee_name}</span>
            )}
            {task.due_date && <DueLabel date={task.due_date} />}
            <span style={{
              fontSize: 9, color: PRIORITY_COLORS[task.priority], fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 'auto',
            }}>{task.priority}</span>
          </div>

          {/* Expanded: description + actions */}
          {expanded && (
            <div style={{ paddingLeft: 14, marginTop: 10, borderTop: '1px solid var(--grey3)', paddingTop: 10 }}
              onClick={e => e.stopPropagation()}
            >
              {task.description && (
                <div style={{ fontSize: 12, color: 'var(--mid)', lineHeight: 1.6, marginBottom: 10 }}>
                  {task.description}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--mid)' }}>
                  by {task.created_by} · {new Date(task.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
                <button onClick={() => onDelete(task.id)} style={{
                  background: 'none', border: 'none', color: '#555', fontSize: 11,
                  cursor: 'pointer', padding: '2px 6px',
                }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default function Board({ userRole, userEmail, onCreateTask }: {
  userRole: Role
  userEmail: string
  onCreateTask: (context: { department?: TaskDepartment }) => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deptFilter, setDeptFilter] = useState<string>('all')

  const load = useCallback(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => { setTasks(d.tasks ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function changeStatus(id: number, status: TaskStatus) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function deleteTask(id: number) {
    setTasks(ts => ts.filter(t => t.id !== id))
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  function handleDragEnd(result: DropResult) {
    const { draggableId, destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskId = parseInt(draggableId, 10)
    const newStatus = destination.droppableId as TaskStatus

    // Optimistically reorder tasks list
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId)
      if (!task || task.status === newStatus) return prev
      return prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    })

    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  const filtered = deptFilter === 'all'
    ? tasks
    : tasks.filter(t => t.department === deptFilter || t.department === 'all')

  const byStatus = (status: TaskStatus) => filtered.filter(t => t.status === status)

  const depts = ['all', 'ceo', 'commercial', 'marketing', 'finance', 'people', 'ops']

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          fontFamily: "'BarlowCondensed', sans-serif", fontStyle: 'italic',
          fontWeight: 700, fontSize: 18, color: 'var(--creme)', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Task Board
        </div>
        <button
          onClick={() => onCreateTask({ department: deptFilter !== 'all' ? deptFilter as TaskDepartment : undefined })}
          style={{
            background: '#C0392B', color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 16px', fontSize: 12, fontWeight: 700, fontFamily: "'VisbyRound', sans-serif",
            letterSpacing: '0.06em', cursor: 'pointer',
          }}
        >
          + New Task
        </button>
      </div>

      {/* Department filter */}
      <div className="filter-bar" style={{ position: 'static', marginBottom: 20, borderRadius: 8 }}>
        <div className="fg">
          <span className="fgl">Team</span>
          {depts.map(d => (
            <button key={d} className={`fchip${deptFilter === d ? ' active' : ''}`}
              onClick={() => setDeptFilter(d)}>
              {DEPT_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ color: 'var(--mid)', fontSize: 13 }}>Loading…</div>}

      {!loading && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {COLUMNS.map(col => {
              const colTasks = byStatus(col.id)
              return (
                <div key={col.id}>
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                    <span style={{
                      fontFamily: "'BarlowCondensed', sans-serif", fontStyle: 'italic', fontWeight: 700,
                      fontSize: 12, color: 'var(--creme)', textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>{col.label}</span>
                    <span style={{
                      marginLeft: 'auto', background: 'var(--grey3)', color: 'var(--mid)',
                      fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 7px',
                    }}>{colTasks.length}</span>
                  </div>

                  {/* Add task shortcut at top of To Do */}
                  {col.id === 'todo' && (
                    <button
                      onClick={() => onCreateTask({ department: deptFilter !== 'all' ? deptFilter as TaskDepartment : undefined })}
                      style={{
                        width: '100%', background: 'transparent',
                        border: '1px dashed var(--grey3)', borderRadius: 8,
                        padding: '8px 12px', color: 'var(--mid)', fontSize: 12,
                        cursor: 'pointer', marginBottom: 8, textAlign: 'left',
                        fontFamily: "'VisbyRound', sans-serif", fontWeight: 700,
                        transition: 'border-color 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C0392B'; e.currentTarget.style.color = '#C0392B' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--grey3)'; e.currentTarget.style.color = 'var(--mid)' }}
                    >
                      + Add task
                    </button>
                  )}

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: 60,
                          borderRadius: 8,
                          padding: snapshot.isDraggingOver ? '4px' : '0',
                          background: snapshot.isDraggingOver ? `${col.color}18` : 'transparent',
                          border: snapshot.isDraggingOver ? `1px dashed ${col.color}66` : '1px solid transparent',
                          transition: 'background 0.15s, border-color 0.15s, padding 0.15s',
                        }}
                      >
                        {colTasks.map((t, index) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            index={index}
                            onStatusChange={changeStatus}
                            onDelete={deleteTask}
                          />
                        ))}
                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && col.id !== 'todo' && (
                          <div style={{
                            border: '1px dashed var(--grey3)', borderRadius: 8,
                            padding: '20px 12px', textAlign: 'center',
                            fontSize: 11, color: 'var(--mid)',
                          }}>
                            Empty
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
